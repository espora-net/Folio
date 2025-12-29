'use client';

// Configuración de Authgear
const AUTHGEAR_CLIENT_ID = 'f618083b831bb0d8';
const AUTHGEAR_ENDPOINT = 'https://espora.authgear.cloud';
const POST_LOGIN_REDIRECT_KEY = 'folio:post-login-redirect';

function getRedirectURI(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback/`;
  }
  return 'https://folio.espora.net/auth/callback/';
}

let configured = false;
let authgearInstance: typeof import('@authgear/web').default | null = null;

async function getAuthgear() {
  if (typeof window === 'undefined') {
    throw new Error('Authgear solo puede usarse en el cliente');
  }
  
  if (!authgearInstance) {
    const { default: authgear } = await import('@authgear/web');
    authgearInstance = authgear;
  }
  
  return authgearInstance;
}

export async function configureAuthgear(): Promise<void> {
  if (configured || typeof window === 'undefined') return;
  
  try {
    const authgear = await getAuthgear();
    await authgear.configure({
      clientID: AUTHGEAR_CLIENT_ID,
      endpoint: AUTHGEAR_ENDPOINT,
      sessionType: 'refresh_token',
      isSSOEnabled: false,
    });
    configured = true;
  } catch (error) {
    console.error('Error configurando Authgear:', error);
    throw error;
  }
}

export async function startLogin(returnTo?: string): Promise<void> {
  const authgear = await getAuthgear();
  await configureAuthgear();

  if (typeof window !== 'undefined') {
    const candidatePath = returnTo ?? window.location.pathname + window.location.search;
    const safePath = candidatePath.startsWith('/auth') ? '/dashboard' : candidatePath;
    sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, safePath);
  }

  // Evitamos forzar prompt=login para permitir que Authgear reutilice sesiones existentes
  // y reducir pantallas intermedias cuando el usuario ya tiene una sesión válida.
  await authgear.startAuthentication({
    redirectURI: getRedirectURI(),
    page: 'login',
  });
}

export async function finishLogin(): Promise<void> {
  const authgear = await getAuthgear();
  await configureAuthgear();
  await authgear.finishAuthentication();
}

export async function logout(): Promise<void> {
  const authgear = await getAuthgear();
  await configureAuthgear();
  
  // Para sessionType 'refresh_token', el logout:
  // 1. Revoca el refresh token en el servidor
  // 2. Limpia los tokens del localStorage
  // 3. NO redirige automáticamente (eso solo ocurre con sessionType 'cookie')
  await authgear.logout({
    force: true,
    redirectURI: window.location.origin,
  });

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  }
  
  // Redirigir manualmente ya que sessionType es 'refresh_token'
  window.location.href = window.location.origin;
}

export async function fetchUserInfo(): Promise<import('@authgear/web').UserInfo | null> {
  const authgear = await getAuthgear();
  const { SessionState } = await import('@authgear/web');
  await configureAuthgear();
  
  if (authgear.sessionState !== SessionState.Authenticated) {
    return null;
  }
  
  try {
    return await authgear.fetchUserInfo();
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error);
    return null;
  }
}

export async function getSessionState(): Promise<import('@authgear/web').SessionState> {
  const authgear = await getAuthgear();
  await configureAuthgear();
  return authgear.sessionState;
}

export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  const authgear = await getAuthgear();
  await configureAuthgear();
  const { SessionState } = await import('@authgear/web');
  return authgear.sessionState === SessionState.Authenticated;
}

export async function getAccessToken(): Promise<string | undefined> {
  const authgear = await getAuthgear();
  await configureAuthgear();
  return authgear.accessToken;
}

export function consumePostLoginRedirect(): string | null {
  if (typeof window === 'undefined') return null;
  const redirectTo = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  return redirectTo;
}

export async function getAuthgearDelegate(): Promise<typeof import('@authgear/web').default> {
  return await getAuthgear();
}

export type { UserInfo } from '@authgear/web';
