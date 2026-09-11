'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface IndonesianDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  id?: string;
}

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function IndonesianDatePicker({
  value,
  onChange,
  className = '',
  required = false,
  id
}: IndonesianDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize view year & month based on current value or today
  const todayStr = new Date().toISOString().split('T')[0];
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11

  // Synchronize view when external value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close calendar popup on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Select day handler
  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const newDateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange(newDateStr);
    setIsOpen(false);
  };

  // Handle Today click
  const handleSelectToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(todayStr);
    setIsOpen(false);
  };

  // Generate calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  // Selected date components
  let selectedYear = -1;
  let selectedMonth = -1;
  let selectedDay = -1;
  if (value) {
    const parts = value.split('-').map(Number);
    if (parts.length === 3) {
      selectedYear = parts[0];
      selectedMonth = parts[1] - 1;
      selectedDay = parts[2];
    }
  }

  // Today components
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();

  // Format label for input
  const formatDisplayDate = (val: string) => {
    if (!val) return 'Pilih Tanggal';
    try {
      const d = new Date(val + 'T00:00:00');
      if (isNaN(d.getTime())) return val;
      const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
      const dayNum = d.getDate();
      const monthName = INDONESIAN_MONTHS[d.getMonth()];
      const year = d.getFullYear();
      return `${dayName}, ${dayNum} ${monthName} ${year}`;
    } catch {
      return val;
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Clickable Display Field */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm flex items-center justify-between hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-left group shadow-sm"
      >
        <span className="font-medium truncate">
          {formatDisplayDate(value)}
        </span>
        <div className="flex items-center gap-1.5 text-blue-500 group-hover:scale-110 transition-transform shrink-0">
          <CalendarIcon className="w-4 h-4" />
        </div>
      </button>

      {/* Hidden native input for required form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required={required}
          className="sr-only"
          tabIndex={-1}
          onChange={() => {}}
        />
      )}

      {/* Indonesian Calendar Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
          
          {/* Header: Month & Year Controls */}
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
              <span>{INDONESIAN_MONTHS[viewMonth]}</span>
              <span className="text-blue-600 dark:text-blue-400">{viewYear}</span>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Indonesian Day Names Header (Min, Sen, Sel, Rab, Kam, Jum, Sab) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {INDONESIAN_DAYS_SHORT.map((dayName, idx) => (
              <span
                key={dayName}
                className={`text-[11px] font-bold py-1 ${
                  idx === 0 
                    ? 'text-rose-500' // Hari Minggu warna merah
                    : idx === 5 
                    ? 'text-emerald-600 dark:text-emerald-400' // Hari Jumat warna hijau
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous Month Inactive Days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const dayNum = prevMonthDays - firstDayIndex + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="text-xs text-slate-300 dark:text-slate-700 py-1.5 select-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current Month Active Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                viewYear === selectedYear &&
                viewMonth === selectedMonth &&
                dayNum === selectedDay;

              const isToday =
                viewYear === todayYear &&
                viewMonth === todayMonth &&
                dayNum === todayDay;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`text-xs font-semibold py-1.5 rounded-xl transition-all relative ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105 z-10'
                      : isToday
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-300 dark:border-blue-700'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {dayNum}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Actions: Hari Ini & Reset */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline px-1 py-0.5"
            >
              <Sparkles className="w-3 h-3" />
              <span>Pilih Hari Ini</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Tutup
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
