# Documentación de Schemas de Datos

Este documento describe los schemas JSON utilizados en Folio para validar la estructura de los archivos de datos.

## Archivos de Schema

### 1. `db.schema.json`

Schema para el archivo `db.json`, el índice principal de datos de Folio.

**Archivo validado:** `public/api/db.json`

#### Estructura principal

El archivo `db.json` contiene cuatro secciones principales:

- **meta**: Metadatos del índice (título, descripción, versión, fecha de actualización)
- **studyTypes**: Tipos de estudio disponibles en la aplicación
- **convocatorias**: Convocatorias de oposiciones disponibles
- **datasets**: Datasets temáticos de preguntas y flashcards

#### Objeto `convocatoria`

Cada convocatoria en el array `convocatorias` debe incluir:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Identificador único de la convocatoria |
| `title` | string | Sí | Título completo de la convocatoria |
| `shortTitle` | string | Sí | Título corto para mostrar en la UI |
| `institucion` | string | Sí | Nombre de la institución convocante |
| `cuerpo` | string | Sí | Cuerpo, escala o puesto al que se opone |
| `año` | integer | Sí | Año de la convocatoria |
| `file` | string | Sí | Nombre del archivo JSON con el detalle |
| `color` | string | Sí | Color hexadecimal (#RRGGBB) |
| `activa` | boolean | No | **Por defecto: `true`**. Indica si la convocatoria está activa |
| `studyType` | string | Sí | Tipo de estudio asociado |
| `questionDatasetIds` | array | Sí | IDs de datasets vinculados |

##### Atributo `activa`

**Importante:** El atributo `activa` tiene un comportamiento por defecto:

- Si **no se especifica** en el JSON, se considera `true` por defecto
- Solo es necesario incluirlo explícitamente si se quiere marcar como `false`

**Ejemplo de uso:**

```json
{
  "convocatorias": [
    {
      "id": "conv-2025",
      "title": "Convocatoria 2025",
      "activa": false
    },
    {
      "id": "conv-2026",
      "title": "Convocatoria 2026"
      // activa = true (por defecto)
    }
  ]
}
```

En el ejemplo anterior, `conv-2025` está explícitamente inactiva, mientras que `conv-2026` está activa por defecto al no especificar el campo.

### 2. `question-bank.schema.json`

Schema consolidado para archivos `db-*.json` que contienen datasets de preguntas y flashcards.

**Archivos validados:** 
- `public/api/db-constitucion.json`
- `public/api/db-estatuto-basico-del-empleado-publico-EBEP.json`
- `public/api/db-ley-organica-2-2023-sistema-universitario.json`
- Cualquier otro archivo `db-*.json`

#### Estructura principal

Los archivos de dataset deben incluir:

- **topics**: Array de temas principales
- **questions**: Array de preguntas tipo test
- **subtopics**: Subtemas organizados dentro de cada topic

## Validación de Schemas

### Ejecutar validación

Para validar todos los archivos JSON contra sus schemas:

```bash
npm run validate-schemas
```

Este comando valida:

1. **`db.json`** contra `db.schema.json`
2. Todos los archivos **`db-*.json`** contra `question-bank.schema.json`

### Salida esperada

```
Validating database index file...

✅ db.json

Validating dataset files...

Found 3 dataset file(s) to validate.

✅ db-constitucion.json
✅ db-estatuto-basico-del-empleado-publico-EBEP.json
✅ db-ley-organica-2-2023-sistema-universitario.json

✅ All files are valid!
```

### En caso de error

Si un archivo no cumple con el schema, la salida mostrará:

```
❌ db.json
   Path: /convocatorias/0/año
   Error: must be integer
   Details: {"type":"integer"}
```

## Añadir nuevas convocatorias

Al añadir una nueva convocatoria al archivo `db.json`:

1. **No es necesario** incluir `"activa": true` si la convocatoria debe estar activa
2. **Sí es necesario** incluir `"activa": false` si la convocatoria debe estar inactiva
3. Ejecutar `npm run validate-schemas` para verificar que el JSON es válido
4. Asegurarse de que el archivo referenciado en `file` existe en `public/api/`

## Referencias

- **JSON Schema Draft 07**: http://json-schema.org/draft-07/schema
- **AJV (validador)**: https://ajv.js.org/
- **Código de validación**: `scripts/validate-schemas.cjs`
