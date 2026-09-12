'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogbook } from '@/context/LogbookContext';
import { PROGRAM_CONFIGS, ProgramType } from '@/types/logbook';
import { 
  BookOpen, 
  PlusCircle, 
  FileText, 
  Settings, 
  LogOut, 
  Cloud, 
  CloudOff, 
  ChevronDown, 
  Layers,
  Menu,
  X,
  Crown,
  Zap,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import UpgradeModal from '@/components/UpgradeModal';
import AddProgramModal from '@/components/AddProgramModal';

export default function Navbar() {
  const pathname = usePathname();
  const { 
    activeProgram, 
    programs,
    switchProgram, 
    programConfig, 
    user, 
    isAuthenticated,
    isAdmin,
    isPro,
    signOut, 
    isCloudConnected 
  } = useLogbook();

  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof document !== 'undefined') {
      if (nextDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  // Auto-display promo upgrade popup for Free tier users shortly after login
  useEffect(() => {
    if (isAuthenticated && !isPro) {
      const hasSeen = sessionStorage.getItem('seen_pro_upgrade_popup');
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsUpgradeOpen(true);
          sessionStorage.setItem('seen_pro_upgrade_popup', 'true');
        }, 900);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, isPro]);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: BookOpen },
    { href: '/new', label: 'Tulis Logbook', icon: PlusCircle },
    { href: '/export', label: 'Cetak & Ekspor', icon: FileText },
    { href: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Program Selector */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  Logbook<span className="text-blue-600 dark:text-blue-400">Flex</span>
                </span>
                <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-1 tracking-wide">
                  Magang • KKN • PKL • Skripsi
                </span>
              </div>
            </Link>

            {/* Switch Program Dropdown (Only if logged in) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsProgramDropdownOpen(!isProgramDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${programConfig.badgeColor} hover:opacity-90`}
                  title="Ganti Mode Program"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{programConfig.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {isProgramDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProgramDropdownOpen(false)} 
                    />
                    <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Pilih Mode Program
                      </div>
                      {Object.keys(programs).map((key) => {
                        const item = programs[key];
                        if (!item) return null;
                        const isActive = activeProgram === key;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              switchProgram(key);
                              setIsProgramDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                              isActive
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <span className="truncate">{item.label}</span>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 ml-2" />}
                          </button>
                        );
                      })}

                      {/* Tombol Tambah Program Khusus Super User */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProgramDropdownOpen(false);
                            setIsAddProgramOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors mt-1 border-t border-slate-100 dark:border-slate-800"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                          <span>+ Tambah Program Baru</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links (Only if logged in) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action: Tier Badge, Admin Badge, Cloud Status & Auth Button */}
          <div className="flex items-center gap-2">
            
            {/* Tier Badge Button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsUpgradeOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm ${
                  isPro
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/20'
                    : 'bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
                title={isPro ? "Akun PRO Aktif (Klik untuk detail)" : "Tier Free - Klik untuk Upgrade ke PRO"}
              >
                {isPro ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PRO</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>FREE</span>
                    <span className="text-[10px] underline font-semibold text-amber-600 dark:text-amber-400">Upgrade</span>
                  </>
                )}
              </button>
            )}

            {/* Admin Badge if naufalfaster@gmail.com */}
            {isAdmin && (
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 shadow-sm animate-in fade-in">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin</span>
              </span>
            )}

            {/* Supabase Status Indicator */}
            {isAuthenticated && (
              <div 
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  isCloudConnected 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' 
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                }`}
                title={isCloudConnected ? "Terkoneksi ke Supabase Cloud" : "Mode Offline/Lokal (Browser Storage Aktif)"}
              >
                {isCloudConnected ? (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Cloud Sync</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5" />
                    <span>Local Storage</span>
                  </>
                )}
              </div>
            )}

            {/* Theme Toggle (Gelap / Terang) */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
              title={isDark ? "Mode Terang" : "Mode Gelap"}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-90 duration-300" />
              )}
            </button>

            {/* Google Login / User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="text-right">
                    <span className="text-xs font-semibold block max-w-[120px] truncate text-slate-800 dark:text-slate-100">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    {isAdmin ? (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block -mt-0.5">
                        Super Admin
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block -mt-0.5">
                        Peserta
                      </span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold border border-white/20">
                    {user.user_metadata?.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      (user.email?.[0] || 'U').toUpperCase()
                    )}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {user.user_metadata?.full_name || 'Pengguna'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <Crown className="w-3 h-3 text-amber-500" />
                            Hak Akses: Super Admin
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          signOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {/* Mobile Hamburger Button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Mobile Theme Toggle */}
          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Mode Tampilan
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  <span>Mode Gelap</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />

      {/* Super User Add Program Modal */}
      <AddProgramModal
        isOpen={isAddProgramOpen}
        onClose={() => setIsAddProgramOpen(false)}
      />
    </header>
  );
}
