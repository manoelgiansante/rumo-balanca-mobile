import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let unmounted = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (unmounted) return;
        setSession(data.session);
        setInitialized(true);
      })
      .catch(() => {
        if (!unmounted) setInitialized(true);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      unmounted = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: !!session,
      isLoading,
      initialized,

      signIn: async (email, password) => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) return { error: error.message };
          setSession(data.session);
          return { error: null };
        } finally {
          setIsLoading(false);
        }
      },

      signUp: async (email, password) => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) return { error: error.message };
          setSession(data.session);
          return { error: null };
        } finally {
          setIsLoading(false);
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        setSession(null);
      },
    }),
    [session, isLoading, initialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
