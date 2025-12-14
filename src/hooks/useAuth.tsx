'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { setActiveUserId } from '@/lib/storage';
import { 
  configureAuthgear, 
  startLogin, 
  logout as authgearLogout, 
  fetchUserInfo, 
  isAuthenticated,
  getAccessToken,
  getAuthgearDelegate,
  type UserInfo
} from '@/lib/authgear';

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapUserInfo = (userInfo: UserInfo): AuthUser => {
  return {
    id: userInfo.sub,
    email: userInfo.email ?? undefined,
    name: userInfo.name ?? userInfo.preferredUsername ?? userInfo.email ?? undefined,
    picture: userInfo.picture ?? undefined,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(async () => {
    // Saltar autenticación en desarrollo si la variable está activada
    const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
    if (skipAuth) {
      const devUser: AuthUser = { id: 'dev-user', email: 'dev@example.com', name: 'Usuario Dev' };
      setUser(devUser);
      setActiveUserId(devUser.id);
      setSession('dev-session-token');
      setLoading(false);
      return;
    }

    try {
      await configureAuthgear();
      
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const userInfo = await fetchUserInfo();
        if (userInfo) {
          const authUser = mapUserInfo(userInfo);
          setUser(authUser);
          setActiveUserId(authUser.id);
          const token = await getAccessToken();
          setSession(token ?? null);
        } else {
          setUser(null);
          setActiveUserId('guest');
          setSession(null);
        }
      } else {
        setUser(null);
        setActiveUserId('guest');
        setSession(null);
      }
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
      setUser(null);
      setActiveUserId('guest');
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    hydrateUser();

    // Escuchar cambios en el estado de sesión de Authgear
    const handleSessionChange = () => {
      hydrateUser();
    };

    // Configurar delegate de Authgear asíncronamente
    const setupDelegate = async () => {
      try {
        const authgear = await getAuthgearDelegate();
        authgear.delegate = {
          onSessionStateChange: handleSessionChange,
        };
      } catch (error) {
        // Ignorar error si no se puede configurar el delegate
      }
    };
    
    setupDelegate();

    // Escuchar eventos de visibilidad para revalidar sesión
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        hydrateUser();
      }
    };
    
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      // Limpiar delegate asíncronamente
      getAuthgearDelegate().then(authgear => {
        authgear.delegate = undefined;
      }).catch(() => {});
    };
  }, [hydrateUser]);

  const signIn = async () => {
    try {
      await startLogin();
    } catch (error) {
      console.error('Error iniciando login:', error);
    }
  };

  const signUp = async () => {
    // Authgear maneja registro y login en el mismo flujo
    await signIn();
  };

  const signOut = async () => {
    try {
      await authgearLogout();
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    } finally {
      setUser(null);
      setActiveUserId('guest');
      setSession(null);
    }
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
