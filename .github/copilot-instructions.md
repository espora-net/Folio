# Copilot Instructions for Folio

## Repository Overview

Folio is a study application designed for competitive exam candidates (opositores) in Spain who want to pass their exams in an intelligent, organized way without wasting time. The application helps manage and organize study materials for competitive examinations.

## Project Structure

```
/
├── docs/                           # All documentation and study materials
│   ├── comun/                      # Common materials for all competitive exams
│   │   ├── materiales.json         # Metadata for common materials
│   │   └── *.pdf                   # Common PDF documents
│   ├── material-propio/            # User's personalized study materials
│   │   ├── materiales.json         # Metadata for personal materials
│   │   └── *.pdf                   # Personal PDF documents
│   ├── indice.json                 # General index of all documentation
│   └── README.md                   # Documentation structure explanation
├── .github/                        # GitHub configuration
├── .gitignore                      # Git ignore rules
├── LICENSE                         # Project license
└── README.md                       # Main project README
```

## Language and Terminology

- **Primary language**: Spanish (español)
- **Target audience**: Spanish competitive exam candidates (opositores)
- **Key terms**:
  - "Opositor/Opositora": Person preparing for competitive exams
  - "Oposiciones": Competitive examinations for public sector jobs in Spain
  - "Temario": Syllabus or curriculum
  - "Material propio": Personal/customized study material
  - "Material común": Common/shared study material

## JSON Schema Standards

### `materiales.json` Schema

Each `materiales.json` file in `comun/` and `material-propio/` directories follows this structure:

```json
{
  "descripcion": "Description of the materials collection",
  "materiales": [
    {
      "id": "unique-identifier",
      "titulo": "Descriptive title",
      "tipo": "PDF|DOC|DOCX|TXT",
      "categoria": "Legislación|Resúmenes|Esquemas|Tests|Casos Prácticos",
      "descripcion": "Detailed description of the content",
      "temas_relacionados": ["Tema 1", "Tema 2", "Conceptos básicos"],
      "relevancia": "alta|media|baja",
      "fecha_actualizacion": "YYYY-MM-DD",
      "archivo": "filename.ext"
    }
  ]
}
```

### `indice.json` Schema

The main index file contains:

- **titulo**: General index title
- **descripcion**: Index description
- **estructura**: Directory structure with paths and descriptions
- **categorias**: Available material categories with relevance levels
- **niveles_relevancia**: Explanation of relevance levels
- **tipos_archivo_soportados**: Supported file types
- **version**: Index version
- **fecha_actualizacion**: Last update date

## Development Guidelines

### When Adding New Materials

1. Place the PDF/document in the appropriate directory (`comun/` or `material-propio/`)
2. Add a complete entry in the corresponding `materiales.json` file
3. Ensure all required fields are present
4. Use appropriate date format (YYYY-MM-DD)
5. Maintain consistent Spanish language usage

### When Modifying JSON Files

- Maintain proper JSON syntax and formatting
- Preserve the existing schema structure
- Use Spanish for all user-facing text
- Follow the established category names
- Keep date fields in ISO format (YYYY-MM-DD)
- Ensure unique IDs for each material

### Documentation Standards

- All documentation files should be in Spanish
- Use clear, professional language appropriate for educational context
- Maintain consistent terminology across all files
- README files should explain the purpose and structure clearly

### File Naming Conventions

- Use lowercase for directory names
- Use hyphens for multi-word directory names (e.g., `material-propio`)
- PDF and document names should be descriptive and lowercase
- Avoid spaces in filenames; use hyphens instead
- Use Spanish names that clearly indicate content

### Material Categories

Valid categories for materials:
- **Legislación**: Laws, regulations, and legal texts
- **Resúmenes**: Summaries of topics and key concepts
- **Esquemas**: Visual schemas and concept maps
- **Tests**: Practice exams and self-assessment tests
- **Casos Prácticos**: Practical cases and solved exercises

### Relevance Levels

- **alta**: Essential material for passing the exam
- **media**: Recommended complementary material
- **baja**: Additional support material

## Code Style

- Use UTF-8 encoding for all files
- JSON files should be properly indented (2 spaces)
- Maintain consistency with existing code style
- Keep files organized according to the established structure

## Testing and Validation

- Validate JSON files for syntax errors before committing
- Ensure all referenced files exist in their specified locations
- Check that dates are in correct format
- Verify that all required fields are present in material entries

## Important Notes

- This is primarily a documentation and content management repository
- Focus on maintaining clean, well-structured JSON metadata
- All content should be appropriate for educational purposes
- Respect the Spanish language and educational context
