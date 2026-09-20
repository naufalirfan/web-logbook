'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLogbook } from '@/context/LogbookContext';
import { LogEntry } from '@/types/logbook';
import { 
  Sparkles, 
  RotateCcw, 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Database,
  FileSearch,
  HardDrive
} from 'lucide-react';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecoveryModal({ isOpen, onClose }: RecoveryModalProps) {
  const { importBackupJSON } = useLogbook();
  const [scanResult, setScanResult] = useState<{
    totalFound: number;
    entries: Record<string, LogEntry[]>;
    details: { key: string; count: number }[];
  }>({ totalFound: 0, entries: {}, details: [] });
  
  const [isRestored, setIsRestored] = useState(false);
  const [restoredCount, setRestoredCount] = useState(0);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const recovered: Record<string, LogEntry[]> = {};
      const seenIds = new Set<string>();
      const details: { key: string; count: number }[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('logbook')) continue;

        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== 'object') continue;

          let keyCount = 0;
          if (Array.isArray(parsed)) {
            parsed.forEach((item: LogEntry) => {
              if (item && item.id && item.title && !seenIds.has(item.id)) {
                const prog = 'magang';
                if (!recovered[prog]) recovered[prog] = [];
                recovered[prog].push(item);
                seenIds.add(item.id);
                keyCount++;
              }
            });
          } else {
            Object.keys(parsed).forEach(progKey => {
              const list = parsed[progKey];
              if (Array.isArray(list)) {
                list.forEach((item: LogEntry) => {
                  if (item && item.id && item.title && !seenIds.has(item.id)) {
                    if (!recovered[progKey]) recovered[progKey] = [];
                    recovered[progKey].push(item);
                    seenIds.add(item.id);
                    keyCount++;
                  }
                });
              }
            });
          }

          if (keyCount > 0) {
            details.push({ key, count: keyCount });
          }
        } catch {
          // ignore
        }
      }

      const totalFound = Object.values(recovered).reduce((acc, arr) => acc + arr.length, 0);
      setScanResult({ totalFound, entries: recovered, details });
      setIsRestored(false);
    }
  }, [isOpen]);

  const allFoundList = useMemo(() => {
    const list: { program: string; entry: LogEntry }[] = [];
    Object.keys(scanResult.entries).forEach(prog => {
      (scanResult.entries[prog] || []).forEach(entry => {
        list.push({ program: prog, entry });
      });
    });
    return list.sort((a, b) => new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime());
  }, [scanResult.entries]);

  if (!isOpen) return null;

  const handleRestoreAll = () => {
    if (allFoundList.length === 0) return;
    importBackupJSON(JSON.stringify({ allEntries: scanResult.entries }));
    setRestoredCount(allFoundList.length);
    setIsRestored(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#e5e3df] dark:border-[#2e2e2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg notion-badge-lavender flex items-center justify-center shrink-0">
              <FileSearch className="w-4 h-4 text-[#5645d4] dark:text-[#a78bfa]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1a1a1a] dark:text-white flex items-center gap-2">
                <span>Pemulihan Catatan Logbook yang Hilang</span>
              </h2>
              <p className="text-[11px] text-[#787671] dark:text-[#787774]">
                Memindai seluruh riwayat penyimpanan peramban (browser) untuk menemukan catatan Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#787671] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0eeec] dark:hover:bg-[#282828] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Storage Locations Scanned */}
          <div className="p-3 rounded-xl bg-[#f7f6f3] dark:bg-[#262626] border border-[#e5e3df] dark:border-[#383838] flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#37352f] dark:text-[#e3e2e0]">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#5645d4] dark:text-[#a78bfa]" />
                Sumber Penyimpanan Browser Terpindai:
              </span>
              <span className="notion-badge-mint px-2 py-0.5 rounded text-[10px] font-semibold">
                {scanResult.totalFound} Catatan Ditemukan
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {scanResult.details.length > 0 ? (
                scanResult.details.map((d) => (
                  <span 
                    key={d.key} 
                    className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-[#1f1f1f] border border-[#e5e3df] dark:border-[#333] text-[#5d5b54] dark:text-[#9b9a97] flex items-center gap-1"
                  >
                    <Database className="w-2.5 h-2.5 text-[#5645d4]" />
                    <span className="font-mono">{d.key}</span>
                    <span className="font-bold text-[#5645d4]">({d.count})</span>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-[#787671]">Belum ada riwayat kunci terdaftar</span>
              )}
            </div>
          </div>

          {/* Success message banner */}
          {isRestored && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Berhasil! {restoredCount} catatan kegiatan telah dipulihkan dan digabungkan ke logbook Anda.</span>
            </div>
          )}

          {/* List of Found Entries */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#787671] dark:text-[#787774] mb-2">
              Daftar Catatan Terdeteksi di Browser ({allFoundList.length}):
            </div>

            {allFoundList.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#e5e3df] dark:border-[#383838] rounded-xl p-4">
                <AlertCircle className="w-6 h-6 text-[#787671] mx-auto mb-2" />
                <p className="font-medium text-[#37352f] dark:text-[#e3e2e0]">
                  Tidak ada catatan tersimpan di peramban ini.
                </p>
                <p className="text-[11px] text-[#787671] dark:text-[#787774] mt-1 max-w-sm mx-auto">
                  Jika sebelumnya Anda menulis menggunakan perangkat atau peramban lain, pastikan membuka situs dari peramban tersebut atau login dengan akun Google yang sama.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {allFoundList.map(({ program, entry }) => (
                  <div 
                    key={entry.id}
                    className="p-2.5 rounded-lg border border-[#e5e3df] dark:border-[#333] bg-white dark:bg-[#1a1a1a] flex items-center justify-between gap-3 hover:border-[#c8c4be] dark:hover:border-[#444] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="notion-badge-lavender px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">
                          {program}
                        </span>
                        <span className="text-[11px] text-[#787671] dark:text-[#787774] flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {entry.date}
                        </span>
                        <span className="text-[11px] text-[#787671] dark:text-[#787774] flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {entry.startTime}-{entry.endTime} ({entry.durationHours}j)
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-[#1a1a1a] dark:text-white truncate">
                        {entry.title}
                      </div>
                      <div className="text-[11px] text-[#787671] dark:text-[#787774] truncate">
                        {entry.category} &bull; {entry.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#e5e3df] dark:border-[#2e2e2e] bg-[#f7f6f3] dark:bg-[#262626] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-[#787671] hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
          >
            Tutup
          </button>

          {allFoundList.length > 0 && (
            <button
              type="button"
              onClick={handleRestoreAll}
              disabled={isRestored}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-[#5645d4] hover:bg-[#4534b3] text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Pulihkan Semua Catatan ke Logbook</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
