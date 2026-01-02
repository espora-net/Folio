# Folio

Folio es una aplicación de estudio, pensada para funcionar como sitio estático (sin backend propio) y persistir el progreso en el navegador.

El proyecto está construido con Next.js (App Router) y se exporta a HTML estático (`output: 'export'`) para poder desplegarse en GitHub Pages.

## Cómo funciona (según el código)

### 1) Datos (JSON en `public/api`)

- La app carga el índice desde `GET <basePath>/api/db.json`.
- Si `db.json` declara datasets, también carga cada dataset desde `GET <basePath>/api/<archivo>.json`.
- Todo se normaliza en el cliente (topics/flashcards/questions/stats).

Notas importantes:

- El `basePath` se calcula con `NEXT_PUBLIC_BASE_PATH`.
- Existe un fallback “bundled” para casos de fallo de red, que se alimenta desde la carpeta `data/` (import estático en `src/lib/data-api.ts`). Si quieres coherencia total (build-time + runtime), mantén `data/` y `public/api/` sincronizados.

### 2) Persistencia (localStorage por usuario)

- El estado del usuario (temas completados, SRS de flashcards, estadísticas) se guarda en `localStorage`.
- Al iniciar, se ejecuta una hidratación que mezcla:
  - Campos “de esquema” desde la API (lo nuevo gana).
  - Progreso del usuario desde `localStorage` (se preserva).
- Las claves se aíslan por usuario (prefijo por ID), y el usuario activo se guarda como `folio_active_user_id`.

### 3) Autenticación (Authgear + GitHub OAuth)

- La app usa Authgear con OAuth de GitHub.
- El callback vive en `/auth/callback/` (con barra final por `trailingSlash: true`).
- Para desarrollo, se puede saltar el login con `NEXT_PUBLIC_SKIP_AUTH=true`.

Más detalles en `docs/AUTHENTICATION.md`.

## Ejecutar en local

Requisitos:

- Node.js 20+
- npm

Pasos:

```bash
git clone https://github.com/espora-net/Folio.git
cd Folio

npm ci
cp .env.example .env.local

# Opcional: saltar autenticación en local
# Edita .env.local y pon:
# NEXT_PUBLIC_SKIP_AUTH=true

npm run dev
```

Abrir `http://localhost:3000`.

## Build estático (como en producción)

El repositorio está configurado para export estático. En Next.js con `output: 'export'`, el comando genera `out/`.

```bash
npm run build
```

Para previsualizar `out/` como sitio estático:

```bash
python3 -m http.server -d out 4173
```

Abrir `http://localhost:4173`.

## Desplegar en GitHub Pages (según el repo)

Este repo trae un workflow de Actions que construye y publica en Pages: `.github/workflows/nextjs.yml`.

### 1) Activar GitHub Pages

- En GitHub: **Settings → Pages**
- **Build and deployment**: seleccionar **GitHub Actions**

### 2) Base path (subdirectorio en Pages)

En GitHub Pages, la URL suele ser `https://<owner>.github.io/<repo>/`.

El código usa `NEXT_PUBLIC_BASE_PATH` para que:

- Las rutas y assets se sirvan bajo `/<repo>`
- La API JSON se resuelva como `/<repo>/api/...`

El workflow usa `actions/configure-pages` con `static_site_generator: next`, que ajusta la configuración para Pages.

### 3) Autenticación en Pages

Si quieres login real en Pages, en Authgear debes permitir el redirect:

- `https://<owner>.github.io/<repo>/auth/callback/`

Si solo quieres un demo sin login, define `NEXT_PUBLIC_SKIP_AUTH=true` durante el build (por ejemplo como **Repository Variable** de Actions).

### 4) Publicación

- Push a `main` dispara el workflow.
- El job construye `out/`, copia `public/api` a `out/api` y despliega el artifact.

## Estructura del proyecto

- `app/`: rutas Next.js (landing, `/dashboard`, `/auth/callback`)
- `src/lib/data-api.ts`: carga/normaliza datasets desde `public/api`
- `src/lib/storage.ts`: persistencia + hidratación desde la API
- `public/api/`: datasets JSON servidos como “API estática”

## Mejoras para simplificar (propuestas)

- Eliminar duplicidad `data/` vs `public/api/`: generar el fallback desde `public/api` en build, o declarar una única fuente de verdad.
- Añadir script de preview (ej. `"preview": "python3 -m http.server -d out 4173"`) para reproducir Pages sin comandos manuales.
- Centralizar utilidades de `basePath` (una función compartida) para evitar discrepancias entre rutas (assets, API y auth).
