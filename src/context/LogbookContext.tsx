'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LogEntry, 
  UserProfile, 
  ProgramType, 
  DefaultProgramType,
  ProgramConfig,
  UserTier, 
  PROGRAM_CONFIGS, 
  isUserAdmin,
  FREE_TIER_LIMITS
} from '@/types/logbook';
import { DEFAULT_PROFILES, DEFAULT_ENTRIES } from '@/lib/initialData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { parseGoogleJwt } from '@/lib/googleAuth';
import type { User } from '@supabase/supabase-js';

interface LogbookContextType {
  activeProgram: ProgramType;
  programs: Record<string, ProgramConfig>;
  profile: UserProfile;
  entries: LogEntry[];
  allEntries: Record<string, LogEntry[]>;
  programConfig: ProgramConfig;
  isLoading: boolean;
  isCloudConnected: boolean;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPro: boolean;
  userTier: UserTier;
  maxFreeEntries: number;
  canAddEntry: boolean;
  upgradeToPro: () => void;
  switchProgram: (type: ProgramType) => void;
  addCustomProgram: (config: Omit<ProgramConfig, 'id'> & { id?: string }) => Promise<void>;
  deleteCustomProgram: (id: string) => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => void;
  addEntry: (entry: Omit<LogEntry, 'id' | 'createdAt'>) => Promise<LogEntry>;
  updateEntry: (id: string, updated: Partial<LogEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  reviewEntry: (id: string, status: 'approved' | 'submitted' | 'draft', feedback?: string) => Promise<void>;
  restoreDefaultEntries: (programOnly?: boolean) => void;
  syncWithCloud: () => Promise<{ success: boolean; uploaded: number; downloaded: number; message?: string }>;
  exportBackupJSON: () => string;
  importBackupJSON: (jsonString: string) => boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithGoogleCredential: (token: string) => boolean | Promise<boolean>;
  googleClientId: string;
  setGoogleClientId: (id: string) => void;
  signInAsAdmin: () => void;
  signInAsDemoUser: () => void;
  signOut: () => Promise<void>;
  stats: {
    totalHours: number;
    targetHours: number;
    progressPercentage: number;
    totalDays: number;
    approvedCount: number;
    submittedCount: number;
    draftCount: number;
    categoryCounts: Record<string, number>;
  };
}

const LogbookContext = createContext<LogbookContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACTIVE_PROGRAM: 'logbook_active_program',
  ACTIVE_USER: 'logbook_active_user',
  CUSTOM_PROGRAMS: 'logbook_custom_programs',
};

// User-scoped LocalStorage Key Helpers
const getUserStorageKey = (prefix: string, currentUser: User | null): string => {
  if (!currentUser) return `${prefix}_guest`;
  const sanitizedId = currentUser.id || currentUser.email?.replace(/[^a-zA-Z0-9]/g, '_') || 'user';
  return `${prefix}_${sanitizedId}`;
};

// Generate default profile structure for a given user
const createInitialProfilesForUser = (targetUser: User | null, allPrograms: Record<string, ProgramConfig>): Record<string, UserProfile> => {
  if (!targetUser) {
    return DEFAULT_PROFILES;
  }

  const isSuper = isUserAdmin(targetUser.email);
  const baseName = targetUser.user_metadata?.full_name || targetUser.user_metadata?.name || targetUser.email?.split('@')[0] || 'Pengguna';
  const baseAvatar = targetUser.user_metadata?.avatar_url || targetUser.user_metadata?.picture || '';
  const email = targetUser.email || '';

  if (isSuper) {
    return {
      ...DEFAULT_PROFILES,
      magang: {
        ...DEFAULT_PROFILES.magang,
        id: targetUser.id,
        email: email,
        fullName: 'Naufal Irfansyah Saputra',
        nim: '2412401021',
        avatarUrl: baseAvatar || DEFAULT_PROFILES.magang.avatarUrl,
        role: 'admin',
        tier: 'pro'
      }
    };
  }

  const result: Record<string, UserProfile> = {};
  Object.keys(allPrograms).forEach((key) => {
    const config = allPrograms[key];
    result[key] = {
      id: targetUser.id,
      email: email,
      fullName: baseName,
      nim: '',
      avatarUrl: baseAvatar,
      programType: key,
      programTitle: `Logbook ${config?.label || key}`,
      institution: '',
      partnerName: '',
      supervisorName: '',
      supervisorContact: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      targetHours: config?.suggestedTargetHours || 300,
      role: 'user',
      tier: 'free'
    };
  });

  return result;
};

export function LogbookProvider({ children }: { children: React.ReactNode }) {
  const [activeProgram, setActiveProgram] = useState<ProgramType>('magang');
  const [customPrograms, setCustomPrograms] = useState<Record<string, ProgramConfig>>({});
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(DEFAULT_PROFILES);
  const [allEntries, setAllEntries] = useState<Record<string, LogEntry[]>>(DEFAULT_ENTRIES);
  const [user, setUser] = useState<User | null>(null);
  const [googleClientId, setGoogleClientIdState] = useState<string>(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '421276748294-3stmc79dgpq72uqqr3glsupqtghrqg4m.apps.googleusercontent.com'
  );
  const [isLoading, setIsLoading] = useState(true);

  // Combined programs (built-in + custom)
  const allPrograms = useMemo<Record<string, ProgramConfig>>(() => {
    return {
      ...PROGRAM_CONFIGS,
      ...customPrograms
    };
  }, [customPrograms]);

  const setGoogleClientId = useCallback((id: string) => {
    setGoogleClientIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('google_client_id', id);
    }
  }, []);

  // Fetch Cloud data for this specific user if Supabase is connected
  const fetchCloudData = useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
      // 1. Fetch user's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        const isSuper = isUserAdmin(profileData.email);
        const resolvedNim = (profileData.nim === '2313451001' || !profileData.nim) && isSuper ? '2412401021' : (profileData.nim || '');
        if (isSuper && profileData.nim !== '2412401021') {
          supabase.from('profiles').update({ nim: '2412401021' }).eq('id', userId).then(() => {});
        }
        setProfiles(prev => ({
          ...prev,
          [profileData.program_type]: {
            id: profileData.id,
            email: profileData.email,
            fullName: profileData.full_name,
            nim: resolvedNim,
            avatarUrl: profileData.avatar_url,
            programType: profileData.program_type,
            programTitle: profileData.program_title || '',
            institution: profileData.institution || '',
            partnerName: profileData.partner_name || '',
            supervisorName: profileData.supervisor_name || '',
            supervisorContact: profileData.supervisor_contact || '',
            startDate: profileData.start_date || '',
            endDate: profileData.end_date || '',
            targetHours: Number(profileData.target_hours) || 500,
            role: isSuper ? 'admin' : 'user',
            tier: isSuper ? 'pro' : (profileData.tier || 'free')
          }
        }));
      }

      // 2. Fetch log entries STRICTLY FOR THIS USER_ID (1 user 1 logbook)
      const { data: entriesData } = await supabase
        .from('log_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (entriesData && entriesData.length > 0) {
        const grouped: Record<string, LogEntry[]> = {};
        entriesData.forEach(row => {
          const type = row.program_type;
          if (!grouped[type]) {
            grouped[type] = [];
          }
          grouped[type].push({
            id: row.id,
            date: row.date,
            startTime: row.start_time,
            endTime: row.end_time,
            durationHours: Number(row.duration_hours),
            category: row.category,
            title: row.title,
            description: row.description,
            achievements: row.achievements,
            status: row.status,
            imageUrl: row.image_url,
            supervisorFeedback: row.supervisor_feedback,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          });
        });

        setAllEntries(prev => ({
          ...prev,
          ...grouped
        }));
      }

      // 3. Fetch custom programs from Supabase if table exists
      try {
        const { data: customProgData } = await supabase
          .from('custom_programs')
          .select('*');

        if (customProgData && Array.isArray(customProgData)) {
          const mapped: Record<string, ProgramConfig> = {};
          customProgData.forEach(p => {
            mapped[p.id] = {
              id: p.id,
              label: p.label,
              badgeColor: p.badge_color || 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
              supervisorLabel: p.supervisor_label || 'Pembimbing / Mentor',
              partnerLabel: p.partner_label || 'Instansi / Mitra',
              defaultCategories: Array.isArray(p.default_categories) ? p.default_categories : ['Aktivitas Utama'],
              suggestedTargetHours: Number(p.suggested_target_hours) || 300,
              description: p.description || '',
              isCustom: true
            };
          });
          setCustomPrograms(prev => {
            const merged = { ...prev, ...mapped };
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.CUSTOM_PROGRAMS, JSON.stringify(merged));
            }
            return merged;
          });
        }
      } catch {
        // Table custom_programs might not exist yet; gracefully handled
      }
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    }
  }, []);

  // Helper to check if entries object has actual log items
  const hasAnyEntries = (obj: unknown): boolean => {
    if (!obj || typeof obj !== 'object') return false;
    return Object.values(obj as Record<string, unknown>).some(arr => Array.isArray(arr) && arr.length > 0);
  };

  // Helper to load user-scoped data from LocalStorage
  const loadScopedUserData = useCallback((targetUser: User | null, currentCustoms: Record<string, ProgramConfig>) => {
    if (typeof window === 'undefined') return;
    try {
      const activeProgramsMap = { ...PROGRAM_CONFIGS, ...currentCustoms };
      const entriesKey = getUserStorageKey('logbook_entries', targetUser);
      const profilesKey = getUserStorageKey('logbook_profiles', targetUser);

      if (targetUser) {
        // Specific logged-in user
        const savedEntries = localStorage.getItem(entriesKey);
        if (savedEntries) {
          try {
            const parsed = JSON.parse(savedEntries);
            if (hasAnyEntries(parsed)) {
              setAllEntries(parsed);
            } else if (isUserAdmin(targetUser.email)) {
              // Super Admin should default to rich sample entries if wiped
              setAllEntries(DEFAULT_ENTRIES);
            } else {
              setAllEntries(parsed);
            }
          } catch {
            setAllEntries(isUserAdmin(targetUser.email) ? DEFAULT_ENTRIES : {});
          }
        } else {
          // Check legacy un-scoped key
          const legacy = localStorage.getItem('logbook_entries');
          if (legacy) {
            try {
              const legacyParsed = JSON.parse(legacy);
              if (hasAnyEntries(legacyParsed)) {
                setAllEntries(legacyParsed);
                localStorage.setItem(entriesKey, JSON.stringify(legacyParsed));
              } else {
                setAllEntries(DEFAULT_ENTRIES);
              }
            } catch {
              setAllEntries(DEFAULT_ENTRIES);
            }
          } else {
            // Default to rich entries so user has immediate logbook records
            setAllEntries(DEFAULT_ENTRIES);
          }
        }

        const savedProfiles = localStorage.getItem(profilesKey);
        if (savedProfiles) {
          try {
            setProfiles(JSON.parse(savedProfiles));
          } catch {
            setProfiles(createInitialProfilesForUser(targetUser, activeProgramsMap));
          }
        } else {
          setProfiles(createInitialProfilesForUser(targetUser, activeProgramsMap));
        }
      } else {
        // Guest mode / not logged in
        const savedEntries = localStorage.getItem(entriesKey);
        if (savedEntries) {
          try {
            const parsed = JSON.parse(savedEntries);
            if (hasAnyEntries(parsed)) {
              setAllEntries(parsed);
            } else {
              setAllEntries(DEFAULT_ENTRIES);
            }
          } catch {
            setAllEntries(DEFAULT_ENTRIES);
          }
        } else {
          const legacy = localStorage.getItem('logbook_entries');
          if (legacy) {
            try {
              const legacyParsed = JSON.parse(legacy);
              if (hasAnyEntries(legacyParsed)) {
                setAllEntries(legacyParsed);
              } else {
                setAllEntries(DEFAULT_ENTRIES);
              }
            } catch {
              setAllEntries(DEFAULT_ENTRIES);
            }
          } else {
            setAllEntries(DEFAULT_ENTRIES);
          }
        }

        const savedProfiles = localStorage.getItem(profilesKey);
        if (savedProfiles) {
          try {
            setProfiles(JSON.parse(savedProfiles));
          } catch {
            setProfiles(DEFAULT_PROFILES);
          }
        } else {
          setProfiles(DEFAULT_PROFILES);
        }
      }
    } catch (e) {
      console.warn('Could not read user data from localStorage', e);
    }
  }, []);

  // Initialize custom programs and user session
  useEffect(() => {
    let initialCustoms: Record<string, ProgramConfig> = {};
    try {
      // 1. Load custom programs
      const savedCustoms = localStorage.getItem(STORAGE_KEYS.CUSTOM_PROGRAMS);
      if (savedCustoms) {
        try {
          initialCustoms = JSON.parse(savedCustoms);
          setCustomPrograms(initialCustoms);
        } catch {
          initialCustoms = {};
        }
      }

      // 2. Load active program
      const savedProgram = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM) as ProgramType;
      if (savedProgram) {
        setActiveProgram(savedProgram);
      }

      // 3. Load active user
      const savedUserStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      let initialUser: User | null = null;
      if (savedUserStr) {
        try {
          initialUser = JSON.parse(savedUserStr);
          setUser(initialUser);
        } catch {
          initialUser = null;
        }
      }

      loadScopedUserData(initialUser, initialCustoms);

      const savedClientId = localStorage.getItem('google_client_id') || 
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
        '421276748294-3stmc79dgpq72uqqr3glsupqtghrqg4m.apps.googleusercontent.com';
      if (savedClientId) {
        setGoogleClientIdState(savedClientId);
      }
    } catch (e) {
      console.warn('Could not initialize localStorage', e);
    }

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(session.user));
          loadScopedUserData(session.user, initialCustoms);
          fetchCloudData(session.user.id);
        }
        setIsLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(session.user));
          loadScopedUserData(session.user, initialCustoms);
          fetchCloudData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
          loadScopedUserData(null, initialCustoms);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, [fetchCloudData, loadScopedUserData]);

  // Adjust profile with Google User metadata on change
  useEffect(() => {
    if (user) {
      const googleName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
      const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
      const googleEmail = user.email || '';
      const isSuper = isUserAdmin(googleEmail);

      setProfiles(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = {
            ...updated[key],
            fullName: isSuper ? updated[key].fullName || 'Naufal Irfansyah Saputra' : (googleName || updated[key].fullName),
            email: googleEmail || updated[key].email,
            avatarUrl: googleAvatar || updated[key].avatarUrl,
            role: isSuper ? 'admin' : updated[key].role || 'user',
            tier: isSuper ? 'pro' : updated[key].tier || 'free'
          };
        });
        return updated;
      });
    }
  }, [user]);

  // Sync to user-scoped LocalStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      try {
        const entriesKey = getUserStorageKey('logbook_entries', user);
        const profilesKey = getUserStorageKey('logbook_profiles', user);
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM, activeProgram);
        localStorage.setItem(profilesKey, JSON.stringify(profiles));
        localStorage.setItem(entriesKey, JSON.stringify(allEntries));
        if (user) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
        }
      } catch (e) {
        console.warn('Could not write to localStorage', e);
      }
    }
  }, [activeProgram, profiles, allEntries, user, isLoading]);

  const switchProgram = useCallback((type: ProgramType) => {
    setActiveProgram(type);
  }, []);

  // Super User function: Add Custom Program
  const addCustomProgram = useCallback(async (config: Omit<ProgramConfig, 'id'> & { id?: string }) => {
    const slugId = config.id || config.label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `program-${Date.now()}`;
    const newProg: ProgramConfig = {
      ...config,
      id: slugId,
      isCustom: true
    };

    setCustomPrograms(prev => {
      const next = { ...prev, [slugId]: newProg };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PROGRAMS, JSON.stringify(next));
      }
      return next;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('custom_programs').upsert({
          id: slugId,
          label: newProg.label,
          badge_color: newProg.badgeColor,
          supervisor_label: newProg.supervisorLabel,
          partner_label: newProg.partnerLabel,
          default_categories: newProg.defaultCategories,
          suggested_target_hours: newProg.suggestedTargetHours,
          description: newProg.description
        });
      } catch (err) {
        console.warn('Supabase custom_programs sync note:', err);
      }
    }
  }, []);

  // Super User function: Delete Custom Program
  const deleteCustomProgram = useCallback(async (id: string) => {
    if (PROGRAM_CONFIGS[id as DefaultProgramType]) {
      alert('Program bawaan sistem tidak dapat dihapus.');
      return;
    }

    setCustomPrograms(prev => {
      const next = { ...prev };
      delete next[id];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PROGRAMS, JSON.stringify(next));
      }
      return next;
    });

    if (activeProgram === id) {
      setActiveProgram('magang');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('custom_programs').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase custom_programs delete note:', err);
      }
    }
  }, [activeProgram]);

  const updateProfile = useCallback((updated: Partial<UserProfile>) => {
    setProfiles(prev => {
      const current = prev[activeProgram] || {
        id: user?.id || 'user',
        email: user?.email || '',
        fullName: user?.user_metadata?.full_name || '',
        nim: '',
        programType: activeProgram,
        programTitle: `Logbook ${allPrograms[activeProgram]?.label || activeProgram}`,
        institution: '',
        partnerName: '',
        supervisorName: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        targetHours: allPrograms[activeProgram]?.suggestedTargetHours || 300,
        role: isUserAdmin(user?.email) ? 'admin' : 'user',
        tier: isUserAdmin(user?.email) ? 'pro' : 'free'
      };
      const updatedProfile = { ...current, ...updated };
      return {
        ...prev,
        [activeProgram]: updatedProfile
      };
    });

    if (isSupabaseConfigured && supabase && user) {
      supabase.from('profiles').upsert({
        id: user.id,
        program_type: activeProgram,
        full_name: updated.fullName,
        nim: updated.nim,
        program_title: updated.programTitle,
        institution: updated.institution,
        partner_name: updated.partnerName,
        supervisor_name: updated.supervisorName,
        supervisor_contact: updated.supervisorContact,
        start_date: updated.startDate,
        end_date: updated.endDate,
        target_hours: updated.targetHours,
        updated_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.error('Error updating profile in Supabase:', error);
      });
    }
  }, [activeProgram, user, allPrograms]);

  // Upgrade user to PRO tier
  const upgradeToPro = useCallback(() => {
    setProfiles(prev => {
      const updatedAll = { ...prev };
      Object.keys(updatedAll).forEach(k => {
        updatedAll[k] = {
          ...updatedAll[k],
          tier: 'pro'
        };
      });
      return updatedAll;
    });
  }, []);

  const addEntry = useCallback(async (entryData: Omit<LogEntry, 'id' | 'createdAt'>): Promise<LogEntry> => {
    const newId = 'entry-' + Date.now();
    const newEntry: LogEntry = {
      ...entryData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    setAllEntries(prev => ({
      ...prev,
      [activeProgram]: [newEntry, ...(prev[activeProgram] || [])]
    }));

    if (isSupabaseConfigured && supabase && user) {
      const { data, error } = await supabase.from('log_entries').insert({
        user_id: user.id,
        program_type: activeProgram,
        date: newEntry.date,
        start_time: newEntry.startTime,
        end_time: newEntry.endTime,
        duration_hours: newEntry.durationHours,
        category: newEntry.category,
        title: newEntry.title,
        description: newEntry.description,
        achievements: newEntry.achievements || '',
        status: newEntry.status,
        image_url: newEntry.imageUrl || '',
        supervisor_feedback: newEntry.supervisorFeedback || ''
      }).select().single();

      if (data && !error) {
        newEntry.id = data.id;
      }
    }

    return newEntry;
  }, [activeProgram, user]);

  const updateEntry = useCallback(async (id: string, updated: Partial<LogEntry>) => {
    setAllEntries(prev => {
      const list = prev[activeProgram] || [];
      return {
        ...prev,
        [activeProgram]: list.map(item => item.id === id ? { ...item, ...updated, updatedAt: new Date().toISOString() } : item)
      };
    });

    if (isSupabaseConfigured && supabase && user) {
      await supabase.from('log_entries').update({
        date: updated.date,
        start_time: updated.startTime,
        end_time: updated.endTime,
        duration_hours: updated.durationHours,
        category: updated.category,
        title: updated.title,
        description: updated.description,
        achievements: updated.achievements,
        status: updated.status,
        image_url: updated.imageUrl,
        supervisor_feedback: updated.supervisorFeedback,
        updated_at: new Date().toISOString()
      }).eq('id', id);
    }
  }, [activeProgram, user]);

  // Admin / Supervisor review helper
  const reviewEntry = useCallback(async (id: string, status: 'approved' | 'submitted' | 'draft', feedback?: string) => {
    setAllEntries(prev => {
      const updatedAll: Record<string, LogEntry[]> = {};
      Object.keys(prev).forEach(key => {
        updatedAll[key] = (prev[key] || []).map(item => {
          if (item.id === id) {
            return {
              ...item,
              status,
              supervisorFeedback: feedback !== undefined ? feedback : item.supervisorFeedback,
              updatedAt: new Date().toISOString()
            };
          }
          return item;
        });
      });
      return updatedAll;
    });

    if (isSupabaseConfigured && supabase) {
      await supabase.from('log_entries').update({
        status,
        supervisor_feedback: feedback,
        updated_at: new Date().toISOString()
      }).eq('id', id);
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    setAllEntries(prev => {
      const list = prev[activeProgram] || [];
      return {
        ...prev,
        [activeProgram]: list.filter(item => item.id !== id)
      };
    });

    if (isSupabaseConfigured && supabase && user) {
      await supabase.from('log_entries').delete().eq('id', id);
    }
  }, [activeProgram, user]);

  const restoreDefaultEntries = useCallback((programOnly: boolean = false) => {
    setAllEntries(prev => {
      let next: Record<string, LogEntry[]>;
      if (programOnly && DEFAULT_ENTRIES[activeProgram]) {
        next = {
          ...prev,
          [activeProgram]: DEFAULT_ENTRIES[activeProgram]
        };
      } else {
        next = {
          ...prev,
          ...DEFAULT_ENTRIES
        };
      }
      if (typeof window !== 'undefined') {
        const entriesKey = getUserStorageKey('logbook_entries', user);
        localStorage.setItem(entriesKey, JSON.stringify(next));
        localStorage.setItem('logbook_entries', JSON.stringify(next));
      }
      return next;
    });
  }, [activeProgram, user]);

  const signInWithGoogle = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`
        }
      });
    } else {
      if (typeof window !== 'undefined') {
        const googleObj = (window as unknown as { google?: { accounts: { id: { prompt: () => void } } } }).google;
        if (googleObj?.accounts?.id) {
          googleObj.accounts.id.prompt();
        }
      }
    }
  }, []);

  // Login using real Google Identity Services JWT credential
  const loginWithGoogleCredential = useCallback(async (credentialToken: string): Promise<boolean> => {
    const payload = parseGoogleJwt(credentialToken);
    if (!payload || !payload.email) return false;

    let realGoogleUser = {
      id: payload.sub,
      email: payload.email,
      user_metadata: {
        full_name: payload.name,
        name: payload.name,
        avatar_url: payload.picture,
        picture: payload.picture
      }
    } as unknown as User;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: credentialToken
        });
        if (authData?.user && !authError) {
          realGoogleUser = authData.user;
        } else if (authError) {
          console.warn('Supabase signInWithIdToken info:', authError.message);
        }
      } catch (err) {
        console.warn('Supabase auth note:', err);
      }
    }

    setUser(realGoogleUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(realGoogleUser));
    }
    loadScopedUserData(realGoogleUser, customPrograms);
    fetchCloudData(realGoogleUser.id);
    return true;
  }, [customPrograms, loadScopedUserData, fetchCloudData]);

  // Two-Way Sync between local device storage and Supabase Cloud
  const syncWithCloud = useCallback(async (): Promise<{ success: boolean; uploaded: number; downloaded: number; message?: string }> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      return { success: false, uploaded: 0, downloaded: 0, message: 'Supabase belum terkonfigurasi atau akun belum login.' };
    }

    try {
      // 1. Fetch current cloud entries for this user
      const { data: cloudEntries, error: fetchErr } = await supabase
        .from('log_entries')
        .select('*')
        .eq('user_id', user.id);

      if (fetchErr) {
        return { success: false, uploaded: 0, downloaded: 0, message: fetchErr.message };
      }

      const cloudMap = new Map<string, unknown>();
      (cloudEntries || []).forEach(ce => {
        cloudMap.set(ce.id, ce);
      });

      // 2. Upload any local entry not yet in cloud
      const entriesToUpload: Array<{
        user_id: string;
        program_type: string;
        date: string;
        start_time: string;
        end_time: string;
        duration_hours: number;
        category: string;
        title: string;
        description: string;
        achievements: string;
        status: string;
        image_url: string;
        supervisor_feedback: string;
      }> = [];

      Object.keys(allEntries).forEach(progKey => {
        const list = allEntries[progKey] || [];
        list.forEach(entry => {
          if (!cloudMap.has(entry.id)) {
            entriesToUpload.push({
              user_id: user.id,
              program_type: progKey,
              date: entry.date,
              start_time: entry.startTime,
              end_time: entry.endTime,
              duration_hours: entry.durationHours,
              category: entry.category,
              title: entry.title,
              description: entry.description,
              achievements: entry.achievements || '',
              status: entry.status,
              image_url: entry.imageUrl || '',
              supervisor_feedback: entry.supervisorFeedback || ''
            });
          }
        });
      });

      let uploadedCount = 0;
      if (entriesToUpload.length > 0) {
        const { error: insertErr } = await supabase.from('log_entries').insert(entriesToUpload);
        if (!insertErr) {
          uploadedCount = entriesToUpload.length;
        } else {
          console.warn('Supabase insert note during sync:', insertErr);
        }
      }

      // 3. Re-fetch all cloud entries to consolidate
      const { data: refreshedCloud } = await supabase
        .from('log_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      let downloadedCount = 0;
      if (refreshedCloud && refreshedCloud.length > 0) {
        const grouped: Record<string, LogEntry[]> = {};
        refreshedCloud.forEach(row => {
          const type = row.program_type;
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push({
            id: row.id,
            date: row.date,
            startTime: row.start_time,
            endTime: row.end_time,
            durationHours: Number(row.duration_hours),
            category: row.category,
            title: row.title,
            description: row.description,
            achievements: row.achievements,
            status: row.status,
            imageUrl: row.image_url,
            supervisorFeedback: row.supervisor_feedback,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          });
        });

        downloadedCount = refreshedCloud.length;

        setAllEntries(prev => {
          const merged = { ...prev };
          Object.keys(grouped).forEach(k => {
            const existingList = merged[k] || [];
            const existingIds = new Set(existingList.map(e => e.id));
            const newCloudItems = grouped[k].filter(ce => !existingIds.has(ce.id));
            merged[k] = [...newCloudItems, ...existingList];
          });
          if (typeof window !== 'undefined') {
            const entriesKey = getUserStorageKey('logbook_entries', user);
            localStorage.setItem(entriesKey, JSON.stringify(merged));
          }
          return merged;
        });
      }

      return { 
        success: true, 
        uploaded: uploadedCount, 
        downloaded: downloadedCount,
        message: `Sinkronisasi tuntas! ${uploadedCount} diunggah ke cloud, ${downloadedCount} diunduh.` 
      };
    } catch (err) {
      console.error('Error during syncWithCloud:', err);
      return { success: false, uploaded: 0, downloaded: 0, message: 'Gagal melakukan sinkronisasi cloud.' };
    }
  }, [allEntries, user]);

  const exportBackupJSON = useCallback((): string => {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      activeProgram,
      profiles,
      allEntries
    }, null, 2);
  }, [activeProgram, profiles, allEntries]);

  const importBackupJSON = useCallback((jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !data.allEntries) return false;
      setAllEntries(prev => ({
        ...prev,
        ...data.allEntries
      }));
      if (data.profiles) {
        setProfiles(prev => ({
          ...prev,
          ...data.profiles
        }));
      }
      if (typeof window !== 'undefined') {
        const entriesKey = getUserStorageKey('logbook_entries', user);
        localStorage.setItem(entriesKey, JSON.stringify(data.allEntries));
        localStorage.setItem('logbook_entries', JSON.stringify(data.allEntries));
      }
      return true;
    } catch {
      return false;
    }
  }, [user]);

  // Quick helper to sign in directly as Admin: naufalfaster@gmail.com
  const signInAsAdmin = useCallback(() => {
    const adminUser = {
      id: 'admin-naufal-id',
      email: 'naufalfaster@gmail.com',
      user_metadata: {
        full_name: 'Naufal Irfansyah Saputra (Super Admin & Penguji)',
        name: 'Naufal Irfansyah Saputra',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      }
    } as unknown as User;
    setUser(adminUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(adminUser));
    }
    loadScopedUserData(adminUser, customPrograms);
  }, [customPrograms, loadScopedUserData]);

  const signInAsDemoUser = useCallback(() => {
    const regularUser = {
      id: 'student-demo-id',
      email: 'naufal.irfansyah@poltekkes-tjk.ac.id',
      user_metadata: {
        full_name: 'Naufal Irfansyah Saputra',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }
    } as unknown as User;
    setUser(regularUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(regularUser));
    }
    loadScopedUserData(regularUser, customPrograms);
  }, [customPrograms, loadScopedUserData]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    }
    loadScopedUserData(null, customPrograms);
  }, [customPrograms, loadScopedUserData]);

  const isAdmin = isUserAdmin(user?.email);
  const isAuthenticated = Boolean(user);

  // Compute Active Stats & Tier info
  const currentEntries = allEntries[activeProgram] || [];
  const programConfig: ProgramConfig = allPrograms[activeProgram] || PROGRAM_CONFIGS.magang;
  const currentProfile: UserProfile = profiles[activeProgram] || {
    id: user?.id || 'user',
    email: user?.email || '',
    fullName: user?.user_metadata?.full_name || user?.user_metadata?.name || 'Pengguna',
    nim: '',
    avatarUrl: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '',
    programType: activeProgram,
    programTitle: `Logbook ${programConfig.label}`,
    institution: '',
    partnerName: '',
    supervisorName: '',
    supervisorContact: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetHours: programConfig.suggestedTargetHours || 300,
    role: isAdmin ? 'admin' : 'user',
    tier: isAdmin ? 'pro' : 'free'
  };

  const userTier: UserTier = isAdmin ? 'pro' : (currentProfile.tier || 'free');
  const isPro = userTier === 'pro';
  const maxFreeEntries = FREE_TIER_LIMITS.maxEntries;
  const canAddEntry = isPro || currentEntries.length < maxFreeEntries;

  const totalHours = Number(currentEntries.reduce((acc, curr) => acc + (curr.durationHours || 0), 0).toFixed(1));
  const targetHours = currentProfile.targetHours || programConfig.suggestedTargetHours;
  const progressPercentage = Math.min(100, Math.round((totalHours / (targetHours || 1)) * 100));
  
  // Unique dates recorded
  const uniqueDates = new Set(currentEntries.map(e => e.date));
  const totalDays = uniqueDates.size;

  const approvedCount = currentEntries.filter(e => e.status === 'approved').length;
  const submittedCount = currentEntries.filter(e => e.status === 'submitted').length;
  const draftCount = currentEntries.filter(e => e.status === 'draft').length;

  const categoryCounts: Record<string, number> = {};
  currentEntries.forEach(e => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  return (
    <LogbookContext.Provider
      value={{
        activeProgram,
        programs: allPrograms,
        profile: currentProfile,
        entries: currentEntries,
        allEntries,
        programConfig,
        isLoading,
        isCloudConnected: isSupabaseConfigured,
        user,
        isAuthenticated,
        isAdmin,
        isPro,
        userTier,
        maxFreeEntries,
        canAddEntry,
        upgradeToPro,
        switchProgram,
        addCustomProgram,
        deleteCustomProgram,
        updateProfile,
        addEntry,
        updateEntry,
        deleteEntry,
        reviewEntry,
        restoreDefaultEntries,
        syncWithCloud,
        exportBackupJSON,
        importBackupJSON,
        signInWithGoogle,
        loginWithGoogleCredential,
        googleClientId,
        setGoogleClientId,
        signInAsAdmin,
        signInAsDemoUser,
        signOut,
        stats: {
          totalHours,
          targetHours,
          progressPercentage,
          totalDays,
          approvedCount,
          submittedCount,
          draftCount,
          categoryCounts
        }
      }}
    >
      {children}
    </LogbookContext.Provider>
  );
}

export function useLogbook() {
  const context = useContext(LogbookContext);
  if (!context) {
    throw new Error('useLogbook must be used within a LogbookProvider');
  }
  return context;
}
