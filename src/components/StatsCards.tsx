'use client';

import React from 'react';
import { useLogbook } from '@/context/LogbookContext';
import { Clock, Calendar, CheckCircle2, Building2, UserCheck, TrendingUp } from 'lucide-react';

export default function StatsCards() {
  const { stats, profile, programConfig } = useLogbook();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* 1. Total Jam & Progress */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Jam Kegiatan
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.totalHours}
          </span>
          <span className="text-sm font-medium text-slate-400">
            / {stats.targetHours} Jam
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Target Tercapai</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{stats.progressPercentage}%</span>
        </div>
      </div>

      {/* 2. Hari Aktif Tercatat */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Hari Aktif Tercatat
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.totalDays}
          </span>
          <span className="text-sm font-medium text-slate-400">
            Hari
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Rata-rata {stats.totalDays > 0 ? (stats.totalHours / stats.totalDays).toFixed(1) : 0} jam / hari aktif</span>
        </div>
      </div>

      {/* 3. Status Entri */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Status Entri
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 text-center p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
            <div className="text-lg font-bold">{stats.approvedCount}</div>
            <div className="text-[10px] font-medium uppercase">Disetujui</div>
          </div>
          <div className="flex-1 text-center p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
            <div className="text-lg font-bold">{stats.submittedCount}</div>
            <div className="text-[10px] font-medium uppercase">Diajukan</div>
          </div>
          <div className="flex-1 text-center p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <div className="text-lg font-bold">{stats.draftCount}</div>
            <div className="text-[10px] font-medium uppercase">Draft</div>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 text-center">
          Total {stats.approvedCount + stats.submittedCount + stats.draftCount} laporan kegiatan
        </div>
      </div>

      {/* 4. Mitra & Pembimbing */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {programConfig.partnerLabel}
            </span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-2" title={profile.partnerName}>
            {profile.partnerName || 'Belum diatur'}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
            <span className="line-clamp-1" title={profile.supervisorName}>
              {profile.supervisorName || 'Belum ada pembimbing'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
