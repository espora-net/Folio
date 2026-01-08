# Distribución Proporcional de Preguntas

## Descripción

Este documento describe el sistema de selección proporcional de preguntas implementado en Folio para tests y flashcards.

## Problema

Anteriormente, cuando se seleccionaban N preguntas para un test o sesión de flashcards, el sistema simplemente:
1. Barajaba todas las preguntas filtradas
2. Tomaba las primeras N preguntas

Esto tenía el problema de que **no garantizaba la representación de todos los temas** de forma proporcional. Por ejemplo:
- Si había 100 preguntas del Tema A y 10 del Tema B
- Al seleccionar 20 preguntas aleatoriamente, podrían salir 20 del Tema A y 0 del Tema B

## Solución

Se implementó un algoritmo de **distribución proporcional** que garantiza que todos los temas estén representados según su peso relativo en el total de preguntas disponibles.

### Algoritmo

El algoritmo funciona en los siguientes pasos:

1. **Agrupación**: Agrupa las preguntas por `topicId`
2. **Cálculo de cuotas**: Calcula la cuota proporcional para cada tema usando el método de Hamilton (mayor resto)
3. **Selección aleatoria**: Dentro de cada tema, selecciona aleatoriamente las preguntas según su cuota
4. **Barajado final**: Baraja el resultado final para evitar que las preguntas estén agrupadas por tema

### Método de Hamilton (Mayor Resto)

Para distribuir las preguntas de forma justa:

1. Se calcula la cuota exacta de cada tema: `(preguntas_tema / total) × objetivo`
2. Se asigna a cada tema la parte entera de su cuota
3. Las unidades restantes se distribuyen a los temas con mayor resto decimal

Este método garantiza que:
- Cada tema recibe al menos su proporción base
- Las unidades residuales se asignan de forma justa
- La suma total es exactamente el número objetivo

## Implementación

### Archivo: `src/lib/question-selector.ts`

```typescript
export const selectProportionalQuestions = <T extends ItemWithTopic>(
  items: T[],
  targetCount: number
): T[]
```

**Parámetros:**
- `items`: Array de preguntas o flashcards (deben tener `topicId`)
- `targetCount`: Número de items a seleccionar (0 o negativo = todos)

**Retorna:**
- Array de items seleccionados de forma proporcional y barajados

### Integración

La función se integró en:
- `src/views/dashboard/Tests.tsx` - función `startTest()`
- `src/views/dashboard/Flashcards.tsx` - función `startStudying()`

## Ejemplos de Distribución

### Ejemplo 1: Distribución Equilibrada

**Configuración:**
- Tema A: 30 preguntas disponibles (33.3%)
- Tema B: 30 preguntas disponibles (33.3%)
- Tema C: 30 preguntas disponibles (33.3%)
- **Objetivo: 20 preguntas**

**Resultado:**
- Tema A: 7 preguntas (35.0%)
- Tema B: 7 preguntas (35.0%)
- Tema C: 6 preguntas (30.0%)

✅ Todos los temas representados proporcionalmente

---

### Ejemplo 2: Temas con Diferente Disponibilidad

**Configuración:**
- Tema A: 10 preguntas (16.7%)
- Tema B: 20 preguntas (33.3%)
- Tema C: 30 preguntas (50.0%)
- **Objetivo: 20 preguntas**

**Resultado:**
- Tema A: 3 preguntas (15.0%)
- Tema B: 7 preguntas (35.0%)
- Tema C: 10 preguntas (50.0%)

✅ La proporción se mantiene: el tema más grande tiene el doble de preguntas que el mediano

---

### Ejemplo 3: Muchos Temas Pequeños

**Configuración:**
- Tema 1: 12 preguntas (24.0%)
- Tema 2: 8 preguntas (16.0%)
- Tema 3: 15 preguntas (30.0%)
- Tema 4: 10 preguntas (20.0%)
- Tema 5: 5 preguntas (10.0%)
- **Objetivo: 15 preguntas**

**Resultado:**
- Tema 1: 4 preguntas (26.7%)
- Tema 2: 2 preguntas (13.3%)
- Tema 3: 5 preguntas (33.3%)
- Tema 4: 3 preguntas (20.0%)
- Tema 5: 1 pregunta (6.7%)

✅ Todos los temas incluidos, incluso el más pequeño

---

### Ejemplo 4: Caso Extremo - Tema Dominante

**Configuración:**
- Tema Principal: 80 preguntas (80.0%)
- Tema A: 10 preguntas (10.0%)
- Tema B: 10 preguntas (10.0%)
- **Objetivo: 25 preguntas**

**Resultado:**
- Tema Principal: 20 preguntas (80.0%)
- Tema A: 3 preguntas (12.0%)
- Tema B: 2 preguntas (8.0%)

✅ El tema dominante mantiene su peso, pero los otros también están representados

---

### Ejemplo 5: Selección de Todas las Preguntas

**Configuración:**
- Tema A: 15 preguntas (25.0%)
- Tema B: 20 preguntas (33.3%)
- Tema C: 25 preguntas (41.7%)
- **Objetivo: Todas (límite = 0 o negativo)**

**Resultado:**
- Tema A: 15 preguntas (25.0%)
- Tema B: 20 preguntas (33.3%)
- Tema C: 25 preguntas (41.7%)

✅ Cuando se seleccionan todas, se mantienen las proporciones naturales

## Casos Edge

El algoritmo maneja correctamente varios casos especiales:

1. **Un solo tema disponible**: Simplemente baraja y toma N preguntas
2. **Más preguntas solicitadas que disponibles**: Retorna todas las disponibles
3. **Tema sin suficientes preguntas**: No asigna más preguntas de las disponibles
4. **Límite = 0 o negativo**: Retorna todas las preguntas (barajadas)

## Generar Ejemplos

Para generar ejemplos de distribución y verificar el algoritmo:

```bash
node scripts/generate-distribution-examples.mjs
```

Este script:
- Genera 5 escenarios diferentes de distribución
- Muestra tablas detalladas con porcentajes
- Valida que el algoritmo funciona correctamente

## Ventajas

1. **Cobertura completa**: Garantiza que todos los temas estén representados
2. **Proporcionalidad justa**: Los temas con más preguntas aparecen más, pero todos están presentes
3. **Aleatorización**: Las preguntas dentro de cada tema se seleccionan aleatoriamente
4. **No agrupación**: El resultado final se baraja para evitar que las preguntas estén agrupadas por tema
5. **Predecible**: El usuario puede anticipar aproximadamente cuántas preguntas de cada tema verá

## Experiencia de Usuario

### Antes
- "¿Por qué solo me salen preguntas del Tema 1?"
- Distribución desigual y poco predecible
- Algunos temas nunca aparecían en tests cortos

### Después
- ✅ Todos los temas están representados proporcionalmente
- ✅ Tests más equilibrados y completos
- ✅ Mejor cobertura del temario en cada sesión
- ✅ Experiencia de estudio más efectiva

## Referencias

- Método de Hamilton: https://en.wikipedia.org/wiki/Largest_remainder_method
- Fisher-Yates Shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
