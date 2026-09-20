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
    <header className="sticky top-0 z-40 w-full border-b border-[#e5e3df] dark:border-[#2e2e2e] bg-white/90 dark:bg-[#191919]/90 backdrop-blur-md no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Brand Logo & Program Selector */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#37352f] dark:bg-[#e3e2e0] flex items-center justify-center text-white dark:text-[#191919] shadow-sm group-hover:scale-105 transition-transform font-bold text-sm">
                <span>N</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-semibold text-base tracking-tight text-[#1a1a1a] dark:text-white flex items-center gap-1.5">
                  Logbook<span className="text-[#5645d4] dark:text-[#a78bfa] font-bold">Flex</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-normal bg-[#f0eeec] dark:bg-[#2e2e2e] text-[#5d5b54] dark:text-[#a4a097]">Workspace</span>
                </span>
              </div>
            </Link>

            {/* Switch Program Dropdown (Only if logged in) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsProgramDropdownOpen(!isProgramDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-[#e5e3df] dark:border-[#2e2e2e] bg-[#f7f6f3] dark:bg-[#202020] text-[#37352f] dark:text-[#e3e2e0] hover:bg-[#ede9e4] dark:hover:bg-[#282828] transition-colors"
                  title="Ganti Mode Program"
                >
                  <Layers className="w-3.5 h-3.5 text-[#5645d4] dark:text-[#a78bfa]" />
                  <span>{programConfig.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {isProgramDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProgramDropdownOpen(false)} 
                    />
                    <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#787671] dark:text-[#787774]">
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
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                              isActive
                                ? 'bg-[#e6e0f5] dark:bg-[#5645d4]/20 text-[#5645d4] dark:text-[#c4b5fd] font-medium'
                                : 'text-[#37352f] dark:text-[#e3e2e0] hover:bg-[#f0eeec] dark:hover:bg-[#262626]'
                            }`}
                          >
                            <span className="truncate">{item.label}</span>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#5645d4] dark:bg-[#a78bfa] shrink-0 ml-2" />}
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
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-[#d95b00] dark:text-[#fb923c] hover:bg-[#ffe8d4] dark:hover:bg-[#d95b00]/20 rounded-md transition-colors mt-1 border-t border-[#e5e3df] dark:border-[#2e2e2e]"
                        >
                          <Crown className="w-3.5 h-3.5" />
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#f0eeec] dark:bg-[#262626] text-[#1a1a1a] dark:text-white font-semibold'
                        : 'text-[#5d5b54] dark:text-[#9b9a97] hover:bg-[#f7f6f3] dark:hover:bg-[#202020] hover:text-[#1a1a1a] dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all hover:opacity-90 active:scale-95 ${
                  isPro
                    ? 'bg-[#ffe8d4] dark:bg-[#d95b00]/25 text-[#d95b00] dark:text-[#fb923c] border border-[#c8c4be] dark:border-[#3e3e3e]'
                    : 'bg-[#5645d4] hover:bg-[#4534b3] text-white shadow-sm'
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
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    <span>FREE</span>
                    <span className="text-[10px] underline font-semibold ml-0.5">Upgrade</span>
                  </>
                )}
              </button>
            )}

            {/* Admin Badge if naufalfaster@gmail.com */}
            {isAdmin && (
              <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#ffe8d4] text-[#d95b00] dark:bg-[#d95b00]/25 dark:text-[#fb923c] border border-[#c8c4be] dark:border-[#3e3e3e]">
                <Crown className="w-3 h-3" />
                <span>Admin</span>
              </span>
            )}

            {/* Supabase Status Indicator */}
            {isAuthenticated && (
              <div 
                className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                  isCloudConnected 
                    ? 'bg-[#d9f3e1] dark:bg-[#1aae39]/20 text-[#1aae39] dark:text-[#4ade80] border-[#c8c4be] dark:border-[#3e3e3e]' 
                    : 'bg-[#fef7d6] dark:bg-[#f5d75e]/20 text-[#8c6b00] dark:text-[#facc15] border-[#c8c4be] dark:border-[#3e3e3e]'
                }`}
                title={isCloudConnected ? "Terkoneksi ke Supabase Cloud" : "Mode Offline/Lokal (Browser Storage Aktif)"}
              >
                {isCloudConnected ? (
                  <>
                    <Cloud className="w-3 h-3" />
                    <span>Cloud</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3 h-3" />
                    <span>Lokal</span>
                  </>
                )}
              </div>
            )}

            {/* Theme Toggle (Gelap / Terang) */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
              title={isDark ? "Mode Terang" : "Mode Gelap"}
              className="p-1.5 rounded-md text-[#5d5b54] dark:text-[#9b9a97] hover:bg-[#f0eeec] dark:hover:bg-[#262626] transition-colors border border-[#e5e3df] dark:border-[#2e2e2e]"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-[#5d5b54] animate-in spin-in-90 duration-300" />
              )}
            </button>

            {/* Google Login / User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-md border border-[#e5e3df] dark:border-[#2e2e2e] bg-[#f7f6f3] dark:bg-[#202020] hover:bg-[#ede9e4] dark:hover:bg-[#282828] transition-colors"
                >
                  <div className="text-right">
                    <span className="text-xs font-medium block max-w-[110px] truncate text-[#37352f] dark:text-[#e3e2e0]">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    {isAdmin ? (
                      <span className="text-[10px] font-semibold text-[#d95b00] dark:text-[#fb923c] block -mt-0.5">
                        Admin
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#787671] dark:text-[#787774] block -mt-0.5">
                        Peserta
                      </span>
                    )}
                  </div>
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-[#5645d4] text-white flex items-center justify-center text-xs font-medium">
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
                    <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-2 border-b border-[#e5e3df] dark:border-[#2e2e2e] mb-1">
                        <p className="text-xs font-semibold text-[#37352f] dark:text-[#e3e2e0] truncate">
                          {user.user_metadata?.full_name || 'Pengguna'}
                        </p>
                        <p className="text-[11px] text-[#787671] dark:text-[#787774] truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#ffe8d4] text-[#d95b00] dark:bg-[#d95b00]/25 dark:text-[#fb923c]">
                            <Crown className="w-3 h-3" />
                            Hak Akses: Super Admin
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          signOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
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
        <div className="md:hidden border-t border-[#e5e3df] dark:border-[#2e2e2e] bg-white dark:bg-[#191919] px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#f0eeec] dark:bg-[#262626] text-[#1a1a1a] dark:text-white font-semibold'
                    : 'text-[#5d5b54] dark:text-[#9b9a97] hover:bg-[#f7f6f3] dark:hover:bg-[#202020]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Mobile Theme Toggle */}
          <div className="pt-2 mt-2 border-t border-[#e5e3df] dark:border-[#2e2e2e] flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-[#787671] dark:text-[#787774]">
              Mode Tampilan
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#f7f6f3] dark:bg-[#202020] text-[#37352f] dark:text-[#e3e2e0] border border-[#e5e3df] dark:border-[#2e2e2e] active:scale-95 transition-all"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#5d5b54]" />
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
