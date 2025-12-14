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

### Instalación y desarrollo local
```bash
git clone https://github.com/espora-net/study-buddy-hub.git
cd study-buddy-hub
npm install

# Copia variables y, si quieres, omite el login en local
cp .env.example .env.local
# echo "NEXT_PUBLIC_SKIP_AUTH=true" >> .env.local

npm run dev
```

Abre `http://localhost:3000` en tu navegador.

### Variables de entorno
- `NEXT_PUBLIC_BASE_PATH`: base path para despliegues en GitHub Pages (ej. `/mi-repo`). Déjalo vacío en desarrollo local.
- `NEXT_PUBLIC_SKIP_AUTH`: ajústalo a `true` para saltar la autenticación durante el desarrollo.

## 📝 Scripts disponibles
```bash
# Desarrollo
npm run dev

# Compilación estática (genera /out listo para Pages)
npm run build

# Previsualizar build exportado
npx serve out
```

## 🏗️ Estructura del proyecto
```
app/
├── page.tsx                 # Landing
├── auth/                    # Pantalla de login con GitHub (authsite)
└── dashboard/               # Área privada
    ├── layout.tsx
    ├── page.tsx             # Inicio del dashboard
    ├── temario/
    ├── flashcards/
    ├── tests/
    └── progreso/
data/db.json                 # Semilla de datos
public/api/db.json           # Copia estática generada en build
src/
├── components/              # UI y layout
├── lib/                     # data-api, storage y utilidades
└── views/                   # Pantallas de landing y dashboard
```

## 🔄 Datos y almacenamiento
- `data/db.json` se copia automáticamente a `public/api/db.json` durante el build para exponerla como API estática respetando `NEXT_PUBLIC_BASE_PATH`.
- En el navegador se trabaja sobre `localStorage` (temario, flashcards, tests y estadísticas) para mantener el progreso sin backend.
- Los componentes escuchan el evento `folio-data-updated` para refrescar la información cuando cambian los datos locales.

## 🔑 Autenticación con GitHub
- El login se delega al bundle generado por **authsite** en `/auth/api.js`, resolviendo la ruta con `NEXT_PUBLIC_BASE_PATH`.
- Si quieres autenticación real, coloca la carpeta generada por authsite en `public/auth` antes de construir para que se exporte a `out/auth`.
- Para desarrollo rápido, activa `NEXT_PUBLIC_SKIP_AUTH=true` y el dashboard se abrirá sin login.

## 🛳️ Despliegue en GitHub Pages
1. Define `NEXT_PUBLIC_BASE_PATH` con el nombre del repositorio (ej. `/mi-repo`) en `.env.local` o en tu flujo de CI.
2. (Opcional, si usas auth real) Añade la carpeta generada por authsite en `public/auth` para que se publique `auth/api.js`.
3. Ejecuta `npm run build` para generar la carpeta estática `out/`.
4. Publica el contenido de `out/` en GitHub Pages (rama `gh-pages` o acción equivalente). La API quedará disponible en `${NEXT_PUBLIC_BASE_PATH}/api/db.json`.
5. Previsualiza el resultado con `npx serve out` antes de subirlo.

## 🧰 Tecnologías
- Next.js 16 (App Router, export estático)
- React 18 + TypeScript
- Tailwind CSS 3 + shadcn/ui + Lucide React
- Datos locales en JSON y `localStorage`
