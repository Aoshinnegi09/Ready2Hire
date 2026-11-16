import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { UserProfile, UserRole } from '@/types';
import { DEMO_USERS } from '@/lib/mockData';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, role?: UserRole) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: 'applicant' | 'recruiter') => Promise<{ error: Error | null; unconfirmed?: boolean }>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'ready2hire_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isConfigured = isSupabaseConfigured();
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Initial load from storage if in offline demo mode
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    // Default to student demo user for instant first impression
    return DEMO_USERS[4]; // Aravind Kumar
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (!isConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile as unknown as UserProfile);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
          }
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initializeAuth();

    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile as unknown as UserProfile);
              localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
            }
          } else {
            setUser(null);
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          }
          setIsLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const signIn = async (email: string, requestedRole?: UserRole) => {
    if (!isConfigured) {
      // Find matching mock user or synthesize one
      const found = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || (requestedRole && u.role === requestedRole)
      );
      if (found) {
        setUser(found);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(found));
        return { error: null };
      }
      // Create user if not matched
      const fallbackUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        role: requestedRole || 'applicant',
        is_verified: true,
        is_suspended: false,
        created_at: new Date().toISOString(),
      };
      setUser(fallbackUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fallbackUser));
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'Password@123',
      });
      if (error) return { error };

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profile) {
          setUser(profile as unknown as UserProfile);
        }
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'applicant' | 'recruiter'
  ) => {
    if (!isConfigured) {
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: fullName,
        role,
        headline: role === 'recruiter' ? 'Talent Acquisition Partner' : 'B.Tech Student',
        is_verified: true,
        is_suspended: false,
        created_at: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
      return { error: null, unconfirmed: false };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) return { error };

      if (data.user && !data.session) {
        // Email confirmation is required
        return { error: null, unconfirmed: true };
      }

      return { error: null, unconfirmed: false };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const switchDemoRole = (role: UserRole) => {
    const targetUser = DEMO_USERS.find((u) => u.role === role);
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(targetUser));
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));

    if (isConfigured) {
      await (supabase.from('profiles') as any).update(updates).eq('id', user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isLoading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        switchDemoRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
