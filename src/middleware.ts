import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'fa'],
  defaultLocale: 'fa',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};