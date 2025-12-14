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
  githubUsername?: string;
}

interface BetaConfig {
  formUrl: string;
  allowedUsers: { githubUsername: string }[];
}

interface AuthContextType {
  user: AuthUser | null;
  session: string | null;
  loading: boolean;
  isBetaUser: boolean;
  betaFormUrl: string | null;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
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

const fetchBetaConfig = async (): Promise<BetaConfig | null> => {
  try {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const response = await fetch(`${basePath}/data/beta-users.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBetaUser, setIsBetaUser] = useState(false);
  const [betaFormUrl, setBetaFormUrl] = useState<string | null>(null);

  const hydrateUser = useCallback(async () => {
    // Saltar autenticación en desarrollo si la variable está activada
    const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
    if (skipAuth) {
      const devUser: AuthUser = { id: 'dev-user', email: 'dev@example.com', name: 'Usuario Dev', githubUsername: 'dev-user' };
      setUser(devUser);
      setActiveUserId(devUser.id);
      setSession('dev-session-token');
      setIsBetaUser(true);
      setLoading(false);
      return;
    }

    try {
      // Cargar configuración beta
      const betaConfig = await fetchBetaConfig();
      if (betaConfig) {
        setBetaFormUrl(betaConfig.formUrl);
      }

      await configureAuthgear();
      
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const userInfo = await fetchUserInfo();
        if (userInfo) {
          const authUser = mapUserInfo(userInfo);
          setUser(authUser);
          
          // Verificar si el usuario está en la lista beta
          const isAllowed = betaConfig?.allowedUsers.some(
            u => u.githubUsername.toLowerCase() === (authUser.githubUsername?.toLowerCase() || '')
          ) ?? false;
          
          // Log para depuración
          console.log('[Folio Auth] Verificación beta:', {
            githubUsername: authUser.githubUsername,
            allowedUsers: betaConfig?.allowedUsers.map(u => u.githubUsername),
            isAllowed,
          });
          
          setIsBetaUser(isAllowed);
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
      // Limpiar estado local primero
      setUser(null);
      setActiveUserId('guest');
      setSession(null);
      setIsBetaUser(false);
      
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
    <AuthContext.Provider value={{ user, session, loading, isBetaUser, betaFormUrl, signUp, signIn, signOut }}>
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
