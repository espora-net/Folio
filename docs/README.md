# Documentación para Oposiciones

Esta carpeta contiene toda la documentación y materiales de estudio organizados para la preparación de oposiciones.

## Estructura de Carpetas

```
docs/
├── comun/                    # Materiales comunes a todas las oposiciones
│   ├── materiales.json       # Metadatos de los materiales comunes
│   └── *.pdf                 # Documentos PDF comunes
├── material-propio/          # Material personalizado del opositor
│   ├── materiales.json       # Metadatos del material propio
│   └── *.pdf                 # Documentos PDF propios
├── indice.json               # Índice general de toda la documentación
└── README.md                 # Este archivo
```

## Descripción de Carpetas

### `comun/`
Contiene materiales de estudio aplicables a cualquier oposición:
- Legislación general (Constitución, leyes básicas, etc.)
- Temarios comunes
- Normativa de aplicación general

### `material-propio/`
Espacio para materiales personalizados:
- Resúmenes propios
- Esquemas y mapas mentales
- Notas de estudio
- Tests de práctica personales

## Archivos JSON

### `indice.json`
Índice completo que describe:
- Estructura general de la documentación
- Categorías de materiales disponibles
- Niveles de relevancia
- Tipos de archivos soportados

### `materiales.json` (en cada carpeta)
Describe cada material con los siguientes campos:
- `id`: Identificador único del material
- `titulo`: Nombre descriptivo del documento
- `tipo`: Formato del archivo (PDF, DOC, etc.)
- `categoria`: Clasificación del material
- `descripcion`: Descripción detallada del contenido
- `temas_relacionados`: Lista de temas que cubre
- `relevancia`: Nivel de importancia (alta, media, baja)
- `fecha_actualizacion`: Última actualización del material
- `archivo`: Nombre del archivo

## Cómo Añadir Nuevos Materiales

1. Coloca el archivo PDF en la carpeta correspondiente (`comun/` o `material-propio/`)
2. Añade una entrada en el archivo `materiales.json` de esa carpeta con todos los metadatos
3. El índice general se actualiza automáticamente al leer los archivos de materiales

## Tipos de Archivo Soportados

- **PDF**: Formato principal recomendado
- **DOC/DOCX**: Documentos de Word
- **TXT**: Archivos de texto plano
