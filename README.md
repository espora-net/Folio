# Folio

Folio es una aplicación de estudio, pensada para funcionar como sitio estático (sin backend propio) y persistir el progreso en el navegador.

El proyecto está construido con Next.js (App Router) y se exporta a HTML estático (`output: 'export'`) para poder desplegarse en GitHub Pages.

## Cómo funciona (según el código)

### 1) Datos

- Los JSON de `public/api/*.json` son la fuente editorial: se editan, revisan y validan en el repositorio.
- Antes de publicar, `npm run generate-flatbuffers` transforma esos JSON en artefactos runtime en `public/api/optimized/`.
- La app publicada carga `GET <basePath>/api/optimized/manifest.json` y buffers `.fb.bin` FlatBuffers. No usa fallback JSON en runtime.
- El loader convierte los buffers a los tipos internos existentes (`topics`, `flashcards`, `questions`, `convocatorias`, `stats`) para mantener estable la UI.

Notas importantes:

- El `basePath` se calcula con `NEXT_PUBLIC_BASE_PATH`.
- Si falta `flatc`, el generador falla con un mensaje explícito. En GitHub Actions se instala `flatbuffers-compiler` antes del build.

Documentos del temario:

- Los recursos (Markdown/PDF/MP3) enlazados desde el temario se sirven como ficheros estáticos desde `public/data/` (por ejemplo: `/data/general/...`).

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
- `flatc` para regenerar datos optimizados (macOS: `brew install flatbuffers`; Ubuntu: `sudo apt-get install flatbuffers-compiler`)

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
npm run validate-schemas
npm run generate-flatbuffers
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
- El job valida JSON, genera FlatBuffers, construye `out/`, comprueba `out/api/optimized` y elimina los JSON fuente de `out/api` antes de desplegar.

## Estructura del proyecto

- `app/`: rutas Next.js (landing, `/dashboard`, `/auth/callback`)
- `schemas/folio-data.fbs`: contrato FlatBuffers runtime
- `scripts/generate-flatbuffers-data.mjs`: transforma JSON fuente a `public/api/optimized`
- `src/lib/data-api.ts`: fachada de datos usada por la UI
- `src/lib/optimized-data-api.ts`: carga y decodifica FlatBuffers
- `src/lib/storage.ts`: persistencia + hidratación desde la API
- `public/api/`: JSON fuente y artefactos optimizados

- `docs/DATA_SCHEMAS.md`: documentación de schemas JSON y validación

## Validación de datos

Para validar que los archivos JSON cumplen con los schemas definidos:

```bash
npm run validate-schemas
```

Este comando valida `db.json` y todos los archivos `db-*.json` contra sus respectivos schemas. Ver `docs/DATA_SCHEMAS.md` para más detalles sobre la estructura de datos y el significado de cada campo.

Para regenerar el runtime optimizado:

```bash
npm run generate-flatbuffers
```

Este comando requiere `flatc` y emite `public/api/optimized/manifest.json`, `index.fb.bin`, un `.fb.bin` por dataset y un `.fb.bin` por convocatoria. La carpeta `public/api/optimized/` es derivada y se regenera localmente o en la Action antes del build.

## Notas de diseño

- `public/api/*.json` es la fuente editorial; `public/api/optimized/*` es el contrato runtime publicado.
- `NEXT_PUBLIC_BASE_PATH` controla rutas y assets cuando se despliega bajo subdirectorio (p. ej. GitHub Pages).
- La app evita persistir preguntas: `questions` vienen del dataset y `flashcards` se derivan a partir de ellas.
- Los datasets remotos deben resolverse durante generación; si no están disponibles, la publicación debe fallar en vez de degradar silenciosamente.
