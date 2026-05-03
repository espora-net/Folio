# Copilot Instructions for Folio

## Visión general

Folio es una aplicación de estudio para opositores/as (y otros perfiles) pensada para funcionar como **sitio estático** (sin backend propio) y persistir el progreso **en el navegador**.

- Framework: **Next.js (App Router)**
- Despliegue: **export estático** (`output: 'export'`) para GitHub Pages u hosting estático.
- Datos: JSON fuente en `public/api/` transformado a FlatBuffers en `public/api/optimized/` para runtime publicado.

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
- 2025-12-14 — **Datos sin backend**: `public/api/` nació como “API estática” JSON consumida vía `fetch`; desde 2026-05-02 el runtime publicado usa FlatBuffers derivados.
- 2025-12-14 — **Persistencia por usuario**: progreso en `localStorage` con claves `clave::userId` y usuario activo en `folio_active_user_id`.
- 2025-12-14 — **No persistir preguntas**: `questions` vienen del dataset y no se guardan; las `flashcards` tampoco se persisten (ver decisión 2026-05-03).
- 2025-12-14 — **Authgear + GitHub OAuth**: login client-side, callback en `/auth/callback/` y `NEXT_PUBLIC_SKIP_AUTH=true` para desarrollo/demos.
- 2026-01-03 — **Temario por tipo de estudio**: `public/api/db.json` declara `studyTypes` (plantilla de Temario + datasets asociados) y `convocatorias` enlaza `questionDatasetIds` para relacionar temario con tests.
- 2026-01-03 — **syllabusCoverageIds**: Los subtopics de los datasets (`db-*.json`) incluyen `syllabusCoverageIds` que enlazan con `cobertura_convocatoria` de la convocatoria. Validado por el agente `.github/agents/ValidateSyllabusCoverage.agent.md` antes de cualquier merge.
- 2026-01-04 — **Schema consolidado para datasets**: Todos los archivos `db-*.json` siguen el mismo schema definido en `public/api/question-bank.schema.json`. Validación con `npm run validate-schemas`. Campos `correctAnswer` y `correctIndex` son intercambiables (normalizados a `correctIndex` en runtime).
- 2026-05-02 — **Runtime FlatBuffers sin fallback JSON**: los JSON de `public/api/*.json` son fuente editorial; `npm run generate-flatbuffers` genera `public/api/optimized/manifest.json` y `.fb.bin`; el sitio publicado consume solo FlatBuffers y la Action elimina JSON fuente de `out/api`. Archivos: `schemas/folio-data.fbs`, `scripts/generate-flatbuffers-data.mjs`, `src/lib/optimized-data-api.ts`, `.github/workflows/nextjs.yml`.
- 2026-05-02 — **Contenido específico UAH Bibliotecas 2025**: se añade el dataset `uah-tec-aux-archivos-bibliotecas-2025` con preguntas `curada`/`refuerzo`, fuentes enlazadas y guías Markdown limpias por tema en `public/data/uah-bibliotecas-2025/`.
- 2026-05-03 — **Flashcards curadas por dataset**: cada `db-*.json` puede declarar un array `flashcards` (formalizado en `question-bank.schema.json`) con `{id, topicId, question, answer, origin}`. Si un dataset incluye flashcards curadas, en runtime se usan tal cual y NO se derivan flashcards desde sus preguntas (los enunciados de test no se adaptan al formato pregunta/respuesta). Para datasets sin `flashcards`, se mantiene el fallback legacy de derivar 1:1 desde `questions`. Archivos: `public/api/question-bank.schema.json`, `src/lib/storage.ts`.

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
    data-api.ts             Fachada de datos usada por la UI
    optimized-data-api.ts   Carga/decodificación de FlatBuffers runtime
    storage.ts              Persistencia localStorage + hidratación (merge)
    data-types.ts           Tipos y contratos de datos
    authgear.ts             Integración Authgear
    flatbuffers/generated/  Bindings TypeScript generados por flatc
  views/                    Vistas por sección (UI de dashboard)

/public/api/                Fuente editorial JSON + runtime optimizado
  db.json                   Índice fuente
  db-*.json                 Datasets fuente
  convocatoria-*.json       Convocatorias fuente
  optimized/                manifest.json + artefactos .fb.bin generados

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

## Datos: JSON fuente y runtime FlatBuffers

Los JSON de `public/api/*.json` son fuente editorial. No son el contrato runtime del sitio publicado.

Flujo obligatorio:

1. Editar JSON fuente en `public/api/`.
2. Ejecutar `npm run validate-schemas`.
3. Ejecutar `npm run generate-flatbuffers`.
4. Build/publicación consumen `public/api/optimized/manifest.json` y `.fb.bin`.

La app carga:

- `GET <basePath>/api/optimized/manifest.json`
- `GET <basePath>/api/optimized/index.fb.bin`
- `GET <basePath>/api/optimized/dataset-*.fb.bin`
- `GET <basePath>/api/optimized/convocatoria-*.fb.bin`

Notas importantes:

- El `basePath` se controla con `NEXT_PUBLIC_BASE_PATH` y se aplica también a assets (`assetPrefix`).
- No reintroduzcas imports bundled de datasets JSON grandes en `src/lib/data-api.ts`.
- Si un artefacto FlatBuffers falta o es inválido, debe fallar de forma explícita; no añadas fallback JSON silencioso.
- `src/lib/optimized-data-api.ts` debe aislar los tipos generados y convertirlos a `data-types.ts`.

### Convocatorias

Las convocatorias se gestionan con funciones específicas en `src/lib/data-api.ts` (no forman parte del `cachedDatabase` principal):

- Descriptores: `convocatorias` en `public/api/db.json`
- Carga: `fetchConvocatoria(id)` desde `api/optimized/convocatoria-<id>.fb.bin`

### Modelo de Cobertura de Convocatoria (syllabusCoverageIds)

Este sistema permite filtrar las preguntas de un dataset para mostrar **solo las que entran en una convocatoria específica**. El flujo es:

1. **Convocatoria** (`convocatoria-*.json`): Define en cada tema un array `cobertura_convocatoria` con los IDs de las secciones exigidas. Ejemplo para el Tema 3 (Ley 40/2015):
   ```json
   {
     "id": "uah-tema-003",
     "titulo": "Ley 40/2015 de Régimen del Sector Público",
     "cobertura_convocatoria": [
       "#titulo-preliminar-capitulo-i",
       "#titulo-preliminar-capitulo-ii-seccion-1",
       "#titulo-preliminar-capitulo-ii-seccion-3-subseccion-1",
       "#titulo-preliminar-capitulo-ii-seccion-3-subseccion-2",
       "#titulo-preliminar-capitulo-ii-seccion-4",
       "#titulo-preliminar-capitulo-v"
     ]
   }
   ```

2. **Dataset** (`db-*.json`): Cada `subtopic` puede incluir un array `syllabusCoverageIds` que indica a qué secciones de la convocatoria pertenece. Ejemplo:
   ```json
   {
     "id": "constitucion-espanola-1978-preambulo-y-titulo-preliminar",
     "title": "Preámbulo y Título Preliminar de la Constitución de 1978",
     "syllabusCoverageIds": ["#titulo-preliminar"]
   }
   ```

3. **Preguntas**: Cada pregunta tiene un `topicId` que apunta al ID de un subtopic. Si ese subtopic tiene `syllabusCoverageIds`, la pregunta entra en la convocatoria.

**Diagrama de relación**:
```
convocatoria-*.json                  db-*.json
    │                                    │
    └─ temas[].cobertura_convocatoria    └─ topics[].subtopics[].syllabusCoverageIds
           │                                          │
           │    ┌────────────────────────────────────┘
           ▼    ▼
       IDs deben coincidir (ej: "#titulo-i")
                                    │
                                    ▼
                       questions[].topicId → subtopic.id
```

**Nomenclatura de los IDs de cobertura**:

Los IDs deben reflejar la **jerarquía completa** de la estructura del documento legal para evitar ambigüedades. Formato:

```
#<nivel1>[-<nivel2>[-<nivel3>[-<nivel4>]]]
```

**Reglas de nomenclatura**:
1. SIEMPRE con prefijo `#`
2. Minúsculas y guiones (sin acentos, sin espacios)
3. **Incluir la jerarquía completa desde el nivel más alto**: si un capítulo pertenece a un título específico, incluir ambos (ej: `#titulo-ix-capitulo-i`, no solo `#capitulo-i`)
4. Separar niveles jerárquicos con guiones simples
5. Evitar texto descriptivo adicional (no incluir nombres de artículos, solo su posición estructural)

**Ejemplos de nomenclatura correcta**:
| Referencia legal                                      | ID correcto                                     |
|-------------------------------------------------------|------------------------------------------------|
| Título Preliminar                                     | `#titulo-preliminar`                           |
| Título I                                              | `#titulo-i`                                    |
| Título IX, Capítulo I                                 | `#titulo-ix-capitulo-i`                        |
| Título IX, Capítulo II                                | `#titulo-ix-capitulo-ii`                       |
| Título Preliminar, Capítulo II, Sección 1             | `#titulo-preliminar-capitulo-ii-seccion-1`     |
| Título Preliminar, Capítulo II, Sección 3, Subsección 1 | `#titulo-preliminar-capitulo-ii-seccion-3-subseccion-1` |
| Título I, Capítulo IV                                 | `#titulo-i-capitulo-iv`                        |
| Título I, Capítulo VI                                 | `#titulo-i-capitulo-vi`                        |

**Ejemplos de nomenclatura incorrecta** (a evitar):
| Incorrecto                        | Problema                                    | Correcto                           |
|-----------------------------------|---------------------------------------------|------------------------------------|
| `#capitulo-i`                     | Ambiguo: ¿de qué título?                    | `#titulo-ix-capitulo-i`            |
| `#capitulo-v`                     | Ambiguo: ¿de qué título?                    | `#titulo-ix-capitulo-v`            |
| `#titulo-i-objeto-y-ambito`       | Incluye texto descriptivo innecesario       | `#titulo-i`                        |
| `#Titulo-I`                       | Usa mayúsculas                              | `#titulo-i`                        |

**Casos especiales**:
- Para normativas específicas de instituciones (ej: UAH, URJC), se pueden usar IDs descriptivos únicos: `#codigo-etico-general-uah`, `#normas-de-convivencia-uah`
- Para aplicaciones ofimáticas u otros temas no legales: `#word-365`, `#excel-365`

**Archivo de referencia**: `db-constitucion.json` es el modelo canónico para el formato de `syllabusCoverageIds`.

**Validación**: El agente `.github/agents/ValidateSyllabusCoverage.agent.md` valida la coherencia entre convocatorias y datasets antes de cualquier merge.

## Persistencia: `localStorage` por usuario

La persistencia está implementada en `src/lib/storage.ts` con aislamiento por usuario:

- Usuario activo: `folio_active_user_id`
- Claves “scoped”: `clave::userId` (con fallback a claves legacy sin scope)

Reglas de persistencia actuales:

- **Topics**: se guardan en localStorage y se preserva `completed` durante la hidratación.
- **Stats**: se guardan en localStorage (solo se inicializan si no existen).
- **Questions**: vienen del runtime optimizado generado desde JSON fuente y **no se persisten**.
- **Flashcards**: si el dataset declara un array `flashcards`, se usan esas flashcards curadas (origen editorial); en caso contrario se **derivan** automáticamente de `questions` como fallback. No se persisten en localStorage.
- **Preferencias** (onboarding / tipo de estudio): `folio_preferences::userId`.

⚠️ Importante al modificar tipos/merge:

- En `src/lib/data-types.ts`, **añade campos como opcionales** (`field?: ...`) para compatibilidad con datos antiguos.
- Evita reintroducir persistencia de preguntas: hay limpieza explícita de claves antiguas `folio_questions`.

## Guías de desarrollo

### Añadir o actualizar datasets JSON

Si añades un dataset nuevo o cambias uno existente:

1. Coloca/actualiza el JSON en `public/api/`.
2. Registra/actualiza el descriptor en `public/api/db.json` (campo `datasets`).
3. Ejecuta `npm run validate-schemas`.
4. Ejecuta `npm run generate-flatbuffers`.
5. Mantén compatibilidad con normalización existente (campos `correctIndex`/`correctAnswer`, `nextReview`/`nextReviewDate`, etc.).

### Añadir o actualizar convocatorias

1. Coloca/actualiza el JSON de convocatoria en `public/api/`.
2. Declara el descriptor en `public/api/db.json` (campo `convocatorias`).
3. Ejecuta `npm run validate-schemas`.
4. Ejecuta `npm run generate-flatbuffers`.

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
- Ejecuta `npm run generate-flatbuffers` después de cambios de datos.
- Verifica que `npm run dev` y `npm run build` sigan funcionando con export estático.

## Ejecución y build

- Dev: `npm run dev`
- Build export: `npm run validate-schemas && npm run generate-flatbuffers && npm run build` (genera `out/`)

Si necesitas detalles de despliegue/auth, ver `docs/AUTHENTICATION.md` y `README.md`.
