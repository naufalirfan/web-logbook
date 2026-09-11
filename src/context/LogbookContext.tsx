'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  LogEntry, 
  UserProfile, 
  ProgramType, 
  UserTier, 
  PROGRAM_CONFIGS, 
  isUserAdmin,
  FREE_TIER_LIMITS,
  PRO_TIER_LIMITS 
} from '@/types/logbook';
import { DEFAULT_PROFILES, DEFAULT_ENTRIES } from '@/lib/initialData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { parseGoogleJwt } from '@/lib/googleAuth';
import type { User } from '@supabase/supabase-js';

interface LogbookContextType {
  activeProgram: ProgramType;
  profile: UserProfile;
  entries: LogEntry[];
  allEntries: Record<string, LogEntry[]>;
  programConfig: typeof PROGRAM_CONFIGS[ProgramType];
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
  updateProfile: (updated: Partial<UserProfile>) => void;
  addEntry: (entry: Omit<LogEntry, 'id' | 'createdAt'>) => Promise<LogEntry>;
  updateEntry: (id: string, updated: Partial<LogEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  reviewEntry: (id: string, status: 'approved' | 'submitted' | 'draft', feedback?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginWithGoogleCredential: (token: string) => boolean;
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
  PROFILES: 'logbook_profiles',
  ENTRIES: 'logbook_entries',
  ACTIVE_USER: 'logbook_active_user',
};

export function LogbookProvider({ children }: { children: React.ReactNode }) {
  const [activeProgram, setActiveProgram] = useState<ProgramType>('magang');
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(DEFAULT_PROFILES);
  const [allEntries, setAllEntries] = useState<Record<string, LogEntry[]>>(DEFAULT_ENTRIES);
  const [user, setUser] = useState<User | null>(null);
  const [googleClientId, setGoogleClientIdState] = useState<string>(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '421276748294-3stmc79dgpq72uqqr3glsupqtghrqg4m.apps.googleusercontent.com'
  );
  const [isLoading, setIsLoading] = useState(true);

  const setGoogleClientId = useCallback((id: string) => {
    setGoogleClientIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('google_client_id', id);
    }
  }, []);

  // Initialize from LocalStorage or Supabase
  useEffect(() => {
    try {
      const savedProgram = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM) as ProgramType;
      if (savedProgram && PROGRAM_CONFIGS[savedProgram]) {
        setActiveProgram(savedProgram);
      }

      const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (savedProfiles) {
        setProfiles(JSON.parse(savedProfiles));
      }

      const savedEntries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (savedEntries) {
        setAllEntries(JSON.parse(savedEntries));
      }

      const savedUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const savedClientId = localStorage.getItem('google_client_id') || 
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
        '421276748294-3stmc79dgpq72uqqr3glsupqtghrqg4m.apps.googleusercontent.com';
      if (savedClientId) {
        setGoogleClientIdState(savedClientId);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }

    if (isSupabaseConfigured && supabase) {
      // Check current session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(session.user));
          fetchCloudData(session.user.id);
        }
        setIsLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(session.user));
          fetchCloudData(session.user.id);
        } else {
          setUser(null);
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  // Automatically adjust profile name, email, avatar & tier when Google User signs in
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
            fullName: googleName || updated[key].fullName,
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

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM, activeProgram);
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
        localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(allEntries));
        if (user) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
        }
      } catch (e) {
        console.warn('Could not write to localStorage', e);
      }
    }
  }, [activeProgram, profiles, allEntries, user]);

  // Fetch Cloud data if Supabase is connected
  const fetchCloudData = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        const isSuper = isUserAdmin(profileData.email);
        setProfiles(prev => ({
          ...prev,
          [profileData.program_type]: {
            id: profileData.id,
            email: profileData.email,
            fullName: profileData.full_name,
            nim: profileData.nim || '',
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

      const { data: entriesData } = await supabase
        .from('log_entries')
        .select('*')
        .order('date', { ascending: false });

      if (entriesData) {
        const grouped: Record<string, LogEntry[]> = {
          magang: [],
          kkn: [],
          pkl: [],
          skripsi: [],
          mandiri: []
        };

        entriesData.forEach(row => {
          const type = row.program_type as ProgramType;
          if (grouped[type]) {
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
          }
        });

        setAllEntries(grouped);
      }
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    }
  };

  const switchProgram = useCallback((type: ProgramType) => {
    setActiveProgram(type);
  }, []);

  const updateProfile = useCallback((updated: Partial<UserProfile>) => {
    setProfiles(prev => {
      const current = prev[activeProgram] || DEFAULT_PROFILES[activeProgram];
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
  }, [activeProgram, user]);

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
        updatedAll[key] = prev[key].map(item => {
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
      // Local demo default login
      const mockUser = {
        id: 'user-google-1',
        email: 'naufalfaster@gmail.com',
        user_metadata: {
          full_name: 'Naufal Irfansyah Saputra',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        }
      } as unknown as User;
      setUser(mockUser);
    }
  }, []);

  // Login using real Google Identity Services JWT credential
  const loginWithGoogleCredential = useCallback((credentialToken: string): boolean => {
    const payload = parseGoogleJwt(credentialToken);
    if (!payload || !payload.email) return false;

    const realGoogleUser = {
      id: payload.sub,
      email: payload.email,
      user_metadata: {
        full_name: payload.name,
        name: payload.name,
        avatar_url: payload.picture,
        picture: payload.picture
      }
    } as unknown as User;

    setUser(realGoogleUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(realGoogleUser));
    }
    return true;
  }, []);

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
  }, []);

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
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    }
  }, []);

  const isAdmin = isUserAdmin(user?.email);
  const isAuthenticated = Boolean(user);

  // Compute Active Stats & Tier info
  const currentEntries = allEntries[activeProgram] || [];
  const currentProfile = profiles[activeProgram] || DEFAULT_PROFILES[activeProgram];
  const programConfig = PROGRAM_CONFIGS[activeProgram];

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
        updateProfile,
        addEntry,
        updateEntry,
        deleteEntry,
        reviewEntry,
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
