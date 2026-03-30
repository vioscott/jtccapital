import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: string | null;
  isLoading: boolean;
  isDataLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  console.log("SESSION:", session)
  console.log("LOADING:", isLoading)
  console.log("USER:", session?.user)

  async function fetchRole(userId: string) {
    console.log("Fetching data...")
    setIsDataLoading(true);

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(new Error('Role fetch timed out after 10s'));
      }, 10000);
    });

    try {
      const { data, error } = await Promise.race([
        supabase.from('profiles').select('role').eq('id', userId).maybeSingle(),
        timeoutPromise,
      ] as any);

      if (error) {
        console.error('Supabase role fetch error:', error);
        setRole('user');
      } else {
        setRole(data?.role || 'user');
        console.log('Role fetched:', data?.role || 'user');
      }
    } catch (e) {
      console.error('Error fetching role (fetchRole):', e);
      setRole('user');
    } finally {
      setIsDataLoading(false);
      console.log('isDataLoading set false in finally block');
    }
  }

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    console.log("AuthProvider useEffect starting...")

    // Safety timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("Auth loading timeout reached - forcing loading to false")
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Initial session result:", session)
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchRole(session.user.id);
      } else {
        setRole(null);
      }

      if (mounted) {
        setIsLoading(false);
        setIsDataLoading(false); // ensure fallback clear
        clearTimeout(timeoutId);
        console.log("Initial auth loading complete")
      }
    }).catch((error) => {
      console.error("Error getting initial session:", error)
      if (mounted) {
        setIsLoading(false);
        setIsDataLoading(false);
        clearTimeout(timeoutId);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state change:", _event, session)
        if (!mounted) return;
        
        setIsLoading(true);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchRole(session.user.id);
        } else {
          setRole(null);
          setIsDataLoading(false);
        }
        
        if (mounted) {
          setIsLoading(false);
          setIsDataLoading(false);
          console.log("Auth state change loading complete")
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      console.log("AuthProvider cleanup")
    };
  }, []);

  const signOut = async () => {
    console.log("Signing out...")
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign out:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setSession(null);
      setUser(null);
      setRole(null);
      setIsLoading(false);
      setIsDataLoading(false);
      console.log("Sign out complete")
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, role, isLoading, isDataLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
