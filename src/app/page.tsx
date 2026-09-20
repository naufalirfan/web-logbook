'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLogbook } from '@/context/LogbookContext';
import StatsCards from '@/components/StatsCards';
import LogbookTable from '@/components/LogbookTable';
import AddProgramModal from '@/components/AddProgramModal';
import { 
  Plus, 
  FileText, 
  Settings, 
  Sparkles, 
  Calendar, 
  Layers,
  CheckCircle,
  HelpCircle,
  Clock,
  Crown
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, activeProgram, switchProgram, programConfig, programs, isAdmin } = useLogbook();
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getProgramIcon = (type: string) => {
    switch (type) {
      case 'internship': return '🩺';
      case 'kkn': return '🌾';
      case 'pkl': return '💼';
      case 'skripsi': return '🎓';
      case 'project': return '🚀';
      default: return '📋';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* 1. Notion Minimalist Page Header */}
      <div className="space-y-4 pt-2">
        
        {/* Cover Strip / Top Accent */}
        <div className="h-24 sm:h-32 w-full rounded-xl bg-gradient-to-r from-[#ffe8d4]/60 via-[#e6e0f5]/60 to-[#dcecfa]/60 dark:from-[#2a223a] dark:via-[#1e2333] dark:to-[#1c2a26] border border-[#e5e3df] dark:border-[#2e2e2e] relative overflow-hidden" />

        <div className="relative -mt-12 sm:-mt-14 px-2 sm:px-4 space-y-4">
          
          {/* Notion Page Icon & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            
            <div className="flex items-end gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-[#202020] border-2 border-[#e5e3df] dark:border-[#2e2e2e] shadow-md flex items-center justify-center text-3xl sm:text-4xl select-none">
                {getProgramIcon(activeProgram)}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <span className="notion-badge-lavender px-2 py-0.5 rounded text-[11px] font-semibold">
                    {programConfig.label}
                  </span>
                  <span className="text-[11px] text-[#787671] dark:text-[#787774] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{todayFormatted}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Notion Pill Style */}
            <div className="flex items-center gap-2">
              <Link
                href="/export"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium border border-[#c8c4be] dark:border-[#3e3e3e] bg-white dark:bg-[#202020] hover:bg-[#f7f6f3] dark:hover:bg-[#262626] text-[#37352f] dark:text-[#e3e2e0] transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#5645d4] dark:text-[#a78bfa]" />
                <span>Rekap & Cetak</span>
              </Link>

              <Link
                href="/new"
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-[#5645d4] hover:bg-[#4534b3] text-white shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tulis Logbook</span>
              </Link>
            </div>

          </div>

          {/* Page Title & Metadata */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">
              {profile.programTitle || `Logbook ${programConfig.label}`}
            </h1>
            <p className="text-xs sm:text-sm text-[#787671] dark:text-[#787774]">
              <span className="font-medium text-[#37352f] dark:text-[#e3e2e0]">{profile.fullName}</span> ({profile.nim || 'NIM belum diatur'}) • {profile.institution}
            </p>
          </div>

          {/* Notion Callout Box */}
          <div className="notion-callout flex items-start gap-3">
            <span className="text-lg select-none">💡</span>
            <div className="text-xs text-[#5d5b54] dark:text-[#9b9a97] space-y-0.5 leading-relaxed">
              <p className="font-medium text-[#37352f] dark:text-[#e3e2e0]">
                Workspace {programConfig.label} aktif untuk mitra <span className="font-semibold">{profile.partnerName || 'Mitra belum diatur'}</span>.
              </p>
              <p>
                Dosen / Pembimbing: <span className="text-[#1a1a1a] dark:text-white font-medium">{profile.supervisorName || 'Belum diatur'}</span>. Pastikan entri kegiatan selalu diperbarui dan diajukan untuk verifikasi berkala.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Notion Database View Tabs (Program Switcher) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#e5e3df] dark:border-[#2e2e2e]">
        <span className="text-[11px] font-semibold text-[#787671] dark:text-[#787774] uppercase tracking-wider whitespace-nowrap mr-1 px-1">
          Views:
        </span>
        {Object.keys(programs).map((key) => {
          const item = programs[key];
          if (!item) return null;
          const isSelected = activeProgram === key;
          return (
            <button
              key={key}
              onClick={() => switchProgram(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-[#37352f] dark:bg-[#e3e2e0] text-white dark:text-[#191919] font-semibold shadow-sm'
                  : 'text-[#5d5b54] dark:text-[#9b9a97] hover:bg-[#f0eeec] dark:hover:bg-[#262626] font-medium'
              }`}
            >
              <span>{getProgramIcon(key)}</span>
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Tombol Tambah Program Super User */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsAddProgramOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap text-[#d95b00] dark:text-[#fb923c] hover:bg-[#ffe8d4] dark:hover:bg-[#d95b00]/20 transition-colors ml-1"
            title="Tambah Program Kustom Baru (Super User)"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>+ Tambah View</span>
          </button>
        )}
      </div>

      {/* 3. Stats Overview Cards */}
      <StatsCards />

      {/* 4. Logbook Table & Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1a1a1a] dark:text-white flex items-center gap-2">
              <span>📋</span>
              <span>Riwayat Aktivitas Harian</span>
            </h2>
            <p className="text-xs text-[#787671] dark:text-[#787774]">
              Database catatan kegiatan dan status verifikasi pembimbing.
            </p>
          </div>
        </div>

        <LogbookTable />
      </div>

      {/* Super User Add Program Modal */}
      <AddProgramModal
        isOpen={isAddProgramOpen}
        onClose={() => setIsAddProgramOpen(false)}
      />
    </div>
  );
}
