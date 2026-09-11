'use client';

import React, { useState } from 'react';
import { useLogbook } from '@/context/LogbookContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  Check, 
  Sparkles, 
  Crown, 
  QrCode, 
  ShieldCheck, 
  ArrowRight,
  Copy,
  CheckCircle2,
  PhoneCall,
  Flame
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { upgradeToPro, isPro } = useLogbook();
  const [activeTab, setActiveTab] = useState<'comparison' | 'qris'>('comparison');
  const [copiedPrice, setCopiedPrice] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  if (!isOpen) return null;

  const handleInstantActivate = () => {
    setIsActivating(true);
    setTimeout(() => {
      upgradeToPro();
      setIsActivating(false);
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onClose();
      }, 700);
    }, 500);
  };

  const copyAmount = () => {
    navigator.clipboard.writeText('4000');
    setCopiedPrice(true);
    setTimeout(() => setCopiedPrice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header Hero Section */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30">
              <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span>Promo Spesial Mahasiswa</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/25 text-amber-100">
              Masa Aktif 2 Tahun (Rp 4.000)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Tingkatkan ke <span className="underline decoration-yellow-300 decoration-wavy underline-offset-4">Logbook PRO</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
            Bebaskan batas entri, cetak laporan A4 resmi tanpa watermark, dan maksimalkan nilai magang & perkuliahan Anda hanya dengan <b>Rp 4.000 (Berlaku 2 Tahun Penuh)</b>.
          </p>

          {/* Navigation Tab */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'comparison'
                  ? 'bg-white text-slate-900 shadow-md scale-105'
                  : 'bg-black/20 hover:bg-black/30 text-white/90'
              }`}
            >
              Perbandingan Paket (Kelebihan & Kekurangan)
            </button>
            <button
              onClick={() => setActiveTab('qris')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'qris'
                  ? 'bg-white text-slate-900 shadow-md scale-105'
                  : 'bg-black/20 hover:bg-black/30 text-white/90'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600" />
              <span>Bayar via QRIS (Rp 4.000 / 2 Tahun)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {activeTab === 'comparison' ? (
            <>
              {/* Comparison Cards: FREE vs PRO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* FREE TIER CARD (KEKURANGAN) */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Versi Standar</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        Tier FREE
                      </span>
                    </div>

                    <div className="mt-2 mb-3">
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Rp 0</div>
                      <p className="text-[11px] text-slate-400">Gratis tanpa biaya</p>
                    </div>

                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                      Kekurangan & Batasan Free:
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✕</span>
                        <span><b>Dibatasi 15 Entri:</b> Jika sudah 15 hari catatan harian, tidak bisa menambah lagi.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✕</span>
                        <span><b>Watermark Laporan:</b> Ekspor lembar laporan resmi A4 terdapat cap <i>&ldquo;VERSI FREE&rdquo;</i>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✕</span>
                        <span>Hanya bisa mengakses 1 program magang saja.</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-500">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Kalkulasi jam harian & filter kategori tetap aktif.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[11px] text-slate-400">Cocok hanya untuk coba-coba singkat</span>
                  </div>
                </div>

                {/* PRO TIER CARD (KELEBIHAN) */}
                <div className="relative rounded-2xl border-2 border-amber-500 dark:border-amber-400 p-5 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent flex flex-col justify-between space-y-4 shadow-lg shadow-amber-500/10">
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>PILIHAN TERBAIK</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Versi Premium</span>
                      </span>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                        Tier ⭐ PRO
                      </span>
                    </div>

                    <div className="mt-2 mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">Rp 4.000</span>
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">/ 2 Tahun</span>
                        <span className="text-xs line-through text-slate-400">Rp 40.000</span>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-1">
                        ⏱️ Aktif selama 2 tahun penuh (sangat hemat untuk seluruh masa kuliah)!
                      </p>
                    </div>

                    <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                      Kelebihan Lengkap Versi PRO:
                    </div>

                    <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span><b>Masa Aktif 2 Tahun:</b> Tenang tanpa perpanjangan bulanan.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span><b>Entri Unlimited:</b> Catat puluhan hingga ratusan kegiatan tanpa batas.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span><b>Laporan 100% Bersih:</b> Cetak A4 siap kumpul tanpa watermark.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span><b>Akses 5 Program:</b> Bebas pindah ke KKN, PKL, Skripsi, atau Mandiri.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span><b>Ekspor Excel (*.xls):</b> Backup rekapitulasi data sekali klik.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-amber-200 dark:border-amber-800/60">
                    {isPro ? (
                      <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                        ✓ Akun Anda Sudah Aktif Sebagai PRO (2 Tahun)
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveTab('qris')}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Upgrade Sekarang (QRIS Rp 4.000 / 2 Tahun)</span>
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : (
            /* QRIS PAYMENT TAB */
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center gap-6">
                
                {/* QRIS Visual Card */}
                <div className="shrink-0 bg-white p-4 rounded-2xl shadow-md border border-slate-200 text-center w-64">
                  {/* QRIS Header Badge */}
                  <div className="flex items-center justify-between border-b pb-2 mb-3">
                    <div className="text-left">
                      <span className="text-[13px] font-black tracking-tight text-red-600">QRIS</span>
                      <span className="block text-[8px] font-semibold text-slate-400 -mt-1">STANDAR PEMBAYARAN NASIONAL</span>
                    </div>
                    <div className="px-1.5 py-0.5 rounded bg-red-600 text-[9px] font-black text-white">
                      GPN
                    </div>
                  </div>

                  {/* Simulated QR Pattern (High quality visual SVG) */}
                  <div className="relative aspect-square w-full bg-slate-50 rounded-xl border border-slate-200 p-2 flex items-center justify-center">
                    <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      {/* Corner Position Markers */}
                      <path d="M5 5 h25 v25 h-25 z M10 10 v15 h15 v-15 z M14 14 h7 v7 h-7 z" />
                      <path d="M70 5 h25 v25 h-25 z M75 10 v15 h15 v-15 z M79 14 h7 v7 h-7 z" />
                      <path d="M5 70 h25 v25 h-25 z M10 75 v15 h15 v-15 z M14 79 h7 v7 h-7 z" />
                      
                      {/* Inner Matrix Dots Representation */}
                      <rect x="35" y="6" width="5" height="5" />
                      <rect x="45" y="6" width="10" height="5" />
                      <rect x="60" y="6" width="5" height="5" />
                      
                      <rect x="35" y="16" width="8" height="8" />
                      <rect x="48" y="16" width="6" height="5" />
                      <rect x="58" y="16" width="6" height="8" />
                      
                      <rect x="6" y="35" width="15" height="5" />
                      <rect x="25" y="35" width="8" height="5" />
                      <rect x="38" y="35" width="5" height="15" />
                      <rect x="48" y="35" width="12" height="5" />
                      <rect x="65" y="35" width="8" height="5" />
                      <rect x="78" y="35" width="15" height="5" />

                      <rect x="6" y="45" width="8" height="8" />
                      <rect x="18" y="48" width="10" height="5" />
                      <rect x="58" y="45" width="10" height="8" />
                      <rect x="72" y="45" width="8" height="5" />
                      <rect x="85" y="48" width="8" height="8" />

                      <rect x="6" y="58" width="15" height="5" />
                      <rect x="25" y="58" width="5" height="8" />
                      <rect x="35" y="58" width="12" height="5" />
                      <rect x="52" y="58" width="8" height="8" />
                      <rect x="68" y="58" width="12" height="5" />
                      <rect x="85" y="58" width="8" height="5" />

                      <rect x="35" y="68" width="10" height="6" />
                      <rect x="50" y="68" width="6" height="10" />
                      <rect x="62" y="68" width="10" height="6" />
                      <rect x="78" y="68" width="15" height="5" />

                      <rect x="35" y="78" width="5" height="15" />
                      <rect x="45" y="82" width="15" height="5" />
                      <rect x="65" y="78" width="6" height="15" />
                      <rect x="76" y="80" width="8" height="8" />
                      <rect x="88" y="82" width="5" height="10" />

                      {/* Center Accent Badge */}
                      <circle cx="50" cy="50" r="9" fill="white" stroke="#d97706" strokeWidth="2" />
                      <text x="50" y="53" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#d97706">PRO</text>
                    </svg>
                  </div>

                  <div className="mt-2 text-[10px] font-semibold text-slate-700">
                    NMID: ID2026LOGBOOK4K
                  </div>
                  <div className="text-[11px] font-bold text-slate-900">
                    LOGBOOK NAUFAL IRFANSYAH
                  </div>
                </div>

                {/* QRIS Instructions & Details */}
                <div className="space-y-3 flex-1 text-slate-700 dark:text-slate-300">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Langkah Pembayaran Mudah</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Total Pembayaran (2 Tahun):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">Rp 4.000</span>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">2 Tahun</span>
                        <button
                          onClick={copyAmount}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          title="Salin Nominal"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {copiedPrice && (
                      <p className="text-[10px] text-emerald-600 font-semibold text-right">Nominal Rp 4.000 disalin!</p>
                    )}
                  </div>

                  <ol className="text-xs space-y-2 text-slate-600 dark:text-slate-300 list-decimal list-inside font-medium">
                    <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, DANA, ShopeePay, LinkAja).</li>
                    <li>Pilih menu <b>Scan QRIS</b> dan arahkan kamera ke kode QR di samping.</li>
                    <li>Pastikan nama merchant: <b>LOGBOOK NAUFAL IRFANSYAH</b>.</li>
                    <li>Ketikkan nominal pas: <b>Rp 4.000</b> dan selesaikan pembayaran.</li>
                    <li>Setelah transfer berhasil, klik tombol aktivasi di bawah (Akun langsung aktif untuk masa <b>2 Tahun Penuh</b>)!</li>
                  </ol>

                  {/* WhatsApp Support note */}
                  <div className="pt-2">
                    <a
                      href="https://wa.me/6285215900094?text=Halo%20Naufal,%20saya%20sudah%20transfer%20QRIS%20Rp%204.000%20untuk%20aktivasi%20Logbook%20PRO%202%20Tahun"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Kirim bukti transfer ke WhatsApp Naufal (0852-1590-0094)</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* Action Buttons for QRIS */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  disabled={isActivating}
                  onClick={handleInstantActivate}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isActivating ? 'Memverifikasi Pembayaran...' : 'Saya Sudah Bayar (Aktifkan PRO Sekarang)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('comparison')}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Kembali ke Perbandingan
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Garansi akses penuh & garansi kepuasan masa magang</span>
          </span>

          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline font-medium"
          >
            Nanti saja, tetap gunakan versi Free
          </button>
        </div>

      </div>
    </div>
  );
}
