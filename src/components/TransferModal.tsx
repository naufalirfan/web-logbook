'use client';

import React, { useState } from 'react';
import { useLogbook } from '@/context/LogbookContext';
import { 
  ArrowLeftRight, 
  Copy, 
  Download, 
  Upload, 
  CheckCircle2, 
  X, 
  Smartphone, 
  Monitor, 
  Share2,
  FileJson
} from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const { exportBackupJSON, importBackupJSON } = useLogbook();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    const jsonStr = exportBackupJSON();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logbook-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApplyImport = () => {
    setImportError('');
    if (!importText.trim()) {
      setImportError('Mohon tempel kode cadangan logbook.');
      return;
    }

    const success = importBackupJSON(importText.trim());
    if (success) {
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 1500);
    } else {
      setImportError('Format kode cadangan tidak valid atau rusak.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setImportText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#e5e3df] dark:border-[#2e2e2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg notion-badge-sky flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-4 h-4 text-[#0075de] dark:text-[#60a5fa]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1a1a1a] dark:text-white flex items-center gap-1.5">
                <span>Transfer Catatan Antar Perangkat</span>
              </h2>
              <p className="text-[11px] text-[#787671] dark:text-[#787774]">
                Pindahkan isi logbook dari PC ke Android (atau sebaliknya) secara instan.
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

        {/* Tab Switcher */}
        <div className="flex border-b border-[#e5e3df] dark:border-[#2e2e2e] bg-[#f7f6f3] dark:bg-[#262626] p-1">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-white dark:bg-[#1f1f1f] text-[#1a1a1a] dark:text-white shadow-xs'
                : 'text-[#787671] dark:text-[#787774] hover:text-[#1a1a1a] dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Kirim dari Perangkat Ini</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-white dark:bg-[#1f1f1f] text-[#1a1a1a] dark:text-white shadow-xs'
                : 'text-[#787671] dark:text-[#787774] hover:text-[#1a1a1a] dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Terima di Perangkat Ini</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {activeTab === 'export' ? (
            <div className="space-y-3">
              <p className="text-[#5d5b54] dark:text-[#9b9a97] leading-relaxed">
                Salin seluruh data catatan kegiatan Anda saat ini untuk dipindahkan ke HP Android:
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-[#5645d4] hover:bg-[#4534b3] text-white shadow-sm transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Kode Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>1. Salin Kode Data Logbook</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border border-[#c8c4be] dark:border-[#3e3e3e] hover:bg-[#f7f6f3] dark:hover:bg-[#262626] text-[#37352f] dark:text-[#e3e2e0] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File .json</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#f7f6f3] dark:bg-[#262626] border border-[#e5e3df] dark:border-[#383838] space-y-1">
                <div className="font-semibold text-[11px] text-[#37352f] dark:text-[#e3e2e0]">
                  Cara melanjutkan di HP Android:
                </div>
                <ol className="list-decimal list-inside text-[11px] text-[#787671] dark:text-[#787774] space-y-0.5">
                  <li>Buka <b>logbooknaufal.vercel.app</b> di browser HP Android.</li>
                  <li>Klik tombol <b>"Transfer Data"</b> di HP.</li>
                  <li>Pilih tab <b>"Terima di Perangkat Ini"</b>, lalu tempel kode atau upload file.</li>
                  <li>Klik <b>"Terapkan ke Logbook"</b>. Selesai!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[#5d5b54] dark:text-[#9b9a97] leading-relaxed">
                Tempel kode cadangan yang Anda salin dari PC atau unggah file <code>.json</code>:
              </p>

              <div>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Tempel kode data JSON dari PC di sini..."
                  className="w-full p-2.5 text-xs font-mono rounded-lg border border-[#e5e3df] dark:border-[#383838] bg-[#f7f6f3] dark:bg-[#262626] text-[#37352f] dark:text-[#e3e2e0] focus:outline-none focus:border-[#5645d4]"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-[#c8c4be] dark:border-[#3e3e3e] hover:bg-[#f7f6f3] dark:hover:bg-[#262626] rounded-md text-[#37352f] dark:text-[#e3e2e0] transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#5645d4]" />
                  <span>Pilih File .json</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleApplyImport}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-[#1aae39] hover:bg-[#158c2e] text-white shadow-sm transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Terapkan ke Logbook</span>
                </button>
              </div>

              {importSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Data berhasil diimpor! Logbook Anda sekarang sudah terisi sama persis dengan PC.</span>
                </div>
              )}

              {importError && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                  {importError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#e5e3df] dark:border-[#2e2e2e] bg-[#f7f6f3] dark:bg-[#262626] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-medium text-[#787671] hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
