'use client';

import React from 'react';
import { useLogbook } from '@/context/LogbookContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  Check, 
  Sparkles, 
  Crown, 
  Zap, 
  ShieldCheck, 
  FileSpreadsheet, 
  FileCheck,
  Clock,
  Layers
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { upgradeToPro, isPro, user } = useLogbook();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    upgradeToPro();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden">
        
        {/* Header Ambient Glow */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pilihan Paket Akun Logbook</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Upgrade ke <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">Logbook PRO</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
            Dapatkan kapasitas tanpa batas, ekspor laporan resmi tanpa watermark, dan multi-program untuk seluruh masa magang & perkuliahan Anda.
          </p>
        </div>

        {/* Pricing Cards Comparison */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* FREE TIER CARD */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Tier FREE</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  Gratis Selamanya
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
                Rp 0
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Maksimal 15 entri logbook aktif</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Kalkulasi jam harian otomatis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1 mode program aktif</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span className="w-4 text-center">✕</span>
                  <span>Laporan PDF memiliki label watermark</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
              <span className="text-xs text-slate-400 font-medium">
                Paket Standar Mahasiswa
              </span>
            </div>
          </div>

          {/* PRO TIER CARD */}
          <div className="relative rounded-2xl border-2 border-amber-400 dark:border-amber-500 p-5 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent flex flex-col justify-between shadow-lg shadow-amber-500/10">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
              SANGAT DIREKOMENDASIKAN
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  <span>Tier PRO</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  Full Akses
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Unlimited
                </span>
                <span className="text-xs text-slate-400">/ satu semester</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">Entri Kegiatan Unlimited (Tanpa Batas)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Cetak PDF Laporan Resmi <b>BEBAS Watermark</b></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Multi-Program (Magang, KKN, PKL, Skripsi)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Ekspor Excel CSV Lengkap</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Upload Foto Dokumentasi Resolusi Tinggi</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-200 dark:border-amber-800">
              {isPro ? (
                <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                  ✓ Akun Anda Sudah Berstatus PRO
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>Aktifkan Akun PRO Sekarang</span>
                </button>
              )}
            </div>
          </div>

        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          Akun <span className="font-semibold text-amber-600 dark:text-amber-400">naufalfaster@gmail.com</span> otomatis berstatus Lifetime PRO & Super Admin.
        </div>

      </div>
    </div>
  );
}
