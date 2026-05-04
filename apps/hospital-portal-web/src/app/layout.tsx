import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
  title: 'Hospital Portal - Eye Hospital Management System',
  description: 'Complete Hospital Management System with Eye Care Specialization',
  keywords: 'hospital, healthcare, eye care, ophthalmology, optometry, HIPAA',
  authors: [{ name: 'Hospital Portal Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="font-sans">
        {/* Skip link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
