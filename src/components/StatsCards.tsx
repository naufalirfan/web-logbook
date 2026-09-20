'use client';

import React from 'react';
import { useLogbook } from '@/context/LogbookContext';
import { Clock, Calendar, CheckCircle2, Building2, UserCheck, TrendingUp } from 'lucide-react';

export default function StatsCards() {
  const { stats, profile, programConfig } = useLogbook();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      
      {/* 1. Total Jam & Progress */}
      <div className="rounded-xl bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] p-4 shadow-sm hover:border-[#c8c4be] dark:hover:border-[#3e3e3e] transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold text-[#787671] dark:text-[#787774] uppercase tracking-wider">
            Total Jam Kegiatan
          </span>
          <div className="w-7 h-7 rounded-md notion-badge-lavender flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-2xl font-bold text-[#1a1a1a] dark:text-white tracking-tight">
            {stats.totalHours}
          </span>
          <span className="text-xs font-normal text-[#787671] dark:text-[#787774]">
            / {stats.targetHours} Jam
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-[#f0eeec] dark:bg-[#282828] h-1.5 rounded-full overflow-hidden mb-2">
          <div 
            className="bg-[#5645d4] dark:bg-[#a78bfa] h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#787671] dark:text-[#787774]">
          <span>Target Tercapai</span>
          <span className="font-semibold text-[#5645d4] dark:text-[#a78bfa]">{stats.progressPercentage}%</span>
        </div>
      </div>

      {/* 2. Hari Aktif Tercatat */}
      <div className="rounded-xl bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] p-4 shadow-sm hover:border-[#c8c4be] dark:hover:border-[#3e3e3e] transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold text-[#787671] dark:text-[#787774] uppercase tracking-wider">
            Hari Aktif Tercatat
          </span>
          <div className="w-7 h-7 rounded-md notion-badge-sky flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-2xl font-bold text-[#1a1a1a] dark:text-white tracking-tight">
            {stats.totalDays}
          </span>
          <span className="text-xs font-normal text-[#787671] dark:text-[#787774]">
            Hari
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#1aae39] dark:text-[#4ade80] font-medium pt-1">
          <TrendingUp className="w-3 h-3" />
          <span>Rata-rata {stats.totalDays > 0 ? (stats.totalHours / stats.totalDays).toFixed(1) : 0} jam / hari</span>
        </div>
      </div>

      {/* 3. Status Entri */}
      <div className="rounded-xl bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] p-4 shadow-sm hover:border-[#c8c4be] dark:hover:border-[#3e3e3e] transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold text-[#787671] dark:text-[#787774] uppercase tracking-wider">
            Status Entri
          </span>
          <div className="w-7 h-7 rounded-md notion-badge-mint flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex-1 text-center py-1 px-1 rounded notion-badge-mint">
            <div className="text-base font-bold leading-tight">{stats.approvedCount}</div>
            <div className="text-[9px] font-semibold uppercase tracking-wider">Setuju</div>
          </div>
          <div className="flex-1 text-center py-1 px-1 rounded notion-badge-peach">
            <div className="text-base font-bold leading-tight">{stats.submittedCount}</div>
            <div className="text-[9px] font-semibold uppercase tracking-wider">Diajukan</div>
          </div>
          <div className="flex-1 text-center py-1 px-1 rounded notion-badge-gray">
            <div className="text-base font-bold leading-tight">{stats.draftCount}</div>
            <div className="text-[9px] font-semibold uppercase tracking-wider">Draft</div>
          </div>
        </div>
        <div className="text-[10px] text-[#787671] dark:text-[#787774] text-center">
          Total {stats.approvedCount + stats.submittedCount + stats.draftCount} entri kegiatan
        </div>
      </div>

      {/* 4. Mitra & Pembimbing */}
      <div className="rounded-xl bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] p-4 shadow-sm hover:border-[#c8c4be] dark:hover:border-[#3e3e3e] transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-[#787671] dark:text-[#787774] uppercase tracking-wider">
              {programConfig.partnerLabel}
            </span>
            <Building2 className="w-3.5 h-3.5 text-[#787671] dark:text-[#787774]" />
          </div>
          <p className="font-semibold text-xs text-[#1a1a1a] dark:text-white line-clamp-1 mb-2" title={profile.partnerName}>
            {profile.partnerName || 'Belum diatur'}
          </p>
        </div>

        <div className="pt-2 border-t border-[#e5e3df] dark:border-[#2e2e2e]">
          <div className="flex items-center gap-1.5 text-[11px] text-[#5d5b54] dark:text-[#9b9a97]">
            <UserCheck className="w-3.5 h-3.5 text-[#5645d4] dark:text-[#a78bfa] shrink-0" />
            <span className="line-clamp-1" title={profile.supervisorName}>
              {profile.supervisorName || 'Belum ada pembimbing'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
