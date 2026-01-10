# Conversión de PDFs a Markdown

Guía rápida para ejecutar la acción que convierte nuevos PDFs en `data/general` a archivos Markdown.

## Pasos
1. Añade el PDF en la carpeta `data/general` (o en un subdirectorio dentro de ella) y sube el cambio a la rama desde la que lanzarás la acción (habitualmente tu rama de feature/PR).
2. En GitHub, abre **Actions** y selecciona el flujo **Generar Markdown desde PDFs**.
3. Pulsa **Run workflow**. Deja el valor por defecto `data/general` en el campo **ruta_pdf** (o indica el subdirectorio si usas otro dentro de `data/general`).
4. Espera a que termine. La acción generará los `.md` con el mismo nombre que cada PDF y publicará un artefacto llamado **markdown-desde-pdfs**.
5. Descarga el artefacto, extrae los `.md` y colócalos en el repositorio respetando la misma estructura de carpetas que los PDFs originales (`data/general/...`). Después sube esos archivos en tu siguiente commit/PR.
6. Actualiza `public/data/general/README.md` añadiendo la nueva fuente y sus formatos en la tabla para mantener el índice al día.

> Nota: La acción no sube cambios al repositorio; solo entrega los Markdown como artefacto para que los añadas manualmente.
