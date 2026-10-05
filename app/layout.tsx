import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Sherlock Web - OSINT Username Finder',
  description: 'Search usernames across hundreds of social media platforms.',
  applicationName: 'Sherlock Web',
  appleWebApp: {
    title: 'Sherlock Web',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'Sherlock Web',
    description: 'OSINT Username Finder - Search usernames across hundreds of social media platforms.',
    url: 'https://sherlock-web.vercel.app',
    siteName: 'Sherlock Web',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sherlock Web',
    description: 'Search usernames across hundreds of social media platforms.',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans dark", inter.variable, spaceGrotesk.variable)}>
      <body suppressHydrationWarning className="antialiased min-h-screen">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
