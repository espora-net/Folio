# Análisis de Rendimiento de Folio

Este documento recoge un análisis exhaustivo del rendimiento de la aplicación Folio, identificando áreas de mejora tanto en el código como en la configuración de despliegue.

## Resumen Ejecutivo

Folio es una aplicación Next.js con export estático (`output: 'export'`) pensada para desplegarse en GitHub Pages u otro hosting estático. La arquitectura actual presenta varias oportunidades de optimización para mejorar la experiencia de usuario, divididas en:

1. **Optimizaciones en el código** (requieren cambios de desarrollo)
2. **Optimizaciones al publicar** (configuración de hosting/CDN, sin tocar código)

> Actualización: la carga de datos se ha migrado a artefactos FlatBuffers generados desde JSON fuente. Ver `docs/DATA_LOADING_OPTIMIZATION.md` para el flujo actual.

---

## 1. Optimizaciones en el Código

### 1.1. Carga de Datos (JSON fuente -> FlatBuffers runtime)

**Estado actual:**
- Los datasets JSON se mantienen como fuente editorial en `public/api/`
- `npm run generate-flatbuffers` genera `public/api/optimized/manifest.json` y `.fb.bin`
- `src/lib/data-api.ts` consume FlatBuffers a través de `src/lib/optimized-data-api.ts`
- Algunos datasets son muy grandes:
  - `db-constitucion.json`: 1.4 MB
  - `db-ley-organica-2-2023-sistema-universitario.json`: 1.5 MB
  - `db-estatuto-basico-del-empleado-publico-EBEP.json`: 484 KB

**Mejoras aplicadas:**
- Se elimina el fallback bundled de JSON grandes en runtime.
- Los datasets se cargan como buffers independientes en paralelo.
- La Action de Pages valida JSON fuente y genera FlatBuffers antes del build.
- La publicación comprueba `out/api/optimized` y elimina JSON fuente de `out/api`.

**Recomendaciones restantes:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Carga por convocatoria activa**: cargar solo buffers vinculados al study type/convocatoria seleccionada | Alto | Media |
| **Chunks por dataset grande**: dividir bancos de preguntas muy grandes por tema o bloque | Medio | Media |
| **Paginar preguntas**: Para datasets con >500 preguntas, cargar por lotes | Medio | Alta |

### 1.2. Fuentes Web

**Estado actual:**
- 3 fuentes se cargan desde Google Fonts via `@import` en CSS:
  - Montserrat (400, 500, 600, 700)
  - Cormorant Garamond (400, 500, 600, 700)
  - IBM Plex Mono (400, 700)

**Problemas identificados:**
- `@import` en CSS bloquea el renderizado
- Se cargan múltiples pesos que pueden no usarse todos

**Recomendaciones:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Usar `<link rel="preload">`**: Mover carga de fuentes al `<head>` con preload | Alto | Baja |
| **Añadir `display=swap`**: Ya está en la URL, verificar que aplique correctamente | Medio | Mínima |
| **Self-hosting de fuentes**: Descargar y servir localmente las fuentes | Medio | Media |
| **Reducir pesos**: Evaluar si realmente se usan los 4 pesos de cada fuente | Bajo | Baja |

**Código a modificar:**
```tsx
// app/layout.tsx - Añadir en <head>:
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link 
  rel="preload" 
  as="style"
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" 
/>
```

### 1.3. Librerías de terceros pesadas

**Estado actual:**
Las siguientes dependencias tienen impacto significativo en el bundle:
- `mermaid` (~2 MB sin comprimir) - usado solo en MarkdownViewer
- `recharts` - usado solo en Progreso
- `react-markdown` + `rehype-*` + `remark-*` - usado solo en Temario

**Recomendaciones:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Code splitting**: Usar `next/dynamic` para componentes que usan estas librerías | Alto | Baja |
| **Lazy load de Mermaid**: Solo importar cuando hay diagramas en el contenido | Alto | Media |
| **Evaluar alternativas más ligeras**: `chart.js` es más ligero que `recharts` | Medio | Alta |

**Código a modificar:**
```tsx
// src/views/dashboard/Temario.tsx
import dynamic from 'next/dynamic';

// En lugar de:
// import MarkdownViewer from '@/components/dashboard/MarkdownViewer';

// Usar:
const MarkdownViewer = dynamic(
  () => import('@/components/dashboard/MarkdownViewer'),
  { 
    loading: () => <div className="animate-pulse h-64 bg-muted rounded" />,
    ssr: false 
  }
);
```

### 1.4. Componentes UI de Radix

**Estado actual:**
- Se importan 25+ componentes de Radix UI
- Muchos no se usan en todas las páginas

**Recomendaciones:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Tree shaking verification**: Verificar que el bundler elimine código no usado | Medio | Baja |
| **Lazy load modales/dialogs**: Cargar Dialog, Sheet, etc. solo cuando se abran | Medio | Media |

### 1.5. Renderizado de listas grandes

**Estado actual:**
- Tests.tsx y Flashcards.tsx renderizan todas las preguntas/tarjetas en una grid
- Con >500 items, esto puede causar lag

**Recomendaciones:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Virtualización**: Usar `react-virtual` o similar para listas grandes | Alto | Media |
| **Paginación en UI**: Mostrar 50 items por página con controles | Medio | Baja |
| **Búsqueda local optimizada**: Debounce en filtros, useMemo en transformaciones | Medio | Baja |

### 1.6. Imágenes

**Estado actual:**
- `hero-bg.jpg`: 72 KB (razonable)
- No se usan imágenes optimizadas de Next.js (`next/image`)

**Recomendaciones:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Convertir a WebP/AVIF**: Reducir tamaño de imágenes hasta 50% | Medio | Baja |
| **Usar next/image donde sea posible**: Optimización automática (nota: limitado en export estático) | Bajo | Baja |

### 1.7. localStorage y persistencia

**Estado actual:**
- Se lee/escribe localStorage en cada render de algunos componentes
- `hydrateFromApi()` se llama en el Dashboard principal

**Recomendaciones:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Cachear lecturas de localStorage**: Usar contexto o estado global para evitar lecturas repetidas | Medio | Media |
| **Debounce de escrituras**: Agrupar múltiples saves en uno solo | Bajo | Baja |

### 1.8. Hydration y React Query

**Estado actual:**
- `QueryClient` se crea en cada render del Provider (correctamente con `useState`)
- No hay prefetching de datos

**Recomendaciones:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Prefetch en rutas conocidas**: Precargar datos de la siguiente pantalla probable | Medio | Media |
| **Configurar staleTime apropiado**: Reducir refetches innecesarios | Bajo | Mínima |

---

## 2. Optimizaciones al Publicar (Sin Modificar Código)

### 2.0. Cómo usar Cloudflare con GitHub Pages

Cloudflare actúa como un **proxy/CDN** entre los usuarios y GitHub Pages. No reemplaza GitHub Pages, sino que se sitúa delante para añadir optimizaciones.

**Requisitos:**
- Un dominio propio (ej: `folio.tudominio.com`)
- Cuenta gratuita en Cloudflare

**Paso a paso:**

1. **Registrar dominio en Cloudflare:**
   - Crear cuenta en [cloudflare.com](https://cloudflare.com)
   - Añadir el dominio y seguir el asistente
   - Cloudflare te dará dos nameservers (ej: `ns1.cloudflare.com`)
   - Actualizar los nameservers en tu registrador de dominios

2. **Configurar DNS en Cloudflare:**
   - Crear un registro CNAME:
     - Nombre: `folio` (o `@` para dominio raíz)
     - Destino: `<usuario>.github.io`
     - Proxy status: **Proxied** (nube naranja activada)

3. **Configurar GitHub Pages con dominio personalizado:**
   - En el repositorio: Settings > Pages
   - En "Custom domain", introducir `folio.tudominio.com`
   - Marcar "Enforce HTTPS"

4. **Configurar SSL en Cloudflare:**
   - SSL/TLS > Overview: Seleccionar "Full (strict)"
   - Edge Certificates: Habilitar "Always Use HTTPS"

5. **Habilitar optimizaciones:**
   - Speed > Optimization: Habilitar "Brotli"
   - Speed > Optimization: Habilitar "Auto Minify" (JS, CSS, HTML)
   - Caching > Configuration: Browser Cache TTL → 4 horas o más
   - Network: Habilitar HTTP/3 (QUIC)

**Diagrama de flujo:**
```
Usuario → Cloudflare (CDN + Brotli + Cache) → GitHub Pages (origen)
```

**Ventajas de esta configuración:**
- ✅ Compresión Brotli (mejor que Gzip de GitHub Pages)
- ✅ Cache en edge servers globales
- ✅ HTTP/3 (QUIC) para menor latencia
- ✅ Protección DDoS
- ✅ Analytics de tráfico
- ✅ Gratuito para uso personal/pequeño

**Sin dominio propio:**
Si no tienes dominio propio, puedes usar GitHub Pages directamente (`<usuario>.github.io/Folio`). Las optimizaciones de Cloudflare no estarán disponibles, pero GitHub Pages ofrece:
- Gzip automático
- HTTP/2
- CDN básico de GitHub

---

### 2.1. Compresión (Brotli/Gzip)

**Estado actual:**
- Depende de la configuración del servidor/CDN

**Recomendaciones:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Habilitar Brotli en el CDN**: Mejor compresión que Gzip, ~20-30% más pequeño | Alto | Mínima |
| **Pre-comprimir assets en build**: Generar `.br` y `.gz` durante el build | Alto | Baja |

**Para GitHub Pages:**
GitHub Pages aplica Gzip automáticamente. Para Brotli, considerar Cloudflare.

**Ejemplo con Cloudflare:**
1. Añadir dominio a Cloudflare (gratis)
2. Habilitar "Brotli" en Speed > Optimization
3. Habilitar "Auto Minify" para JS/CSS/HTML

### 2.2. Caching Headers

**Estado actual (GitHub Pages):**
- Cache por defecto es limitado (10 minutos)

**Recomendaciones:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Cache-Control para assets con hash**: `max-age=31536000, immutable` para `/_next/static/*` | Alto | Baja |
| **Cache-Control para HTML**: `max-age=0, must-revalidate` | Medio | Mínima |
| **Cache-Control para JSON de datos**: `max-age=3600` (1 hora) o más según frecuencia de actualización | Medio | Baja |

**Para GitHub Pages + Cloudflare:**
- Configurar Page Rules o Cache Rules en Cloudflare
- Ejemplo: `/**/api/*.json` → Cache Level: Standard, Edge TTL: 1 day

### 2.3. CDN y Edge Caching

**Recomendaciones:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Usar Cloudflare (gratis)**: CDN global, Brotli, cache, DDoS protection | Alto | Baja |
| **Alternativamente, Vercel Edge**: Si se migra de GitHub Pages a Vercel | Alto | Media |
| **Configurar cache de assets estáticos**: Maximizar cache para fonts, images, JS bundles | Alto | Baja |

### 2.4. HTTP/2 y HTTP/3

**Estado actual:**
- GitHub Pages soporta HTTP/2
- HTTP/3 (QUIC) no está disponible en GitHub Pages directamente

**Recomendaciones:**
| Acción | Impacto | Complejidad |
|--------|---------|-------------|
| **Usar Cloudflare para HTTP/3**: Mejora latencia especialmente en móviles | Medio | Mínima |

### 2.5. Preload y Prefetch de recursos críticos

**Configuración en Cloudflare o archivo `_headers` (Netlify/Cloudflare Pages):**

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  
/api/*
  Cache-Control: public, max-age=3600
  
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
```

### 2.6. Minificación

**Estado actual:**
- Next.js minifica automáticamente JS y CSS en producción

**Verificar:**
- [ ] `next.config.mjs` no tiene `swcMinify: false`
- [ ] Build de producción: `npm run build` genera outputs minificados

### 2.7. Resource Hints

**Añadir en el HTML generado o via CDN:**

```html
<!-- Preconnect a recursos externos -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- DNS Prefetch para Authgear (si aplica) -->
<link rel="dns-prefetch" href="https://[authgear-endpoint]">
```

### 2.8. Análisis de bundle (herramienta)

**Para identificar qué incluye el bundle:**

```bash
# Instalar analizador
npm install -D @next/bundle-analyzer

# Añadir a next.config.mjs:
import bundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
export default withBundleAnalyzer(nextConfig);

# Ejecutar análisis
ANALYZE=true npm run build
```

---

## 3. Métricas Objetivo (Core Web Vitals)

### Objetivos recomendados:
| Métrica | Objetivo | Descripción |
|---------|----------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Tiempo hasta que el contenido principal sea visible |
| **FID** (First Input Delay) | < 100ms | Tiempo hasta que la página responda a interacciones |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Estabilidad visual durante la carga |
| **TTFB** (Time to First Byte) | < 600ms | Tiempo de respuesta del servidor |
| **TTI** (Time to Interactive) | < 3.8s | Tiempo hasta que la página sea completamente interactiva |

### Herramientas de medición:
- **Lighthouse** (Chrome DevTools)
- **PageSpeed Insights** (https://pagespeed.web.dev/)
- **WebPageTest** (https://www.webpagetest.org/)

---

## 4. Plan de Implementación Priorizado

### Fase 1: Quick Wins (Bajo esfuerzo, alto impacto)
1. ✅ Activar Brotli/cache en CDN (Cloudflare)
2. 🔧 Eliminar imports bundled de datasets grandes
3. 🔧 Añadir preconnect para fuentes

### Fase 2: Optimizaciones de Código (Medio esfuerzo)
1. 🔧 Dynamic imports para MarkdownViewer y componentes pesados
2. 🔧 Lazy load de Mermaid
3. 🔧 Paginación en listas de Tests/Flashcards

### Fase 3: Optimizaciones Avanzadas (Mayor esfuerzo)
1. 🔧 Virtualización de listas largas
2. 🔧 Self-hosting de fuentes
3. 🔧 Refactorizar carga de datos para streaming

---

## 5. Resumen de Tamaños Actuales

### Datasets JSON:
| Archivo | Tamaño | Recomendación |
|---------|--------|---------------|
| db-constitucion.json | 1.4 MB | Lazy load, no bundlear |
| db-ley-organica-2-2023-sistema-universitario.json | 1.5 MB | Lazy load, no bundlear |
| db-estatuto-basico-del-empleado-publico-EBEP.json | 484 KB | Lazy load, no bundlear |
| Convocatorias (3) | ~80 KB total | OK como bundled |
| Otros datasets | <10 KB c/u | OK como bundled |

### Recursos estáticos:
| Recurso | Tamaño | Recomendación |
|---------|--------|---------------|
| hero-bg.jpg | 72 KB | Convertir a WebP (~40 KB) |
| Archivo MP3 (constitución) | 14 MB | Streaming, no precarga |
| PDFs (varios) | 200 KB - 2.7 MB | Lazy load al abrir |
| Documentos MD | hasta 288 KB | OK |

---

## Conclusión

Las principales áreas de mejora son:

1. **Reducir el bundle inicial** eliminando imports estáticos de datasets grandes
2. **Implementar lazy loading** para componentes pesados (MarkdownViewer, Mermaid)
3. **Configurar CDN con Brotli y cache apropiado** para mejorar tiempos de carga
4. **Virtualizar listas largas** en Tests y Flashcards

La combinación de estas optimizaciones puede reducir significativamente el tiempo de carga inicial (LCP) y mejorar la responsividad (FID), proporcionando una experiencia de usuario mucho más fluida.
