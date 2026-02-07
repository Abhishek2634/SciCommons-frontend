import { isProtectedPathname, middleware } from '@/middleware';

jest.mock('next/server', () => ({
  NextResponse: {
    next: () => ({ status: 200, headers: new Headers() }),
    redirect: (url: URL) => ({
      status: 307,
      headers: new Headers({ location: url.toString() }),
    }),
  },
}));

describe('middleware route protection', () => {
  it('marks protected routes correctly', () => {
    expect(isProtectedPathname('/submitarticle')).toBe(true);
    expect(isProtectedPathname('/community/abc/dashboard')).toBe(true);
    expect(isProtectedPathname('/article/test-slug/settings')).toBe(true);
    expect(isProtectedPathname('/')).toBe(false);
    expect(isProtectedPathname('/auth/login')).toBe(false);
  });

  it('redirects protected routes without auth cookie', () => {
    const request = {
      url: 'https://www.scicommons.org/submitarticle',
      nextUrl: {
        pathname: '/submitarticle',
        search: '',
      },
      cookies: {
        get: jest.fn().mockReturnValue(undefined),
      },
    } as any;

    const response = middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://www.scicommons.org/auth/login?redirect=%2Fsubmitarticle'
    );
  });

  it('allows protected routes with auth cookie', () => {
    const request = {
      url: 'https://www.scicommons.org/community/a/dashboard',
      nextUrl: {
        pathname: '/community/a/dashboard',
        search: '',
      },
      cookies: {
        get: jest.fn().mockReturnValue({ value: 'token' }),
      },
    } as any;

    const response = middleware(request);
    expect(response.status).toBe(200);
  });
});
