# Autenticación en Folio

Este documento describe la implementación de autenticación con GitHub mediante Authgear en la aplicación Folio.

## Índice

1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Configuración de Authgear](#configuración-de-authgear)
4. [Configuración de GitHub OAuth](#configuración-de-github-oauth)
5. [Implementación en el Código](#implementación-en-el-código)
6. [Flujo de Autenticación](#flujo-de-autenticación)
7. [Modo Desarrollador](#modo-desarrollador)
8. [Variables de Entorno](#variables-de-entorno)
9. [Sistema de Usuarios Beta](#sistema-de-usuarios-beta)
10. [Seguridad y Limitaciones](#seguridad-y-limitaciones)

---

## Visión General

Folio utiliza **Authgear** como proveedor de identidad para autenticar usuarios mediante **GitHub OAuth**. Esta solución permite:

- Login real con cuentas de GitHub
- Sesiones persistentes mediante refresh tokens
- Protección client-side de rutas privadas
- Flujo PKCE (Proof Key for Code Exchange) para SPAs

### Stack de Autenticación

| Componente | Tecnología |
|------------|------------|
| Identity Provider | [Authgear](https://www.authgear.com/) |
| OAuth Provider | GitHub |
| SDK Frontend | `@authgear/web` v5.0.1 |
| Framework | Next.js 16 (App Router, export estático) |
| Hosting | GitHub Pages (estático) |

---

## Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│   Folio SPA     │────▶│    Authgear      │────▶│     GitHub      │
│  (GitHub Pages) │     │                  │     │     OAuth       │
│                 │◀────│                  │◀────│                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│   localStorage  │
│  (user data)    │
└─────────────────┘
```

### Flujo de Datos

1. Usuario hace clic en "Empezar" o accede a `/dashboard`
2. Si no hay sesión, se redirige a Authgear
3. Authgear muestra la pantalla de login con GitHub
4. Usuario autoriza en GitHub
5. GitHub devuelve código a Authgear
6. Authgear intercambia el código por tokens
7. Authgear redirige a `/auth/callback/` con los tokens
8. La app procesa el callback y obtiene información del usuario
9. Usuario redirigido al dashboard

---

## Configuración de Authgear

### 1. Crear Proyecto en Authgear

1. Accede a [Authgear Portal](https://portal.authgear.com/)
2. Crea un nuevo proyecto
3. Anota los datos del proyecto:
   - **Endpoint**: `https://<tu-proyecto>.authgear.cloud`
   - **Client ID**: Se genera automáticamente

### 2. Configurar la Aplicación (SPA)

En la sección **Applications** del dashboard de Authgear:

| Campo | Valor para Folio |
|-------|------------------|
| **Allowed Redirect URIs** | `https://folio.espora.net/auth/callback/` |
| **Post-logout Redirect URIs** | `https://folio.espora.net/` |
| **Allowed Origins (CORS)** | `https://folio.espora.net` |

> **Nota**: Si usas GitHub Pages con subdirectorio (ej. `usuario.github.io/repo/`), incluye la barra final en las URIs.

### 3. Habilitar GitHub como Proveedor

En **Authentication** → **Social / Enterprise Login**:

1. Habilita **GitHub**
2. Configura:
   - **Client ID**: El de tu GitHub OAuth App
   - **Client Secret**: El de tu GitHub OAuth App
   - **Scopes**: `read:user`, `user:email`

---

## Configuración de GitHub OAuth

### Crear OAuth App en GitHub

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. **OAuth Apps** → **New OAuth App**
3. Rellena:

| Campo | Valor |
|-------|-------|
| **Application name** | Folio |
| **Homepage URL** | `https://folio.espora.net/` |
| **Authorization callback URL** | `https://<tu-proyecto>.authgear.cloud/sso/oauth2/callback/github` |

4. Guarda el **Client ID** y **Client Secret**
5. Configúralos en Authgear (paso anterior)

> ⚠️ El callback URL apunta a **Authgear**, no a tu app. Authgear actúa como intermediario.

---

## Implementación en el Código

### Estructura de Archivos

```
src/
├── lib/
│   └── authgear.ts          # Cliente y funciones de Authgear
├── hooks/
│   └── useAuth.tsx          # Context y hook de autenticación
└── views/
    └── Auth.tsx             # Pantalla de login
app/
└── auth/
    ├── page.tsx             # Ruta /auth (login)
    └── callback/
        └── page.tsx         # Ruta /auth/callback (procesa tokens)
```

### Módulo `authgear.ts`

Contiene la configuración y funciones principales:

```typescript
// Configuración
const AUTHGEAR_CLIENT_ID = 'f618083b831bb0d8';
const AUTHGEAR_ENDPOINT = 'https://espora.authgear.cloud';

// Funciones exportadas
export async function configureAuthgear(): Promise<void>
export async function startLogin(returnTo?: string): Promise<void>
export async function finishLogin(): Promise<void>
export async function logout(): Promise<void>
export async function fetchUserInfo(): Promise<UserInfo | null>
export async function isAuthenticated(): Promise<boolean>
export async function getAccessToken(): Promise<string | undefined>
```

### Hook `useAuth`

Proporciona el contexto de autenticación a toda la app:

```typescript
interface AuthContextType {
  user: AuthUser | null;        // Usuario autenticado
  session: string | null;       // Access token
  loading: boolean;             // Estado de carga inicial
  signIn: (returnTo?: string) => Promise<void>;
  signUp: (returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

Uso en componentes:

```tsx
const { user, signIn, signOut, loading } = useAuth();

if (loading) return <Loader />;
if (!user) return <LoginButton onClick={() => signIn('/dashboard')} />;
return <Dashboard user={user} />;
```

### Extracción del Username de GitHub

El hook extrae el username de GitHub desde los datos de Authgear:

```typescript
const extractGithubUsername = (userInfo: UserInfo): string | undefined => {
  // 1. Desde preferredUsername
  if (userInfo.preferredUsername) return userInfo.preferredUsername;
  
  // 2. Desde email de GitHub (formato: id+username@users.noreply.github.com)
  if (userInfo.email?.endsWith('@users.noreply.github.com')) {
    const prefix = userInfo.email.split('@')[0];
    const plusIndex = prefix.indexOf('+');
    return plusIndex !== -1 ? prefix.substring(plusIndex + 1) : prefix;
  }
  
  // 3. Desde name si parece un username
  if (userInfo.name && !userInfo.name.includes(' ')) {
    return userInfo.name;
  }
  
  return undefined;
};
```

---

## Flujo de Autenticación

### Login

Cuando el usuario hace clic en "Empezar" o accede a una ruta protegida:

```
1. Usuario → /dashboard (protegido)
2. Dashboard detecta !user && !loading
3. Dashboard verifica isAuthenticated() directamente con Authgear
4. Si NO hay sesión → Llama signIn('/dashboard')
5. authgear.startAuthentication({ redirectURI: '/auth/callback/' })
6. Navegador redirige a https://espora.authgear.cloud/ (pantalla de login)
7. Usuario ve la pantalla de Authgear con el botón "Continuar con GitHub"
8. Usuario hace clic → Redirige a GitHub para autorizar
9. GitHub autoriza → Redirige de vuelta a Authgear
10. Authgear → /auth/callback/?code=xxx
11. AuthCallbackPage llama finishLogin()
12. finishLogin() intercambia código por tokens
13. Navegador → /dashboard (con sesión activa)
```

> **Nota**: Es normal que al iniciar sesión el navegador redirija temporalmente a `https://espora.authgear.cloud/`. Esta es la pantalla de login de Authgear donde el usuario selecciona "Continuar con GitHub".

### Prevención de Race Conditions

Existe una posible race condition cuando el usuario vuelve del callback:

1. El callback completa `finishLogin()` y redirige a `/dashboard`
2. Dashboard se monta con `user = null` (el estado de React aún no se actualizó)
3. Si no se verifica, Dashboard iniciaría un nuevo login innecesario

**Solución implementada**: Antes de iniciar un login automático, Dashboard verifica directamente con `isAuthenticated()` de Authgear:

```typescript
// En Dashboard.tsx
const checkAndLogin = async () => {
  const alreadyAuthenticated = await isAuthenticated();
  
  if (alreadyAuthenticated) {
    // Ya hay sesión, esperar a que React actualice el estado
    return;
  }
  
  // Realmente no hay sesión, iniciar login
  await signIn('/dashboard');
};
```

Esto evita loops de login y garantiza que solo se redirija a Authgear cuando realmente no hay sesión.

### Logout

```
1. Usuario hace clic en "Cerrar sesión"
2. signOut() limpia estado local
3. authgear.logout() revoca refresh token
4. Redirige a la página principal
```

### Revalidación de Sesión

La sesión se revalida automáticamente:

- Al cargar la página (`hydrateUser()`)
- Al cambiar la visibilidad del documento (`visibilitychange`)
- Cuando Authgear notifica cambios (`onSessionStateChange`)

---

## Modo Desarrollador

Para desarrollo local sin necesidad de configurar OAuth:

### Activar Modo Dev

```bash
# En .env.local
NEXT_PUBLIC_SKIP_AUTH=true
```

### Comportamiento

Cuando `NEXT_PUBLIC_SKIP_AUTH=true`:

- Se crea un usuario ficticio automáticamente
- No se contacta a Authgear
- Se puede acceder directamente al dashboard
- Útil para desarrollo de UI sin configurar OAuth

```typescript
// En useAuth.tsx
const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
if (skipAuth) {
  const devUser: AuthUser = { 
    id: 'dev-user', 
    email: 'dev@example.com', 
    name: 'Usuario Dev',
    githubUsername: 'dev-user'
  };
  setUser(devUser);
  setActiveUserId(devUser.id);
  setSession('dev-session-token');
  setLoading(false);
  return;
}
```

---

## Variables de Entorno

### `.env.example`

```dotenv
# Base path para GitHub Pages (dejar vacío para desarrollo local)
NEXT_PUBLIC_BASE_PATH=

# Saltar autenticación en desarrollo (true/false)
NEXT_PUBLIC_SKIP_AUTH=false
```

### Producción (GitHub Actions)

El workflow de GitHub Pages inyecta automáticamente el `basePath` mediante `actions/configure-pages`.

### Variables en el Código

Las credenciales de Authgear están hardcodeadas en `authgear.ts` porque:
- Son valores públicos (Client ID y Endpoint)
- No contienen secretos (los secrets están en Authgear)
- Simplifica el despliegue en GitHub Pages

---

## Sistema de Usuarios Beta

Folio incluye un sistema de gestión de usuarios beta en `data/beta-users.json`:

```json
{
  "meta": {
    "description": "Lista de usuarios autorizados para el piloto beta de Folio",
    "version": "1.0"
  },
  "formUrl": "https://forms.office.com/r/zn5AwbZxmD",
  "allowedUsers": [
    {
      "githubUsername": "evaft",
      "authgearId": "74530abb-3473-40b1-9b89-2ff08214cf77",
      "name": "Eva",
      "addedAt": "2025-12-14"
    }
  ]
}
```

> **Nota**: Actualmente este archivo es solo para referencia. La restricción de acceso real se implementaría comparando el `githubUsername` del usuario autenticado con la lista.

---

## Seguridad y Limitaciones

### Protección Client-Side

⚠️ **Importante**: GitHub Pages es hosting estático. La protección es **client-side**:

- Los archivos JS, JSON y otros assets son públicamente accesibles
- La "protección" consiste en no renderizar contenido sin sesión
- No se puede bloquear descargas directas de archivos estáticos

### Qué SÍ protege esta implementación

✅ Login real con GitHub (no simulado)
✅ Sesiones con refresh tokens (expiran y se renuevan)
✅ Revocación de sesión en logout
✅ Datos de usuario aislados por ID en localStorage
✅ Flujo PKCE (sin secrets en el frontend)

### Qué NO protege

❌ Acceso directo a `/api/db.json` o `/api/db-*.json`
❌ Contenido del bundle JavaScript
❌ Datos estáticos en `/public/`

### Si necesitas protección real

Para proteger contenido sensible, considera:

1. **Backend con autenticación**: Mover datos a una API protegida
2. **Cloudflare Access**: Proxy con control de acceso
3. **Vercel/Netlify Functions**: Edge functions con verificación de tokens
4. **Azure Static Web Apps**: Autenticación integrada

---

## Troubleshooting

### Error "Invalid redirect URI"

- Verifica que la URI en Authgear coincida exactamente
- Incluye la barra final (`/auth/callback/`)
- Revisa mayúsculas/minúsculas

### Usuario se desloguea constantemente

- Verifica que `sessionType: 'refresh_token'` esté configurado
- Revisa la consola para errores de CORS
- Comprueba que los orígenes permitidos en Authgear estén correctos

### No aparece el botón de GitHub

- Verifica que GitHub esté habilitado en Authgear
- Revisa que Client ID y Secret de GitHub estén configurados
- Comprueba los scopes requeridos

### Callback devuelve error

- Revisa los logs en la consola del navegador
- Verifica que `finishLogin()` se esté llamando
- Comprueba que no haya múltiples llamadas al callback

---

## Referencias

- [Authgear Web SDK](https://docs.authgear.com/get-started/web)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps)
- [PKCE Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
