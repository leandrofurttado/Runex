import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  level: number;
  xp: number;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** true apenas no check inicial ao abrir o app */
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /** Busca o perfil do usuário na tabela `profiles`. Falhas de rede são silenciosas. */
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (data && !error) setProfile(data);
    } catch {
      // Sem internet: o perfil em memória fica como estava.
      // Na próxima mudança de estado de auth será refetchado.
    }
  };

  const refreshProfile = async () => {
    if (session?.user) await fetchProfile(session.user.id);
  };

  useEffect(() => {
    /**
     * Padrão oficial do Supabase para React Native:
     * onAuthStateChange dispara INITIAL_SESSION ao iniciar,
     * restaurando automaticamente a sessão salva no SecureStore.
     * NÃO chamamos getSession() para evitar race condition.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }

        /**
         * Só marca loading como false depois do check inicial.
         * Assim o AuthGate fica aguardando o resultado correto
         * sem redirecionar antes de saber se há sessão ou não.
         */
        if (event === 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    /**
     * Gerencia o auto-refresh do token com base no estado da tela.
     * - Ativo (foreground): refresh rodando normalmente.
     * - Background: pausa o refresh para economizar bateria.
     * Quando o usuário volta ao app, o token é renovado imediatamente se necessário.
     */
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    const appStateSub = AppState.addEventListener('change', handleAppState);

    return () => {
      subscription.unsubscribe();
      appStateSub.remove();
    };
  }, []);

  const signOut = async () => {
    // onAuthStateChange(SIGNED_OUT) limpa session e profile automaticamente
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
