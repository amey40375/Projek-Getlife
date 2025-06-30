import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'user' | 'mitra' | 'admin';
  is_verified: boolean;
  is_blocked: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'user' | 'mitra') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const createProfile = (user: User): Profile => {
    const email = user.email || '';
    let role: 'user' | 'mitra' | 'admin' = 'user';
    
    if (email.includes('admin')) {
      role = 'admin';
    } else if (email.includes('mitra')) {
      role = 'mitra';
    }
    
    return {
      id: user.id,
      full_name: email.split('@')[0] || 'User',
      phone: null,
      role: role,
      is_verified: true,
      is_blocked: false
    };
  };

  const refreshProfile = async () => {
    if (user) {
      const newProfile = createProfile(user);
      setProfile(newProfile);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth');
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          console.log('AuthContext: Found existing session for:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          const userProfile = createProfile(currentSession.user);
          setProfile(userProfile);
          console.log('AuthContext: Profile set:', userProfile);
        } else {
          console.log('AuthContext: No existing session');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
        console.log('AuthContext: Loading finished');
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthContext: Auth state change:', event);
      
      if (session?.user) {
        console.log('AuthContext: User signed in:', session.user.email);
        setSession(session);
        setUser(session.user);
        const userProfile = createProfile(session.user);
        setProfile(userProfile);
        console.log('AuthContext: New profile set:', userProfile);
      } else {
        console.log('AuthContext: User signed out');
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'user' | 'mitra') => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};