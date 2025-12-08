# Especificación funcional de referencias documentales

## Objetivo
Vincular cada ejercicio/pregunta de aprendizaje con la documentación fuente almacenada en `docs/`, permitiendo:
- Mostrar al usuario dónde se encuentra la respuesta.
- Abrir el PDF en la página adecuada.
- Resaltar el texto de la respuesta asociado al ejercicio.

## Modelo de datos
- **Nuevo tipo `DocumentReference`**:
  - `materialId`: identificador del material en los `materiales.json`.
  - `path`: ruta relativa dentro de `docs/` (por ejemplo `comun/guia-respuestas.pdf`).
  - `page`: número de página a abrir.
  - `highlightText` (opcional): texto que se resalta y se muestra junto a la respuesta.
- **Flashcards y preguntas de test** (`data/db.json`) incorporan el campo opcional `source: DocumentReference`.
- El material de referencia publicado es `docs/comun/guia-respuestas.pdf` (id `guia-respuestas-001`), registrado en `docs/comun/materiales.json`.

## Exposición de documentos
- Nuevo endpoint `GET /api/docs/[...path]`:
  - Sirve cualquier archivo dentro de `docs/` de forma segura (normaliza la ruta y bloquea accesos fuera de la carpeta).
  - Devuelve los PDF con `Content-Type: application/pdf` y `Content-Disposition: inline` para abrir en el navegador.
  - Permite fragmentos `#page={n}&search={texto}` en el URL para abrir en la página y lanzar la búsqueda del texto resaltado.

## Comportamiento en la interfaz
- **Test**:
  - Tras confirmar la respuesta se muestra un bloque “Referencia en documentación” con:
    - Ruta y página del PDF.
    - Texto de respuesta resaltado.
    - Botón “Abrir PDF” que abre `/api/docs/{path}#page={page}&search={highlightText}` en nueva pestaña.
- **Tarjetas (flashcards)**:
  - Al voltear la tarjeta se muestra el mismo bloque de referencia con botón de apertura y texto resaltado.
- El resaltado se muestra tanto en la UI (mediante `<mark>`) como en el visor PDF del navegador vía parámetro `search`.

## Supuestos y límites
- Los PDF deben residir en `docs/`; las rutas en `source.path` son relativas a esa carpeta.
- La búsqueda resaltada depende del visor PDF del navegador (pdf.js integrado en la mayoría de navegadores modernos).
- Si un ejercicio no tiene `source`, la UI no muestra el bloque de referencia.
