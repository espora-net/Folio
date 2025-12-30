# Copilot Instructions for Folio

## Repository Overview

Folio is a study application designed for competitive exam candidates (opositores) in Spain who want to pass their exams in an intelligent, organized way without wasting time. The application helps manage and organize study materials for competitive examinations.

## Project Structure

```
/
├── app/                            # Next.js App Router pages
│   ├── page.tsx                    # Landing page
│   ├── auth/                       # Authentication pages
│   │   ├── page.tsx                # Login page
│   │   └── callback/page.tsx       # OAuth callback handler
│   └── dashboard/                  # Protected study area
│       ├── layout.tsx              # Dashboard layout with sidebar
│       ├── page.tsx                # Dashboard home
│       ├── temario/                # Syllabus section
│       ├── flashcards/             # Flashcards section
│       ├── tests/                  # Tests section
│       └── progreso/               # Progress section
├── src/
│   ├── components/                 # React components
│   │   ├── dashboard/              # Dashboard-specific components
│   │   ├── landing/                # Landing page components
│   │   └── ui/                     # shadcn/ui components
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.tsx             # Authentication context
│   │   └── useTheme.tsx            # Theme management
│   ├── lib/                        # Core utilities
│   │   ├── authgear.ts             # Authgear SDK configuration
│   │   ├── data-api.ts             # Data loading and normalization
│   │   ├── data-types.ts           # TypeScript interfaces
│   │   ├── storage.ts              # localStorage utilities
│   │   └── utils.ts                # General utilities
│   └── views/                      # Page view components
│       ├── Auth.tsx                # Auth page view
│       ├── Dashboard.tsx           # Dashboard wrapper
│       └── dashboard/              # Dashboard section views
├── data/                           # Source data (JSON datasets)
│   ├── db.json                     # Main data index
│   ├── db-*.json                   # Topic-specific datasets
│   ├── beta-users.json             # Beta user list
│   └── general/                    # Reference documents (markdown)
├── docs/                           # Documentation
│   ├── AUTHENTICATION.md           # Auth setup guide
│   └── manual/                     # User manual
├── public/                         # Static assets
│   └── api/                        # Generated API files (from data/)
└── .github/                        # GitHub configuration
    ├── copilot-instructions.md     # This file
    └── workflows/                  # CI/CD workflows
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

## Authentication Architecture

The application uses **Authgear** with **GitHub OAuth** for authentication. Key files:

- `src/lib/authgear.ts`: Authgear SDK configuration and core functions
- `src/hooks/useAuth.tsx`: React context and hook for authentication state
- `app/auth/callback/page.tsx`: OAuth callback handler

### Authentication Guidelines

- **Never expose secrets**: Client ID and Endpoint are public, secrets stay in Authgear
- **Preserve dev mode**: Always maintain `NEXT_PUBLIC_SKIP_AUTH` for local development
- **Session handling**: Use `sessionType: 'refresh_token'` for SPA compatibility
- **Redirect URIs**: Always include trailing slashes for Next.js static export

### Key Functions

```typescript
// Start login flow
await startLogin('/dashboard');

// Complete OAuth callback  
await finishLogin();

// Check authentication
const authenticated = await isAuthenticated();

// Get user info
const userInfo = await fetchUserInfo();

// Logout
await logout();
```

### User Data Isolation

User data in localStorage is isolated by user ID:
- `setActiveUserId(userId)` sets the current user
- All storage keys are prefixed with the user ID
- Guest users use `'guest'` as their ID

📖 **Full documentation**: `docs/AUTHENTICATION.md`

## localStorage Coherence

The application uses localStorage to persist user data. When modifying data structures or the hydration process, follow these rules:

### Data Types (`src/lib/data-types.ts`)

- **Always extend, never remove**: When adding new fields to interfaces (`TestQuestion`, `Flashcard`, `Topic`), make them optional (`field?: type`) to maintain backwards compatibility with existing localStorage data
- **Document new fields**: Add comments explaining the purpose of new fields
- **Export new types**: Ensure new types are exported for use across the application

### Hydration Process (`src/lib/storage.ts`)

- **hydrateFromApi()** must always update data from the API to get new fields, while preserving user progress:
  - **Topics**: Preserve `completed` status
  - **Flashcards**: Preserve `nextReview`, `interval`, `easeFactor` (spaced repetition state)
  - **Questions**: Always use API version (contains `source`, `origin`, etc.)
  - **Stats**: Only initialize if not present
- **Preserve local-only items**: Items created by users locally (not in API) must be kept
- **Merge strategy**: API data takes precedence for schema fields, local data for progress

### Data Normalization (`src/lib/data-api.ts`)

- **normalizeDataset*** functions must handle missing fields gracefully
- **Parse new fields from raw data**: When adding fields like `source` or `origin`, update the normalization functions
- **Use fallback values**: Provide sensible defaults for optional fields (e.g., `origin: 'generated'`)

### Common Pitfalls to Avoid

1. **Never check `hasStoredValue()` before updating**: This causes new API fields to never reach users with existing data
2. **Don't break existing localStorage**: Old data without new fields must still load correctly
3. **Test with existing data**: Verify changes work both with fresh installs and existing user data

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
