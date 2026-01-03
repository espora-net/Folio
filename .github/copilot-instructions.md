# Copilot Instructions for Folio

## Visión general

Folio es una aplicación de estudio para opositores/as (y otros perfiles) pensada para funcionar como **sitio estático** (sin backend propio) y persistir el progreso **en el navegador**.

- Framework: **Next.js (App Router)**
- Despliegue: **export estático** (`output: 'export'`) para GitHub Pages u hosting estático.
- Datos: JSON servidos desde `public/api/` (API estática) + fallback “bundled” durante build/runtime.

## Objetivo de estas instrucciones

Cuando propongas cambios:

- Mantén compatibilidad con export estático (evita dependencias de servidor en runtime).
- Respeta el modelo de datos y la estrategia de hidratación/persistencia descritas abajo.
- Mantén el texto de UI y documentación en **español**.

## Registro de decisiones de diseño (mantener actualizado)

Regla obligatoria: **ante cualquier cambio relevante** (arquitectura, datos, persistencia, auth, routing, UX principal), actualiza este mismo documento añadiendo o ajustando una entrada aquí.

Formato recomendado por entrada:

- **Fecha**: `YYYY-MM-DD`
- **Decisión**: (qué se decidió)
- **Motivo**: (por qué)
- **Impacto**: (qué afecta: datos/persistencia/UX/build)
- **Archivos**: (lista corta de archivos tocados)

Decisiones actuales (fuente de verdad):

- 2025-12-14 — **Sitio estático**: Next.js App Router con `output: 'export'` y `trailingSlash: true` para GitHub Pages.
- 2025-12-14 — **Datos sin backend**: `public/api/` es la “API estática” consumida vía `fetch`, con fallback bundled desde imports en `src/lib/data-api.ts`.
- 2025-12-14 — **Persistencia por usuario**: progreso en `localStorage` con claves `clave::userId` y usuario activo en `folio_active_user_id`.
- 2025-12-14 — **No persistir preguntas**: `questions` vienen del dataset y no se guardan; `flashcards` se derivan de `questions`.
- 2025-12-14 — **Authgear + GitHub OAuth**: login client-side, callback en `/auth/callback/` y `NEXT_PUBLIC_SKIP_AUTH=true` para desarrollo/demos.
- 2026-01-03 — **Temario por tipo de estudio**: `public/api/db.json` declara `studyTypes` (plantilla de Temario + datasets asociados) y `convocatorias` enlaza `questionDatasetIds` para relacionar temario con tests.
- 2026-01-03 — **syllabusCoverageIds**: Los subtopics de los datasets (`db-*.json`) incluyen `syllabusCoverageIds` que enlazan con `cobertura_convocatoria` de la convocatoria. Validado automáticamente por workflow `.github/workflows/validate-syllabus-coverage.yml`.

## Estructura del proyecto (resumen)

```
/app/                       Rutas Next.js (App Router)
  page.tsx                  Landing
  auth/                     Pantallas de autenticación
    page.tsx
    callback/page.tsx       Callback OAuth (requiere trailing slash)
  dashboard/                Área principal (layout + secciones)

/src/
  components/               Componentes React (incluye shadcn/ui en components/ui)
  hooks/                    Hooks (auth, theme, toast, etc.)
  lib/                      Núcleo de datos/auth/storage
    data-api.ts             Carga/normalización desde public/api + fallback bundled
    storage.ts              Persistencia localStorage + hidratación (merge)
    data-types.ts           Tipos y contratos de datos
    authgear.ts             Integración Authgear
  views/                    Vistas por sección (UI de dashboard)

/public/api/                “API” estática (JSON + markdown de apoyo)
  db.json                   Índice principal
  db-*.json                 Datasets temáticos (si declarados en db.json)
  convocatoria-*.json       Datos de convocatorias (si declarados en db.json)

/public/data/               Recursos estáticos (temario en documentos)
  general/*.{md,pdf,mp3}    Documentos/recursos del temario

/docs/                      Documentación (AUTHENTICATION, manual)
/out/                       Salida del export estático (generado)
/.next/                     Build cache (generado)
```

## Idioma y terminología

- **Idioma principal**: español
- **Audiencia**: opositores/as en España (y otros perfiles de estudio)
- **Key terms**:
  - "Opositor/Opositora": Person preparing for competitive exams
  - "Oposiciones": Competitive examinations for public sector jobs in Spain
  - "Temario": Syllabus or curriculum
  - "Material propio": Personal/customized study material
  - "Material común": Common/shared study material

## Datos: API estática en `public/api/`

La app carga un índice desde:

- `GET <basePath>/api/db.json`

Y, si `db.json` declara `datasets`, carga cada dataset desde:

- `GET <basePath>/api/<descriptor.file>`

Notas importantes:

- El `basePath` se controla con `NEXT_PUBLIC_BASE_PATH` y se aplica también a assets (`assetPrefix`).
- Existe un **fallback bundled** importado desde `public/api/` en `src/lib/data-api.ts`, usado si falla la red o durante render en servidor.
- `src/lib/data-api.ts` normaliza datasets heterogéneos y aplica defaults (p. ej. `origin`).

### Convocatorias

Las convocatorias se gestionan con funciones específicas en `src/lib/data-api.ts` (no forman parte del `cachedDatabase` principal):

- Descriptores: `convocatorias` en `public/api/db.json`
- Carga: `fetchConvocatoria(id)` desde `public/api/<descriptor.file>` con fallback bundled

## Persistencia: `localStorage` por usuario

La persistencia está implementada en `src/lib/storage.ts` con aislamiento por usuario:

- Usuario activo: `folio_active_user_id`
- Claves “scoped”: `clave::userId` (con fallback a claves legacy sin scope)

Reglas de persistencia actuales:

- **Topics**: se guardan en localStorage y se preserva `completed` durante la hidratación.
- **Stats**: se guardan en localStorage (solo se inicializan si no existen).
- **Questions**: son “fuente de verdad” desde la API estática/bundled y **no se persisten**.
- **Flashcards**: se **derivan** de `questions` (no se guardan como entidad propia).
- **Preferencias** (onboarding / tipo de estudio): `folio_preferences::userId`.

⚠️ Importante al modificar tipos/merge:

- En `src/lib/data-types.ts`, **añade campos como opcionales** (`field?: ...`) para compatibilidad con datos antiguos.
- Evita reintroducir persistencia de preguntas: hay limpieza explícita de claves antiguas `folio_questions`.

## Guías de desarrollo

### Añadir o actualizar datasets JSON

Si añades un dataset nuevo o cambias uno existente:

1. Coloca/actualiza el JSON en `public/api/`.
2. Registra/actualiza el descriptor en `public/api/db.json` (campo `datasets`).
3. Si quieres que funcione también como fallback bundled (recomendado):
  - Añade el `import` en `src/lib/data-api.ts` y rellena el `FALLBACK_DATASETS[...]` correspondiente.
4. Mantén compatibilidad con normalización existente (campos `correctIndex`/`correctAnswer`, `nextReview`/`nextReviewDate`, etc.).

### Añadir o actualizar convocatorias

1. Coloca/actualiza el JSON de convocatoria en `public/api/`.
2. Declara el descriptor en `public/api/db.json` (campo `convocatorias`).
3. Añade el `import` y el mapping en `FALLBACK_CONVOCATORIAS` dentro de `src/lib/data-api.ts` para fallback bundled.

### Al modificar JSON

- Mantén JSON válido y formateado consistentemente.
- Evita cambios breaking en nombres de campo sin actualizar la normalización.
- Mantén textos user-facing en español.
- Fechas en ISO (`YYYY-MM-DD`) cuando aplique.

### Estándares de documentación

- Documentación en español y tono profesional/educativo.
- Mantén terminología consistente (temario, oposiciones, etc.).

### Convenciones de nombres

- Minúsculas y guiones en nombres.
- Evita espacios en nombres de archivo.

## UI y componentes

- Componentes UI reutilizables: `src/components/ui/` (shadcn/ui + Radix).
- Componentes de dominio: `src/components/dashboard/`, `src/components/landing/`.
- Evita introducir nuevos patrones de estilos: reutiliza utilidades existentes (Tailwind + componentes).

## Autenticación (Authgear + GitHub OAuth)

Arquitectura:

- SDK/configuración: `src/lib/authgear.ts`
- Contexto/hook: `src/hooks/useAuth.tsx`
- Callback OAuth: `app/auth/callback/page.tsx`

Guías:

- No expongas secretos (solo hay clientID/endpoint públicos; los secretos viven fuera).
- Respeta `NEXT_PUBLIC_SKIP_AUTH=true` para desarrollo/demos.
- Mantén el callback con barra final `/auth/callback/` (por `trailingSlash: true`).
- No permitas redirects arbitrarios: el returnTo se sanitiza (solo prefijos permitidos).

## Convenciones de datos (questions / origin / source)

- `TestQuestion.origin` es opcional (compatibilidad). En normalización se default a `'generated'` si falta.
- `TestQuestion.source` (si existe) enlaza a un material y un `highlightText` (útil para trazabilidad).
- En UI, el origen se muestra como etiqueta (por ejemplo: `oficial`, `ia`, `generated`). Evita acoplar a un set cerrado: si aparece un origen nuevo, debe degradar de forma legible.

## Testing y validación

- Valida JSON (sintaxis) y que los ficheros referenciados existan en `public/api`.
- Verifica que `npm run dev` y `npm run build` sigan funcionando con export estático.

## Ejecución y build

- Dev: `npm run dev`
- Build export: `npm run build` (genera `out/`)

Si necesitas detalles de despliegue/auth, ver `docs/AUTHENTICATION.md` y `README.md`.
