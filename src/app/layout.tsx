import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { LogbookProvider } from '@/context/LogbookContext';
import Navbar from '@/components/Navbar';
import AuthGate from '@/components/AuthGate';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Logbook Magang RSGM UMY • Naufal Irfansyah Saputra',
  description: 'Logbook Praktik Magang Laboratorium Teknik Gigi di RSGM UMY - Naufal Irfansyah Saputra (Poltekkes Tanjungkarang D3 Teknik Gigi)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <LogbookProvider>
          <Navbar />
          <main className="flex-1">
            <AuthGate>
              {children}
            </AuthGate>
          </main>
          <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 no-print">
            <div className="max-w-7xl mx-auto px-4">
              <p>
                Logbook By{' '}
                <a
                  href="https://www.instagram.com/naufal_irfansyah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4 transition-colors"
                >
                  Naufal Irfansyah Saputra
                </a>{' '}
                {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </LogbookProvider>
      </body>
    </html>
  );
}
