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
- `data/db.json` actúa como índice y enlaza los datasets temáticos (`data/db-*.json`, p. ej. `db-constitucion.json`) que se copian automáticamente a `public/api/` durante el build para exponerlos como API estática respetando `NEXT_PUBLIC_BASE_PATH`.
- En el navegador se trabaja sobre `localStorage` (temario, flashcards, tests y estadísticas) para mantener el progreso sin backend, aislando los datos por usuario autenticado.
- Los componentes escuchan el evento `folio-data-updated` para refrescar la información cuando cambian los datos locales.

## 🔑 Autenticación con GitHub

Folio utiliza [Authgear](https://www.authgear.com/) como proveedor de identidad con GitHub OAuth:

- **Login real**: Autenticación OAuth con cuentas de GitHub mediante flujo PKCE
- **Sesiones persistentes**: Refresh tokens almacenados de forma segura
- **Protección client-side**: Las rutas del dashboard requieren sesión activa
- **Modo desarrollador**: Activa `NEXT_PUBLIC_SKIP_AUTH=true` para desarrollo sin configurar OAuth

### Configuración rápida

1. Crea un proyecto en [Authgear](https://portal.authgear.com/)
2. Configura GitHub como proveedor de identidad social
3. Añade las URIs de redirect correspondientes
4. Actualiza `AUTHGEAR_CLIENT_ID` y `AUTHGEAR_ENDPOINT` en `src/lib/authgear.ts`

📖 **Documentación completa**: [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)

## 🛳️ Despliegue en GitHub Pages

1. Configura Authgear con las URIs de tu dominio (ver [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md))
2. El workflow de GitHub Actions (`nextjs.yml`) gestiona automáticamente:
   - Inyección del `basePath` para el repositorio
   - Build de Next.js con export estático
   - Despliegue a GitHub Pages
3. Ejecuta `npm run build` localmente para generar la carpeta estática `out/`
4. La API estática queda disponible en `${basePath}/api/db.json`
5. Previsualiza el resultado con `npx serve out` antes de subir

### Dominio personalizado

Si usas un dominio personalizado (ej. `folio.espora.net`):
- Configura el archivo CNAME en GitHub Pages
- Actualiza las URIs de redirect en Authgear
- Deja `NEXT_PUBLIC_BASE_PATH` vacío (no hay subdirectorio)

## 🧰 Tecnologías
- Next.js 16 (App Router, export estático)
- React 18 + TypeScript
- Tailwind CSS 3 + shadcn/ui + Lucide React
- Datos locales en JSON y `localStorage`
