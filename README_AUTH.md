# Autenticación en Folio

## Resumen

Folio utiliza **Authgear** para gestionar la autenticación de usuarios de forma segura y moderna.

## ✅ Estado de Implementación

La autenticación con Authgear está **completamente implementada y funcional**:

- ✅ SDK de Authgear configurado (@authgear/web v5.0.1)
- ✅ Página principal con botón de acceso que redirige al dashboard
- ✅ Dashboard y todas sus subpáginas están protegidas
- ✅ Redirección automática a Authgear si no hay sesión
- ✅ Manejo de callback de OAuth
- ✅ Persistencia de sesión con refresh tokens
- ✅ Botones de logout en navbar y sidebar
- ✅ Manejo de errores y casos edge

## 🔐 Rutas Protegidas

Todas las páginas bajo `/dashboard` requieren autenticación:

- `/dashboard` - Dashboard principal
- `/dashboard/temario` - Gestión de temario
- `/dashboard/flashcards` - Tarjetas de estudio
- `/dashboard/tests` - Tests de práctica
- `/dashboard/progreso` - Seguimiento de progreso

## 🌐 Rutas Públicas

Las siguientes rutas son accesibles sin autenticación:

- `/` - Página principal (landing page)
- `/auth` - Página de autenticación (redirige a Authgear)
- `/auth/callback` - Callback de OAuth (uso interno)

## 🔄 Flujo de Autenticación

```
1. Usuario en home page → Clic en "Acceso Usuarios Beta"
                         ↓
2. ¿Usuario autenticado?
   ├─ SÍ → Redirige directamente a /dashboard
   └─ NO → Redirige a Authgear para login
                         ↓
3. Usuario se autentica en Authgear (espora.authgear.cloud)
                         ↓
4. Authgear redirige a /auth/callback con código OAuth
                         ↓
5. Callback intercambia código por tokens
                         ↓
6. Tokens se guardan en localStorage
                         ↓
7. Usuario es redirigido a /dashboard
                         ↓
8. Dashboard verifica autenticación y muestra contenido
```

## 🛡️ Protección de Rutas

La protección se implementa en el **layout del dashboard** (`src/views/Dashboard.tsx`):

```typescript
// Verifica autenticación al cargar
if (!user && !loading) {
  // No hay usuario → inicia login automáticamente
  signIn('/dashboard');
  return null;
}

// Usuario autenticado → muestra contenido
return <DashboardContent>{children}</DashboardContent>;
```

Todas las páginas bajo `/dashboard` comparten este layout, por lo que **automáticamente están protegidas**.

## 🔧 Configuración

### Authgear

```typescript
AUTHGEAR_CLIENT_ID = 'f618083b831bb0d8'
AUTHGEAR_ENDPOINT = 'https://espora.authgear.cloud'
```

### Variables de Entorno

```env
# Opcional: Omitir autenticación en desarrollo
NEXT_PUBLIC_SKIP_AUTH=false
```

## 📝 Componentes Clave

1. **`src/lib/authgear.ts`**
   - Configuración del SDK de Authgear
   - Funciones: `startLogin()`, `finishLogin()`, `logout()`, `isAuthenticated()`

2. **`src/hooks/useAuth.tsx`**
   - Context de React para autenticación
   - Provider que envuelve toda la aplicación
   - Hook `useAuth()` para acceder al estado de autenticación

3. **`src/views/Dashboard.tsx`**
   - Layout del dashboard con protección integrada
   - Verifica autenticación y redirige si es necesario

4. **`app/auth/callback/page.tsx`**
   - Procesa el callback de OAuth de Authgear
   - Intercambia código por tokens
   - Redirige al destino guardado

## 🚀 Uso

### En componentes

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();
  
  if (loading) return <Loader />;
  
  if (!user) {
    return <button onClick={() => signIn('/dashboard')}>Login</button>;
  }
  
  return (
    <div>
      <p>Bienvenido, {user.name}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### Redirigir a login

```typescript
// Redirigir a login con destino específico
await signIn('/dashboard/temario');
```

### Cerrar sesión

```typescript
// Cierra sesión y redirige a home
await signOut();
```

## 🧪 Testing

Ver [docs/TESTS_AUTENTICACION.md](./TESTS_AUTENTICACION.md) para un plan completo de pruebas.

## 📚 Documentación Adicional

- [Documentación completa de autenticación](./AUTENTICACION.md)
- [Plan de pruebas](./TESTS_AUTENTICACION.md)

## ✨ Características

- ✅ **OAuth 2.0** con Authgear
- ✅ **Refresh tokens** para sesiones persistentes
- ✅ **Protección automática** de rutas del dashboard
- ✅ **Manejo de errores** con mensajes claros
- ✅ **Renovación automática** de tokens
- ✅ **Redirección inteligente** después de login
- ✅ **Sesión compartida** entre pestañas
- ✅ **Persistencia** entre recargas y cierre de navegador
