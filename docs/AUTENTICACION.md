# Implementación de Autenticación con Authgear

## Resumen

Folio utiliza **Authgear SDK** para gestionar la autenticación de usuarios. Todas las páginas del dashboard están protegidas y requieren autenticación.

## Configuración

### Archivos principales

1. **`src/lib/authgear.ts`** - Funciones de configuración y utilidades de Authgear
2. **`src/hooks/useAuth.tsx`** - Context y hooks de React para autenticación
3. **`src/views/Dashboard.tsx`** - Layout protegido del dashboard
4. **`app/auth/callback/page.tsx`** - Página de callback para Authgear

### Variables de configuración

```typescript
// Nota: El Client ID de OAuth es público y se puede ver en el código del cliente.
// Authgear usa PKCE (Proof Key for Code Exchange) para seguridad adicional.
const AUTHGEAR_CLIENT_ID = 'f618083b831bb0d8';
const AUTHGEAR_ENDPOINT = 'https://espora.authgear.cloud';
```

## Flujo de Autenticación

### 1. Usuario no autenticado intenta acceder al dashboard

```
Usuario → /dashboard → Dashboard.tsx detecta no auth → signIn() → Authgear login
```

### 2. Proceso de login

```
signIn() → startLogin() → Authgear OAuth → /auth/callback → finishLogin() → /dashboard
```

### 3. Detalles del flujo

1. **Inicio**: Usuario hace clic en "Acceso Usuarios Beta" en la página principal
   - Llama a `signIn('/dashboard')` del hook `useAuth`

2. **Verificación**: El hook verifica si el usuario ya está autenticado
   - Si está autenticado → redirige directamente a `/dashboard`
   - Si NO está autenticado → llama a `startLogin('/dashboard')`

3. **Login en Authgear**: `startLogin()` redirige a Authgear
   - Guarda la URL de destino en sessionStorage
   - Configura el redirectURI a `/auth/callback`
   - Inicia el flujo OAuth de Authgear

4. **Autenticación**: Usuario se autentica en Authgear
   - Authgear maneja la autenticación con el proveedor configurado
   - Al completar, redirige a `/auth/callback?code=...&state=...`

5. **Callback**: La página `/auth/callback` procesa la respuesta
   - Llama a `finishLogin()` que intercambia el código por tokens
   - Los tokens se guardan automáticamente en localStorage
   - Recupera la URL de destino de sessionStorage
   - Redirige al destino (típicamente `/dashboard`)

6. **Acceso al Dashboard**: El layout del dashboard verifica autenticación
   - Usa `useAuth()` para obtener el estado del usuario
   - Si hay sesión válida → muestra el contenido
   - Si NO hay sesión → inicia el flujo de login

## Protección de Rutas

### Rutas protegidas

Todas las rutas bajo `/dashboard/*` están protegidas por el layout compartido:

- `/dashboard` - Página principal del dashboard
- `/dashboard/temario` - Gestión de temario
- `/dashboard/flashcards` - Tarjetas de estudio
- `/dashboard/tests` - Tests de práctica
- `/dashboard/progreso` - Seguimiento de progreso

### Mecanismo de protección

El archivo `app/dashboard/layout.tsx` envuelve todas las páginas del dashboard con `Dashboard.tsx`, que:

1. Muestra un loader mientras verifica la autenticación
2. Si no hay usuario autenticado, inicia automáticamente el flujo de login
3. Si el login falla, redirige a la página principal
4. Solo renderiza el contenido si hay un usuario autenticado

```typescript
// src/views/Dashboard.tsx
if (loading) {
  return <Loader />; // Mostrando loader
}

if (!user) {
  return null; // Iniciando login automáticamente
}

return <DashboardUI>; // Usuario autenticado, mostrar dashboard
```

## Rutas Públicas

- `/` - Página principal (landing page)
- `/auth` - Página de autenticación (redirige a Authgear)
- `/auth/callback` - Callback de Authgear (no es accesible directamente por usuarios)

## Sesión y Tokens

### Almacenamiento

Authgear SDK gestiona automáticamente los tokens:
- **Refresh token**: Almacenado en localStorage
- **Access token**: Mantenido en memoria por el SDK
- **Session state**: Gestionado por el SDK

### Renovación automática

El SDK de Authgear renueva automáticamente el access token cuando expira, usando el refresh token.

### Información del usuario

Se obtiene a través de `fetchUserInfo()` que devuelve:
- `sub`: ID único del usuario
- `email`: Email del usuario
- `name`: Nombre del usuario
- `picture`: URL de la foto de perfil
- `preferredUsername`: Username preferido

## Cierre de Sesión

```typescript
signOut() → logout() → Revoca tokens → Limpia localStorage → Redirige a /
```

1. Usuario hace clic en "Cerrar sesión"
2. Se llama a `signOut()` del hook `useAuth`
3. Se limpia el estado local
4. Se llama a `logout()` de Authgear que:
   - Revoca el refresh token en el servidor
   - Limpia los tokens del localStorage
5. Se redirige al usuario a la página principal

## Desarrollo Local

Para desarrollo local, se puede omitir la autenticación configurando:

```env
NEXT_PUBLIC_SKIP_AUTH=true
```

Esto crea un usuario de desarrollo automáticamente sin necesidad de autenticación real.

## Manejo de Errores

### Error en callback

Si hay un error al procesar el callback de Authgear:
- Se muestra una pantalla de error
- Se ofrece la opción de reintentar el login

### Error en auto-login

Si el dashboard no puede iniciar el login automáticamente:
- Se guarda un flag en sessionStorage
- Se redirige a la página principal
- Se evitan bucles de redirección

### Revalidación de sesión

El hook `useAuth` escucha:
- Cambios en el estado de sesión de Authgear
- Eventos de visibilidad (cuando el usuario vuelve a la pestaña)
- Revalida la sesión automáticamente en estos casos

## Seguridad

### Validación de redirects

La función `getSafeRedirectPath()` valida que las URLs de redirección:
- Pertenezcan al mismo origen
- Sean rutas permitidas (solo `/dashboard/*`)
- No sean rutas de autenticación (evita bucles)

### Session Type

Se usa `sessionType: 'refresh_token'` en lugar de `'cookie'` para:
- Mayor control sobre el almacenamiento
- Compatibilidad con aplicaciones SPA
- Gestión manual de la redirección tras logout
