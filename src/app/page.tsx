'use client';

import React from 'react';
import Link from 'next/link';
import { useLogbook } from '@/context/LogbookContext';
import StatsCards from '@/components/StatsCards';
import LogbookTable from '@/components/LogbookTable';
import { PROGRAM_CONFIGS, ProgramType } from '@/types/logbook';
import { 
  Plus, 
  FileText, 
  Settings, 
  Sparkles, 
  Calendar, 
  Layers,
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, activeProgram, switchProgram, programConfig } = useLogbook();

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{programConfig.label}</span>
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{todayFormatted}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {profile.programTitle || `Logbook ${programConfig.label}`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
              {profile.fullName} ({profile.nim || 'NIM belum diatur'}) • {profile.institution}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/export"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Rekap & Cetak</span>
            </Link>

            <Link
              href="/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tulis Logbook</span>
            </Link>
          </div>

        </div>

        {/* Ambient Glow background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Program Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-2">
          Mode Program:
        </span>
        {(Object.keys(PROGRAM_CONFIGS) as ProgramType[]).map((key) => {
          const item = PROGRAM_CONFIGS[key];
          const isSelected = activeProgram === key;
          return (
            <button
              key={key}
              onClick={() => switchProgram(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Stats Overview Cards */}
      <StatsCards />

      {/* 4. Logbook Table & Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Riwayat Aktivitas Harian
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daftar kegiatan yang telah dicatat dan status verifikasinya.
            </p>
          </div>
        </div>

        <LogbookTable />
      </div>

    </div>
  );
}
