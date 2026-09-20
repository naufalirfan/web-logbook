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
  title: 'Logbook By Naufal • Naufal Irfansyah Saputra',
  description: 'Sistem Catatan Harian & Presensi Magang - Logbook By Naufal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-[#191919] text-[#37352f] dark:text-[#e3e2e0] font-sans transition-colors">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <LogbookProvider>
          <Navbar />
          <main className="flex-1">
            <AuthGate>
              {children}
            </AuthGate>
          </main>
          <footer className="border-t border-[#e5e3df] dark:border-[#2e2e2e] py-6 text-center text-xs text-[#787671] dark:text-[#787774] no-print">
            <div className="max-w-7xl mx-auto px-4">
              <p>
                Logbook By{' '}
                <a
                  href="https://www.instagram.com/naufal_irfansyah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#37352f] dark:text-[#e3e2e0] hover:text-[#5645d4] dark:hover:text-[#a78bfa] underline decoration-[#c8c4be] dark:decoration-[#3e3e3e] underline-offset-4 transition-colors"
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
