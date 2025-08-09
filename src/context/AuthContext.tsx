import { createContext, ReactNode } from 'react';
import { useSession, useSupabaseClient, Session } from '@supabase/auth-helpers-react';
import { SupabaseClient } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  supabaseClient: SupabaseClient;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const session = useSession();
  const supabaseClient = useSupabaseClient();

  return (
    <AuthContext.Provider value={{ session, supabaseClient }}>{children}</AuthContext.Provider>
  );
};
