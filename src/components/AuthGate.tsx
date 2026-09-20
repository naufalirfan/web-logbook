'use client';

import React, { useEffect } from 'react';
import { useLogbook } from '@/context/LogbookContext';
import { 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  Clock, 
  FileSpreadsheet, 
  Lock
} from 'lucide-react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { 
    isAuthenticated, 
    isLoading, 
    signInWithGoogle, 
    loginWithGoogleCredential,
    googleClientId,
    isCloudConnected 
  } = useLogbook();

  // Initialize Google Identity Services if Google Client ID is configured
  useEffect(() => {
    if (typeof window !== 'undefined' && googleClientId) {
      const initGsi = () => {
        interface GoogleAccountsId {
          initialize: (config: { client_id: string; callback: (res: { credential?: string }) => void }) => void;
          renderButton: (container: HTMLElement, options: Record<string, string | number>) => void;
        }
        const googleObj = (window as unknown as { google?: { accounts: { id: GoogleAccountsId } } }).google;
        if (googleObj?.accounts?.id) {
          try {
            googleObj.accounts.id.initialize({
              client_id: googleClientId,
              callback: (response: { credential?: string }) => {
                if (response.credential) {
                  loginWithGoogleCredential(response.credential);
                }
              }
            });

            const btnContainer = document.getElementById('google-real-button-container');
            if (btnContainer) {
              btnContainer.innerHTML = '';
              googleObj.accounts.id.renderButton(btnContainer, {
                theme: 'outline',
                size: 'large',
                width: 340,
                text: 'continue_with',
                shape: 'rectangular',
              });
            }
          } catch (err) {
            console.error('Failed to initialize Google Identity Services:', err);
          }
        }
      };

      // If script is already loaded
      initGsi();

      // Retry after a brief delay if script was still loading
      const timer = setTimeout(initGsi, 1000);
      return () => clearTimeout(timer);
    }
  }, [googleClientId, loginWithGoogleCredential]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#191919]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#37352f] dark:bg-[#e3e2e0] flex items-center justify-center text-white dark:text-[#191919] font-bold text-lg shadow-sm animate-pulse">
            <span>N</span>
          </div>
          <p className="text-xs font-medium text-[#787671] dark:text-[#787774] tracking-wide animate-pulse">
            Memuat Workspace Logbook...
          </p>
        </div>
      </div>
    );
  }

  // If user is already logged in, render the dashboard & protected routes!
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If NOT authenticated, show the Auth Login Gate
  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-10 bg-[#fafaf9] dark:bg-[#191919]">
      
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#37352f] dark:bg-[#e3e2e0] text-white dark:text-[#191919] font-bold text-xl shadow-sm mb-1">
            <span>N</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">
            Logbook <span className="text-[#5645d4] dark:text-[#a78bfa]">By Naufal</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#37352f] dark:text-[#e3e2e0]">
            Naufal Irfansyah Saputra
          </p>
          <p className="text-xs text-[#5d5b54] dark:text-[#9b9a97]">
            Sistem Catatan Harian & Presensi Magang
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] rounded-xl p-6 sm:p-7 shadow-sm space-y-5">
          
          <div className="flex items-center justify-between border-b border-[#e5e3df] dark:border-[#2e2e2e] pb-3">
            <span className="text-xs font-semibold text-[#37352f] dark:text-[#e3e2e0] flex items-center gap-1.5 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-[#5645d4] dark:text-[#a78bfa]" />
              <span>Autentikasi Akses</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded notion-badge-mint">
              {isCloudConnected ? 'Cloud Sync' : 'Akun Resmi'}
            </span>
          </div>

          {/* Primary Google Login Section */}
          <div className="space-y-3 py-1">
            {googleClientId ? (
              <div className="w-full flex justify-center py-1 min-h-[44px]">
                <div id="google-real-button-container" className="w-full flex justify-center" />
              </div>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-md bg-white dark:bg-[#262626] hover:bg-[#f7f6f3] dark:hover:bg-[#303030] text-[#37352f] dark:text-[#e3e2e0] border border-[#c8c4be] dark:border-[#3e3e3e] font-medium text-xs shadow-sm transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            )}
          </div>

          {/* Security & Authentication Info */}
          <div className="notion-callout text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#37352f] dark:text-[#e3e2e0]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1aae39]" />
              <span>Autentikasi Resmi Google OAuth</span>
            </div>
            <p className="text-[11px] text-[#787671] dark:text-[#787774] leading-relaxed">
              Login menggunakan akun Google terverifikasi. Hak akses Super Admin otomatis aktif untuk pemilik (<b>naufalfaster@gmail.com</b>).
            </p>
          </div>

        </div>

        {/* Feature Highlights Footer */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-[11px] text-[#787671] dark:text-[#787774]">
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e]">
            <Layers className="w-4 h-4 mx-auto mb-1 text-[#5645d4] dark:text-[#a78bfa]" />
            <span className="font-semibold block text-[#37352f] dark:text-[#e3e2e0]">5 Mode Program</span>
            <span>Magang / KKN / dll</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e]">
            <Clock className="w-4 h-4 mx-auto mb-1 text-[#0075de] dark:text-[#60a5fa]" />
            <span className="font-semibold block text-[#37352f] dark:text-[#e3e2e0]">Hitung Jam</span>
            <span>Kalkulasi Otomatis</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e]">
            <FileSpreadsheet className="w-4 h-4 mx-auto mb-1 text-[#1aae39] dark:text-[#4ade80]" />
            <span className="font-semibold block text-[#37352f] dark:text-[#e3e2e0]">Cetak & Excel</span>
            <span>Format PDF Resmi</span>
          </div>
        </div>

      </div>
    </div>
  );
}
