import React, { ComponentType, useEffect, useRef, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { toast } from 'sonner';

import Loader from '@/components/common/Loader';
import { usePathTracker } from '@/hooks/usePathTracker';
import { useAuthStore } from '@/stores/authStore';

interface WithAuthRedirectProps {
  [key: string]: unknown;
}

interface WithAuthRedirectOptions {
  requireAuth?: boolean;
}

export function withAuthRedirect<P extends WithAuthRedirectProps>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthRedirectOptions = {}
) {
  const WithAuthRedirectComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, initializeAuth, isTokenExpired, logout } = useAuthStore();
    const [isInitializing, setIsInitializing] = useState(true);
    const { getPreviousPath } = usePathTracker();
    const revalidationInFlightRef = useRef(false);
    const skipUnauthToastRef = useRef(false);

    const { requireAuth = false } = options;

    useEffect(() => {
      const initAuth = async () => {
        await initializeAuth();
        setIsInitializing(false);
      };
      initAuth();
    }, [initializeAuth]);

    useEffect(() => {
      if (isInitializing) {
        return;
      }

      const previousPath = getPreviousPath();
      const redirectPath = previousPath && !previousPath.startsWith('/auth') ? previousPath : '/';

      if (requireAuth) {
        if (!isAuthenticated) {
          if (skipUnauthToastRef.current) {
            skipUnauthToastRef.current = false;
            return;
          }
          toast.error('You need to be logged in to view this page');
          router.push('/auth/login');
        } else if (isTokenExpired() && !revalidationInFlightRef.current) {
          /* Fixed by Codex on 2026-02-09
             Problem: Auth guards treated stale server validation as true expiry, logging users out on
             community navigation after the validation interval elapsed.
             Solution: Force a server revalidation on "expired" checks and only logout if auth truly fails.
             Result: Users stay logged in while private/403 community states render correctly. */
          revalidationInFlightRef.current = true;
          void (async () => {
            try {
              await initializeAuth({ forceServerValidation: true });
            } finally {
              revalidationInFlightRef.current = false;
            }

            if (!useAuthStore.getState().isAuthenticated) {
              skipUnauthToastRef.current = true;
              toast.error('Your session has expired. Please log in again.');
              logout();
              router.push('/auth/login');
            }
          })();
        }
      } else if (isAuthenticated && pathname && pathname.startsWith('/auth')) {
        // toast.info('You are already logged in');
        // Redirect authenticated users away from auth pages
        router.push(redirectPath);
      }
    }, [
      isInitializing,
      isAuthenticated,
      router,
      requireAuth,
      isTokenExpired,
      getPreviousPath,
      pathname,
      initializeAuth,
      logout,
    ]);

    if (isInitializing) {
      return <Loader />;
    }

    if (requireAuth && !isAuthenticated) {
      return null;
    }

    if (!requireAuth && isAuthenticated && pathname && pathname.startsWith('/auth')) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthRedirectComponent;
}
