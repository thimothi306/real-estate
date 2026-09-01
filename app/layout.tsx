import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/lib/auth-context';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Kavuri Estates — One App for Every Property Need',
    template: '%s | Kavuri Estates',
  },
  description:
    'Find verified villas, apartments, plots, farmhouses, commercial spaces and more across India. Search by lifestyle, not just budget.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // No `h-full` on <html>: a fixed 100% height constrains the document and
    // throws off Lenis's scrollHeight measurements. min-h-screen on <body>
    // keeps the footer pinned to the bottom without capping the page.
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-background">
        <SmoothScrollProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
