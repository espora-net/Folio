# Folio

Folio es la aplicación de estudio diseñada para opositores que quieren aprobar de forma inteligente, organizada y sin perder tiempo.

> Listo para GitHub Pages: el proyecto se exporta de forma estática (`output: 'export'`, `trailingSlash: true`) y usa `NEXT_PUBLIC_BASE_PATH` para servir assets y la API JSON desde un subdirectorio (ej. `/study-buddy-hub`).

[![Abrir en GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/espora-net/study-buddy-hub?quickstart=1)

## ✨ Características
- Landing con CTA orientado a captar usuarios.
- Dashboard con racha, tiempo de estudio y accesos rápidos.
- Gestor de temario editable con progreso por tema.
- Flashcards con filtros por tema, creación y sesión de repaso.
- Tests con feedback inmediato y resultados finales.
- Vista de progreso con métricas agregadas.
- Modo claro/oscuro y datos persistidos en `localStorage`.

## 🚀 Comenzar

### Requisitos previos
- Node.js 20.x o superior
- npm
# Folio

Folio es una aplicación de estudio para opositores que organiza temarios, flashcards y tests en un sitio estático.

> Nota importante: los datasets maestros ahora se almacenan en `public/` (es la fuente de verdad). Modifica `public/api` y `public/data/general` directamente para actualizar los contenidos que se despliegan.

## ✨ Resumen de características
- Landing y Dashboard con métricas de estudio
- Gestor de temario y progreso por tema
- Flashcards con sesiones SRS y filtros por tema
- Tests con feedback y estadísticas
- Datos persistidos en `localStorage` por usuario

## Requisitos
- Node.js 20.x o superior
- npm

## Comenzar (local)
```bash
git clone https://github.com/espora-net/Folio.git
cd Folio
npm ci

# Copia variables de ejemplo
cp .env.example .env.local
# (opcional) evitar auth localmente
# echo "NEXT_PUBLIC_SKIP_AUTH=true" >> .env.local

# arranca en modo desarrollo
npm run dev
```

Abre `http://localhost:3000`.

## Estructura relevante
- `public/api/` : JSON públicos que actúan como datasets (MASTER)
- `public/data/general/` : recursos (markdown, pdf, mp3) expuestos
- `src/` : código fuente de la aplicación
- `.github/workflows/nextjs.yml` : workflow de CI/CD que genera `out/` y publica en Pages

## Actualizar datasets (flujo recomendado)
- Edita directamente los archivos en `public/api/` y `public/data/general/`.
- Ejemplo para actualizar el dataset de la Constitución:
```bash
# editar public/api/db-constitucion.json
git add public/api/db-constitucion.json
git commit -m "Actualiza preguntas: Constitución"
git push origin main
```

## Build y export (producción)
- Build normal (si Next funciona en tu entorno):
```bash
npx next build
# si tu next.config permite export, usa:
npx next export
```
- Si `next build`/`next export` falla en tu entorno, puedes simular la salida estática copiando `public/` a `out/`:
```bash
rm -rf out
mkdir -p out/api
cp -a public/. out/
```

## Verificación local rápida
Comprobar que la API pública que se va a desplegar es la que esperas:
```bash
python - <<'PY'
import json
with open('public/api/db-constitucion.json', encoding='utf-8') as f:
    print('public questions =', len(json.load(f).get('questions', [])))
with open('out/api/db-constitucion.json', encoding='utf-8') as f:
    print('out questions =', len(json.load(f).get('questions', [])))
PY
```

## CI / Despliegue (GitHub Actions)
- El workflow `nextjs.yml` realiza:
  1. `npx next build` (genera artefactos de Next)
  2. Crea `out/api` y copia `public/api/*` -> `out/api/*`
  3. Verifica que `public/api/db-constitucion.json` y `out/api/db-constitucion.json` tienen el mismo número de preguntas (si no coinciden, el job falla)
  4. Sube `out/` y despliega a GitHub Pages

Esto asegura que lo que se publica proviene de `public/`, que ahora es la fuente de verdad.

## Buenas prácticas
- Mantén `public/api` versionado si quieres trazabilidad de cambios en datasets.
- Evita subir binarios muy grandes al repo (`public/data/general` puede contener PDFs/MP3s; si esto es un problema, considera usar LFS o un bucket externo).

## Autenticación
- Folio usa Authgear con GitHub OAuth; en desarrollo puedes saltar la auth con `NEXT_PUBLIC_SKIP_AUTH=true`.

## Tecnología
- Next.js 16, React 18, TypeScript, Tailwind CSS

---

Si quieres que además cree un archivo `docs/DEPLOY.md` con una versión extendida de esta guía (logs, debugging y pasos de rollback), lo añado.
