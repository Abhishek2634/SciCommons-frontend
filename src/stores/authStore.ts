import Cookies from 'js-cookie';
import { create } from 'zustand';

import { clearRegisteredQueryCache } from '@/api/queryClientRegistry';

export interface AuthenticatedUserType {
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: number | null;
  user: AuthenticatedUserType | null;
  setAccessToken: (token: string, user: AuthenticatedUserType) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  isTokenExpired: () => boolean;
  getUser: () => AuthenticatedUserType | null;
}

const AUTH_COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 1 day

const getExpiresAtFromToken = (token: string): number | null => {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload?.exp || typeof payload.exp !== 'number') return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  isAuthenticated: false,
  accessToken: null,
  expiresAt: null,
  user: null,
  setAccessToken: (token: string, user: AuthenticatedUserType) => {
    const expiresAt = getExpiresAtFromToken(token) ?? Date.now() + TOKEN_EXPIRATION_TIME;
    Cookies.set(AUTH_COOKIE_NAME, token, { secure: true, sameSite: 'strict' });
    Cookies.set('expiresAt', expiresAt.toString(), { secure: true, sameSite: 'strict' });
    set(() => ({
      isAuthenticated: true,
      accessToken: token,
      expiresAt,
      user,
    }));
  },
  logout: () => {
    Cookies.remove(AUTH_COOKIE_NAME);
    Cookies.remove('expiresAt');
    clearRegisteredQueryCache();
    set(() => ({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      user: null,
    }));
  },
  initializeAuth: async () => {
    const cookieToken = Cookies.get(AUTH_COOKIE_NAME);
    const cookieExpiresAt = Cookies.get('expiresAt');

    if (!cookieToken || !cookieExpiresAt) {
      set({
        isAuthenticated: false,
        accessToken: null,
        expiresAt: null,
        user: null,
      });
      return;
    }

    const expiresAt = Number.parseInt(cookieExpiresAt, 10);
    if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
      Cookies.remove(AUTH_COOKIE_NAME);
      Cookies.remove('expiresAt');
      set({
        isAuthenticated: false,
        accessToken: null,
        expiresAt: null,
        user: null,
      });
      return;
    }

    set({
      isAuthenticated: true,
      accessToken: cookieToken,
      expiresAt,
    });
  },
  isTokenExpired: () => {
    const { expiresAt } = get();
    return expiresAt ? Date.now() >= expiresAt : true;
  },
  getUser: () => get().user,
}));
