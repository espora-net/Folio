# Optimización de carga de datos con FlatBuffers

## Decisión

Folio mantiene los JSON de `public/api/*.json` como formato editorial y genera un runtime optimizado en `public/api/optimized/` mediante FlatBuffers.

El sitio publicado carga únicamente:

- `api/optimized/manifest.json`
- `api/optimized/index.fb.bin`
- `api/optimized/dataset-*.fb.bin`
- `api/optimized/convocatoria-*.fb.bin`

No hay fallback JSON en runtime. Si falta un artefacto optimizado, la carga debe fallar de forma explícita.
La carpeta `public/api/optimized/` es un artefacto derivado: se puede generar en local para probar, pero el workflow la regenera antes del build.

## Qué datos pasan a FlatBuffers

- Índice runtime equivalente a `db.json`: `meta`, `studyTypes`, descriptores de convocatorias, descriptores de datasets y configuración de simulacro.
- Datasets normalizados: topics/subtopics, preguntas, fuentes, orígenes y flashcards explícitas si existen.
- Convocatorias: temario, bloques, cobertura, recursos y guías de apoyo.
- Índices ligeros: conteos por topic y origin para diagnóstico/medición.

Quedan fuera:

- Progreso, preferencias y estadísticas del usuario, que siguen en `localStorage`.
- PDFs, Markdown, audios y transcripciones completas, que siguen como assets estáticos en `public/data/`.
- Campos legacy no usados por la UI.

## Flujo local

```bash
npm ci
npm run validate-schemas
npm run generate-flatbuffers
npm run build
```

`npm run generate-flatbuffers` requiere `flatc`:

- macOS: `brew install flatbuffers`
- Ubuntu/GitHub Actions: `sudo apt-get install flatbuffers-compiler`

El script también regenera los bindings TypeScript en `src/lib/flatbuffers/generated/`.

## Flujo de publicación

La Action de Pages:

1. Instala dependencias.
2. Instala `flatbuffers-compiler`.
3. Valida los JSON fuente.
4. Genera los artefactos FlatBuffers.
5. Ejecuta `next build`.
6. Comprueba que `out/api/optimized/manifest.json` e `index.fb.bin` existen.
7. Elimina JSON fuente de `out/api` para que el contrato publicado sea el runtime optimizado.

## Contenido UAH añadido

Se añade el dataset `uah-tec-aux-archivos-bibliotecas-2025`:

- 22 temas oficiales convertidos a topics/subtopics.
- 251 preguntas: 164 `curada` y 87 `refuerzo`.
- 96 flashcards explícitas como fuente de estudio.
- Preguntas enlazadas a fuentes mediante `source.materialId`, `source.path` y `source.highlightText`.
- Guías Markdown limpias por tema en `public/data/uah-bibliotecas-2025/`.

## Notas de rendimiento

La mejora principal no busca solo reducir bytes: JSON comprimido suele ser eficiente, pero FlatBuffers evita parseo JSON grande y elimina imports bundled de datasets en el JavaScript inicial. Los buffers se cargan en paralelo desde `manifest.json`, y el decoder queda aislado en `src/lib/optimized-data-api.ts`.
