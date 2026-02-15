import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';

import { Toaster as SonnerToaster } from 'sonner';

import { SessionExpirationDialog } from '@/HOCs/CheckSessionExpiration';
import PathTracker from '@/HOCs/withPathTracker';
import { ReactQueryClientProvider } from '@/api/ReactQueryClientProvider';
import BottomBar from '@/components/common/BottomBar';
import { GlobalErrorHandler } from '@/components/common/GlobalErrorHandler';
import RealtimeBootstrap from '@/components/common/RealtimeBootstrap';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.scicommons.org'),
  title: 'SciCommons',
  description: 'Peer-reviewed scientific articles, preprints, and more.',
  openGraph: {
    title: 'SciCommons',
    description: 'Peer-reviewed scientific articles, preprints, and more.',
    url: 'https://www.scicommons.org',
    siteName: 'SciCommons',
    images: [
      {
        url: '/og.png',
        width: 256,
        height: 256,
        alt: 'SciCommons',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#00050d',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'relative bg-common-background')}>
        <ReactQueryClientProvider>
          <GlobalErrorHandler />
          <NextTopLoader showSpinner={false} color="#64e466" shadow={false} />
          <SessionExpirationDialog />
          <PathTracker />
          {/* Fixed by Codex on 2026-02-15
              Who: Codex
              What: Mount realtime logic without rendering the HUD.
              Why: Realtime hook was only mounted by RealtimeStatus; removing it disabled unread dots.
              How: Add a bootstrapper component that calls useRealtime and returns null. */}
          <RealtimeBootstrap />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider delayDuration={10}>
              <main className="flex-grow">{children}</main>
            </TooltipProvider>
          </ThemeProvider>
          {/* Fixed by Codex on 2026-02-10
              Problem: The realtime status badge showed "Disabled" and distracted users.
              Solution: Removed the RealtimeStatus HUD from the global layout render.
              Result: The indicator no longer appears while realtime continues in the background. */}
          <BottomBar />
          <SonnerToaster
            richColors
            position="top-center"
            className="top-16"
            closeButton
            duration={3000}
          />
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
