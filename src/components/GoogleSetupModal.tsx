'use client';

import React, { useState } from 'react';
import { 
  X, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  ShieldCheck,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface GoogleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClientId: (clientId: string) => void;
  currentClientId?: string;
}

export default function GoogleSetupModal({
  isOpen,
  onClose,
  onSaveClientId,
  currentClientId = ''
}: GoogleSetupModalProps) {
  const [clientId, setClientId] = useState(currentClientId);
  const [isCopiedOrigin, setIsCopiedOrigin] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    setIsCopiedOrigin(true);
    setTimeout(() => setIsCopiedOrigin(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim()) {
      alert('Mohon masukkan Google Client ID.');
      return;
    }
    onSaveClientId(clientId.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Pengaturan Login Google Asli
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
            Panduan Mendapatkan Google Client ID (2 Menit)
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            Google mewajibkan Client ID agar aplikasi Anda diizinkan menampilkan jendela resmi Google Sign-In.
          </p>
        </div>

        {/* Scrollable Steps Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
          
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">
                Buka Google Cloud Console Credentials
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Buka link berikut di tab baru (login dengan akun Google Anda):
              </p>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>console.cloud.google.com/apis/credentials</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">
                Konfigurasi OAuth Consent Screen
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Jika belum pernah, klik menu <b>OAuth consent screen</b> di kiri:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                <li>Pilih <b>External</b>, lalu klik <b>Create</b>.</li>
                <li>Isi <i>App name</i>: <b>Logbook RSGM UMY</b></li>
                <li>Isi <i>User support email</i>: <b>email Anda</b></li>
                <li>Klik <b>Save and Continue</b> sampai selesai.</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-2 flex-1">
              <p className="font-bold text-slate-900 dark:text-white">
                Buat OAuth Client ID (Web Application)
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Masuk ke <b>Credentials</b> -&gt; <b>Create Credentials</b> -&gt; <b>OAuth client ID</b>:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                <li>Application type: <b>Web application</b></li>
                <li>Name: <b>Logbook Web Client</b></li>
              </ul>

              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1">
                <p className="font-semibold text-blue-900 dark:text-blue-200 text-[11px]">
                  Pada kolom &quot;Authorized JavaScript origins&quot;, tambahkan URL ini:
                </p>
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-[11px]">
                  <span className="truncate">{currentOrigin}</span>
                  <button
                    type="button"
                    onClick={handleCopyOrigin}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-sans font-bold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCopiedOrigin ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Paste Form */}
          <form onSubmit={handleSave} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Langkah 4: Tempelkan Client ID yang Anda dapatkan di sini</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 1234567890-abcdefg.apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Client ID akan tersimpan aman di browser Anda dan langsung mengaktifkan tombol Google resmi.
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Aktifkan Login Google Sekarang</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
