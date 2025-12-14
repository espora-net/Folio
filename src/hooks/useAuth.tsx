'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { setActiveUserId } from '@/lib/storage';

type AuthsiteModule = {
  login?: (redirect?: string) => void;
  logout?: (redirect?: string) => void;
  isAuthenticated?: () => boolean;
  currentUser?: () => Record<string, unknown> | null;
  accessToken?: () => string | null;
};

interface AuthContextType {
  user: Record<string, unknown> | null;
  session: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
}

const extractUserId = (currentUser: Record<string, unknown> | null) => {
  if (!currentUser || typeof currentUser !== 'object') return null;
  const { id, email } = currentUser as { id?: string; email?: string };
  return id ?? email ?? null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authApi, setAuthApi] = useState<AuthsiteModule | null>(null);

  const hydrateUser = useCallback(
    (api?: AuthsiteModule) => {
      // Saltar autenticación en desarrollo si la variable está activada
      const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
      if (skipAuth) {
        const devUser = { id: 'dev-user', email: 'dev@example.com', name: 'Usuario Dev' };
        setUser(devUser);
        setActiveUserId(extractUserId(devUser));
        setSession('dev-session-token');
        return;
      }

      const client = api ?? authApi;
      if (!client) return;
      const authenticated = client.isAuthenticated?.() ?? false;
      if (authenticated) {
        const currentUser = client.currentUser?.() ?? null;
        setUser(currentUser);
        setActiveUserId(extractUserId(currentUser));
        setSession(client.accessToken?.() ?? null);
      } else {
        setUser(null);
        setActiveUserId('guest');
        setSession(null);
      }
    },
    [authApi]
  );

  useEffect(() => {
    let mounted = true;
    if (typeof window === 'undefined') return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const authPath = `${basePath}/auth/api.js`.replace(/\/{2,}/g, '/');

    import(/* webpackIgnore: true */ authPath)
      .then((api: AuthsiteModule) => {
        if (!mounted) return;
        setAuthApi(api);
        hydrateUser(api);
      })
      .catch(() => setAuthApi(null))
      .finally(() => setLoading(false));

    const listener = () => hydrateUser();
    window.addEventListener('storage', listener);
    window.addEventListener('visibilitychange', listener);

    return () => {
      mounted = false;
      window.removeEventListener('storage', listener);
      window.removeEventListener('visibilitychange', listener);
    };
  }, [hydrateUser]);

  const signIn = async () => {
    if (!authApi?.login) {
      console.warn('Auth module no disponible');
      return;
    }
    authApi.login(window.location.href);
  };

  const signUp = async () => {
    await signIn();
  };

  const signOut = async () => {
    authApi?.logout?.(window.location.origin);
    setUser(null);
    setActiveUserId('guest');
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
