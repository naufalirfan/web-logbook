'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLogbook } from '@/context/LogbookContext';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Calendar, 
  Building2, 
  UserCheck, 
  FileSpreadsheet,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

export default function ExportPage() {
  const { entries, profile, programConfig, stats, isPro } = useLogbook();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filtered entries for export
  const exportEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchStart = !startDate || e.date >= startDate;
      const matchEnd = !endDate || e.date <= endDate;
      const matchStatus = filterStatus === 'all' || e.status === filterStatus;
      return matchStart && matchEnd && matchStatus;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries, startDate, endDate, filterStatus]);

  const totalExportHours = Number(
    exportEntries.reduce((acc, curr) => acc + (curr.durationHours || 0), 0).toFixed(1)
  );

  // Export to CSV / Excel Function
  const exportToCSV = () => {
    if (exportEntries.length === 0) {
      alert('Tidak ada data entri untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'Tanggal',
      'Jam Mulai',
      'Jam Selesai',
      'Durasi (Jam)',
      'Kategori',
      'Judul Kegiatan',
      'Deskripsi Aktivitas',
      'Capaian / Hasil',
      'Status',
      'Catatan Pembimbing'
    ];

    const rows = exportEntries.map((e, idx) => [
      idx + 1,
      `"${e.date}"`,
      `"${e.startTime}"`,
      `"${e.endTime}"`,
      e.durationHours,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${(e.achievements || '').replace(/"/g, '""')}"`,
      `"${e.status}"`,
      `"${(e.supervisorFeedback || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Logbook_${programConfig.id}_${profile.fullName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Top Action Bar (Hidden during Print) */}
      <div className="no-print space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${programConfig.badgeColor}`}>
            Program: {programConfig.label}
          </span>
        </div>

        {/* Control Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-500" />
              <span>Rekap & Ekspor Laporan Resmi</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cetak laporan bertanda tangan atau unduh file CSV untuk Microsoft Excel / Google Sheets.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={exportToCSV}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export ke Excel (CSV)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF Laporan</span>
            </button>
          </div>
        </div>

        {/* Filters Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Dari Tanggal:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Sampai Tanggal:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="approved">Hanya Disetujui</option>
              <option value="submitted">Diajukan & Disetujui</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* OFFICIAL PRINTABLE REPORT SHEET (A4 Standard)           */}
      {/* ======================================================== */}
      <div className="print-container bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-sm text-slate-900 dark:text-slate-100 print:text-black print:dark:text-black print:bg-white print:dark:bg-white print:border-none print:p-0">
        
        {/* Letterhead / KOP Laporan */}
        <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 print:border-black pb-4 mb-6">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide">
            LAPORAN AKTIVITAS LOGBOOK HARIAN
          </h2>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 print:text-gray-700 mt-0.5">
            {profile.programTitle || programConfig.label}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 print:text-gray-600 mt-1">
            {profile.institution} • Periode: {profile.startDate || '2026'} s/d {profile.endDate || '2026'}
          </p>
        </div>

        {/* Identitas Peserta & Pembimbing */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 print:bg-gray-50 border border-slate-200 dark:border-slate-700 print:border-gray-300">
          <div className="space-y-1.5">
            <div>
              <span className="text-slate-500 dark:text-slate-400 print:text-gray-600">Nama Mahasiswa / Peserta:</span>
              <p className="font-bold text-slate-900 dark:text-white print:text-black">{profile.fullName}</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 print:text-gray-600">NIM / NIS / ID:</span>
              <p className="font-semibold">{profile.nim || '-'}</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 print:text-gray-600">Institusi Asal:</span>
              <p className="font-semibold">{profile.institution || '-'}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div>
              <span className="text-slate-500 dark:text-slate-400 print:text-gray-600">{programConfig.partnerLabel}:</span>
              <p className="font-bold text-slate-900 dark:text-white print:text-black">{profile.partnerName || '-'}</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 print:text-gray-600">{programConfig.supervisorLabel}:</span>
              <p className="font-semibold">{profile.supervisorName || '-'}</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 print:text-gray-600">Total Akumulasi Jam:</span>
              <p className="font-bold text-blue-600 dark:text-blue-400 print:text-black">{totalExportHours} Jam (Target: {profile.targetHours} Jam)</p>
            </div>
          </div>
        </div>

        {/* Tabel Logbook Resmi */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-xs border-collapse border border-slate-300 dark:border-slate-700 print:border-gray-400">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 print:bg-gray-200 text-slate-800 dark:text-slate-200 print:text-black font-bold">
                <th className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 w-8 text-center">No</th>
                <th className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 w-24">Tanggal</th>
                <th className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 w-24">Waktu & Jam</th>
                <th className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 w-28">Kategori</th>
                <th className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5">Aktivitas & Capaian</th>
                <th className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 w-24 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {exportEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-slate-300 dark:border-slate-700 p-6 text-center text-slate-400">
                    Tidak ada catatan kegiatan pada filter ini.
                  </td>
                </tr>
              ) : (
                exportEntries.map((e, idx) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 print:hover:bg-transparent">
                    <td className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 text-center font-medium">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 whitespace-nowrap">
                      {e.date}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 whitespace-nowrap">
                      <div>{e.startTime} - {e.endTime}</div>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 print:text-black">
                        ({e.durationHours} Jam)
                      </span>
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 font-medium">
                      {e.category}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5">
                      <p className="font-bold text-slate-900 dark:text-white print:text-black mb-1">
                        {e.title}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 print:text-gray-800 whitespace-pre-line leading-relaxed mb-1">
                        {e.description}
                      </p>
                      {e.achievements && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-300 print:text-gray-700 italic">
                          Hasil: {e.achievements}
                        </p>
                      )}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 text-center uppercase text-[10px] font-bold">
                      {e.status === 'approved' ? 'Disetujui' : e.status === 'submitted' ? 'Diajukan' : 'Draft'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800 print:bg-gray-100 font-bold">
                <td colSpan={2} className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 text-right">
                  Total Terakumulasi:
                </td>
                <td className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 font-bold text-blue-600 dark:text-blue-400 print:text-black">
                  {totalExportHours} Jam
                </td>
                <td colSpan={3} className="border border-slate-300 dark:border-slate-700 print:border-gray-400 p-2.5 text-slate-500 print:text-gray-600 text-[10px]">
                  {exportEntries.length} Aktivitas Tercatat
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Kolom Tanda Tangan Resmi */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 print:border-gray-300 break-inside-avoid">
          <div>
            <p className="text-slate-500 dark:text-slate-400 print:text-gray-600 mb-16">
              Peserta / Mahasiswa,
            </p>
            <p className="font-bold underline text-slate-900 dark:text-white print:text-black">
              {profile.fullName}
            </p>
            <p className="text-[10px] text-slate-500 print:text-gray-600">NIM: {profile.nim || '________________'}</p>
          </div>

          <div>
            <p className="text-slate-500 dark:text-slate-400 print:text-gray-600 mb-16">
              {programConfig.supervisorLabel},
            </p>
            <p className="font-bold underline text-slate-900 dark:text-white print:text-black">
              {profile.supervisorName || '________________________'}
            </p>
            <p className="text-[10px] text-slate-500 print:text-gray-600">NIP/ID: ________________</p>
          </div>

          <div className="hidden sm:block">
            <p className="text-slate-500 dark:text-slate-400 print:text-gray-600 mb-16">
              Koordinator Program / DPL,
            </p>
            <p className="font-bold underline text-slate-900 dark:text-white print:text-black">
              ( .................................................. )
            </p>
            <p className="text-[10px] text-slate-500 print:text-gray-600">NIP: ________________</p>
          </div>
        </div>

        {/* Watermark / Edition Line */}
        <div className="mt-8 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 print:border-gray-300 text-center text-[10px] text-slate-400 print:text-gray-400">
          {isPro ? (
            <span>✓ Dokumen Resmi Terverifikasi • Logbook PRO Edition (Bebas Watermark)</span>
          ) : (
            <span>Dokumen Logbook Versi FREE • Upgrade ke PRO untuk menghapus watermark & akses fitur penuh</span>
          )}
        </div>

      </div>

    </div>
  );
}
