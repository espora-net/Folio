# Plan de Pruebas - Autenticación con Authgear

## Casos de Prueba

### 1. Acceso desde la Home Page

#### Test 1.1: Usuario no autenticado
**Pasos:**
1. Abrir la aplicación en `/`
2. Hacer clic en "Acceso Usuarios Beta"

**Resultado esperado:**
- El usuario es redirigido a Authgear para autenticarse
- URL debe cambiar a `https://espora.authgear.cloud/...`

#### Test 1.2: Usuario ya autenticado
**Pasos:**
1. Usuario ya tiene sesión activa
2. Abrir `/` y hacer clic en "Acceso Usuarios Beta"

**Resultado esperado:**
- El usuario es redirigido directamente a `/dashboard`
- No pasa por Authgear

### 2. Acceso Directo al Dashboard

#### Test 2.1: Usuario no autenticado accede a /dashboard
**Pasos:**
1. Limpiar localStorage y sessionStorage
2. Navegar directamente a `/dashboard`

**Resultado esperado:**
1. Aparece un loader brevemente
2. El usuario es redirigido automáticamente a Authgear
3. Después de autenticarse, vuelve a `/dashboard`

#### Test 2.2: Usuario autenticado accede a /dashboard
**Pasos:**
1. Usuario tiene sesión activa
2. Navegar a `/dashboard`

**Resultado esperado:**
- El dashboard se carga inmediatamente
- Se muestra el sidebar y el contenido del dashboard

### 3. Acceso a Subpáginas del Dashboard

#### Test 3.1: Usuario no autenticado accede a /dashboard/temario
**Pasos:**
1. Limpiar localStorage y sessionStorage
2. Navegar directamente a `/dashboard/temario`

**Resultado esperado:**
- El usuario es redirigido a Authgear
- Después de autenticarse, vuelve a `/dashboard/temario`

#### Test 3.2: Usuario autenticado navega entre páginas del dashboard
**Pasos:**
1. Usuario autenticado en `/dashboard`
2. Navegar a `/dashboard/temario`
3. Navegar a `/dashboard/flashcards`
4. Navegar a `/dashboard/tests`

**Resultado esperado:**
- Todas las navegaciones funcionan sin solicitar autenticación
- El sidebar permanece visible
- El contenido cambia correctamente

### 4. Flujo de Callback

#### Test 4.1: Callback exitoso
**Pasos:**
1. Completar autenticación en Authgear
2. Ser redirigido a `/auth/callback?code=...&state=...`

**Resultado esperado:**
1. Aparece mensaje "Completando autenticación..."
2. Los tokens se guardan en localStorage
3. El usuario es redirigido al destino guardado (ej: `/dashboard`)

#### Test 4.2: Callback con error
**Pasos:**
1. Simular un error en el callback (URL incorrecta, código inválido, etc.)

**Resultado esperado:**
1. Se muestra un mensaje de error
2. Se ofrece botón "Volver a intentar"
3. Al hacer clic, se reinicia el flujo de login

### 5. Cierre de Sesión

#### Test 5.1: Logout desde el dashboard
**Pasos:**
1. Usuario autenticado en cualquier página del dashboard
2. Hacer clic en "Cerrar sesión" en el sidebar

**Resultado esperado:**
1. Los tokens se eliminan de localStorage
2. El usuario es redirigido a `/`
3. El estado de autenticación se limpia

#### Test 5.2: Intentar acceder al dashboard después del logout
**Pasos:**
1. Hacer logout
2. Intentar navegar a `/dashboard`

**Resultado esperado:**
- El usuario es redirigido nuevamente a Authgear para autenticarse

### 6. Persistencia de Sesión

#### Test 6.1: Recargar la página
**Pasos:**
1. Usuario autenticado en `/dashboard`
2. Recargar la página (F5)

**Resultado esperado:**
- La sesión se mantiene
- El usuario permanece en el dashboard
- No es necesario volver a autenticarse

#### Test 6.2: Abrir en nueva pestaña
**Pasos:**
1. Usuario autenticado en una pestaña
2. Abrir nueva pestaña y navegar a `/dashboard`

**Resultado esperado:**
- La sesión es compartida entre pestañas
- El usuario está autenticado en la nueva pestaña
- No necesita volver a hacer login

#### Test 6.3: Cerrar y reabrir el navegador
**Pasos:**
1. Usuario autenticado
2. Cerrar completamente el navegador
3. Volver a abrir y navegar a `/dashboard`

**Resultado esperado:**
- La sesión se mantiene (gracias al refresh token en localStorage)
- El usuario está autenticado
- Puede acceder al dashboard sin volver a hacer login

### 7. Manejo de Errores

#### Test 7.1: Token expirado
**Pasos:**
1. Usuario autenticado con token próximo a expirar
2. Esperar a que expire el access token
3. Realizar una acción que requiera autenticación

**Resultado esperado:**
- Authgear SDK renueva automáticamente el token
- La acción se completa sin interrupciones
- El usuario no nota nada

#### Test 7.2: Refresh token inválido
**Pasos:**
1. Manipular manualmente el localStorage para invalidar el refresh token
2. Navegar a `/dashboard`

**Resultado esperado:**
- El SDK detecta que el token es inválido
- El usuario es redirigido a Authgear para autenticarse nuevamente

### 8. Navegación con Historial

#### Test 8.1: Botón "Atrás" después de login
**Pasos:**
1. Usuario inicia login desde `/`
2. Completa autenticación y llega a `/dashboard`
3. Hacer clic en botón "Atrás" del navegador

**Resultado esperado:**
- El usuario vuelve a `/` (home page)
- NO vuelve a la página de callback (debe estar excluida del historial)

#### Test 8.2: Botón "Adelante" después de ir atrás
**Pasos:**
1. Desde el dashboard, ir atrás a `/`
2. Hacer clic en botón "Adelante"

**Resultado esperado:**
- El usuario vuelve a `/dashboard`
- El dashboard se carga correctamente

### 9. Rutas Públicas

#### Test 9.1: Acceso a la home page sin autenticación
**Pasos:**
1. Sin estar autenticado
2. Navegar a `/`

**Resultado esperado:**
- La página se carga correctamente
- Se muestra el landing page completo
- No se solicita autenticación

#### Test 9.2: Acceso a /auth sin estar autenticado
**Pasos:**
1. Sin estar autenticado
2. Navegar directamente a `/auth`

**Resultado esperado:**
- Se muestra brevemente "Redirigiendo..."
- El usuario es redirigido a Authgear

### 10. Modo de Desarrollo

#### Test 10.1: SKIP_AUTH activado
**Pasos:**
1. Configurar `NEXT_PUBLIC_SKIP_AUTH=true`
2. Navegar a `/dashboard`

**Resultado esperado:**
- El usuario puede acceder sin autenticación
- Se crea un usuario de desarrollo automático
- Todas las funcionalidades funcionan normalmente

## Verificación de Seguridad

### Validación de Redirects
- ✅ Solo se permiten redirects a rutas bajo `/dashboard`
- ✅ Se bloquean redirects a dominios externos
- ✅ Se previenen bucles de redirección con `/auth`

### Almacenamiento de Tokens
- ✅ Refresh tokens en localStorage (persistentes)
- ✅ Access tokens en memoria (seguros)
- ✅ No se exponen tokens en URLs o logs

### Protección de Rutas
- ✅ Todas las rutas `/dashboard/*` están protegidas
- ✅ No es posible acceder sin autenticación
- ✅ Las rutas públicas funcionan sin restricciones

## Checklist de Verificación Manual

Antes de considerar completa la implementación:

- [ ] El botón de la home page inicia el flujo de login correctamente
- [ ] Las páginas del dashboard están protegidas
- [ ] El callback de Authgear procesa correctamente el código
- [ ] Los tokens se almacenan y recuperan correctamente
- [ ] El logout limpia la sesión completamente
- [ ] La sesión persiste entre recargas
- [ ] No hay errores en la consola del navegador
- [ ] El build de producción funciona sin errores
- [ ] La navegación con historial funciona correctamente
- [ ] Los errores se manejan con mensajes claros
