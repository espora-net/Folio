'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  githubUsername?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: string | null;
  loading: boolean;
  signIn: (returnTo?: string) => Promise<void>;
  signUp: (returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Extraer el username de GitHub desde la info del usuario de Authgear
const extractGithubUsername = (userInfo: UserInfo): string | undefined => {
  // Intentar obtener de preferredUsername (formato común)
  if (userInfo.preferredUsername) {
    return userInfo.preferredUsername;
  }
  
  // Intentar extraer del email si es de GitHub
  if (userInfo.email?.endsWith('@users.noreply.github.com')) {
    // Formato: username@users.noreply.github.com o ID+username@users.noreply.github.com
    const emailPrefix = userInfo.email.split('@')[0];
    // Si tiene formato numérico+username, extraer el username
    const plusIndex = emailPrefix.indexOf('+');
    if (plusIndex !== -1) {
      return emailPrefix.substring(plusIndex + 1);
    }
    return emailPrefix;
  }
  
  // Intentar extraer del campo 'name' si parece un username
  if (userInfo.name && !userInfo.name.includes(' ')) {
    return userInfo.name;
  }
  
  return undefined;
};

const mapUserInfo = (userInfo: UserInfo): AuthUser => {
  const githubUsername = extractGithubUsername(userInfo);
  
  // Log para depuración (se puede quitar después)
  console.log('[Folio Auth] UserInfo recibido:', {
    sub: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name,
    preferredUsername: userInfo.preferredUsername,
    picture: userInfo.picture,
    extractedGithubUsername: githubUsername,
  });
  
  return {
    id: userInfo.sub,
    email: userInfo.email ?? undefined,
    name: userInfo.name ?? userInfo.preferredUsername ?? userInfo.email ?? undefined,
    picture: userInfo.picture ?? undefined,
    githubUsername,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const hydrateUser = useCallback(async () => {
    // Saltar autenticación en desarrollo si la variable está activada
    const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
    if (skipAuth) {
      const devUser: AuthUser = { id: 'dev-user', email: 'dev@example.com', name: 'Usuario Dev', githubUsername: 'dev-user' };
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

  const signIn = useCallback(
    async (returnTo?: string) => {
      try {
        if (user) {
          if (returnTo) {
            router.push(returnTo);
          }
          return;
        }
        await startLogin(returnTo);
      } catch (error) {
        console.error('Error iniciando login:', error);
      }
    },
    [router, user]
  );

  const signUp = async (returnTo?: string) => {
    // Authgear maneja registro y login en el mismo flujo
    await signIn(returnTo);
  };

  const signOut = async () => {
    try {
      // Limpiar estado local primero
      setUser(null);
      setActiveUserId('guest');
      setSession(null);
      
      // Llamar al logout de Authgear (limpia tokens y revoca sesión)
      await authgearLogout();
      
      // Nota: authgearLogout() para sessionType='refresh_token' no redirige,
      // pero hemos configurado redirectURI para el caso de 'cookie'.
      // La redirección se maneja en authgear.ts
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      // Incluso si hay error, redirigir a la página principal
      window.location.href = window.location.origin;
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
