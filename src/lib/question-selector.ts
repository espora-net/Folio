/**
 * Utilidades para selección proporcional de preguntas/flashcards por temas
 */

export interface ItemWithTopic {
  topicId: string;
}

/**
 * Baraja un array usando Fisher-Yates shuffle
 */
export const shuffleArray = <T,>(items: T[]): T[] => {
  const deck = [...items];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

/**
 * Agrupa items por topicId
 */
const groupByTopic = <T extends ItemWithTopic>(items: T[]): Map<string, T[]> => {
  const groups = new Map<string, T[]>();
  
  for (const item of items) {
    const existing = groups.get(item.topicId) || [];
    existing.push(item);
    groups.set(item.topicId, existing);
  }
  
  return groups;
};

/**
 * Calcula distribución proporcional de preguntas por tema
 * 
 * @param topicGroups - Map de topicId a array de items
 * @param targetCount - Número total de items a seleccionar
 * @returns Map de topicId a número de items a seleccionar de ese tema
 */
const calculateProportionalDistribution = (
  topicGroups: Map<string, unknown[]>,
  targetCount: number
): Map<string, number> => {
  const totalItems = Array.from(topicGroups.values()).reduce((sum, group) => sum + group.length, 0);
  const distribution = new Map<string, number>();
  
  // Si no hay items o targetCount es 0, retornar distribución vacía
  if (totalItems === 0 || targetCount === 0) {
    return distribution;
  }
  
  // Si pedimos más items de los que hay, ajustar
  const effectiveTarget = Math.min(targetCount, totalItems);
  
  // Calcular cuotas base (parte entera) y restos
  const topicIds = Array.from(topicGroups.keys());
  let allocated = 0;
  const quotas: Array<{ topicId: string; base: number; remainder: number; available: number }> = [];
  
  for (const topicId of topicIds) {
    const available = topicGroups.get(topicId)!.length;
    const exactQuota = (available / totalItems) * effectiveTarget;
    const base = Math.floor(exactQuota);
    const remainder = exactQuota - base;
    
    quotas.push({ topicId, base, remainder, available });
    allocated += base;
  }
  
  // Asignar las unidades base
  for (const { topicId, base } of quotas) {
    distribution.set(topicId, base);
  }
  
  // Distribuir las unidades restantes según los restos más altos (método de Hamilton/mayor resto)
  const remaining = effectiveTarget - allocated;
  if (remaining > 0) {
    // Ordenar por resto descendente
    quotas.sort((a, b) => b.remainder - a.remainder);
    
    for (let i = 0; i < remaining && i < quotas.length; i++) {
      const { topicId, available } = quotas[i];
      const current = distribution.get(topicId) || 0;
      // Asegurarse de no exceder el disponible
      if (current < available) {
        distribution.set(topicId, current + 1);
      }
    }
  }
  
  // Validación: asegurar que no asignamos más de lo disponible por tema
  for (const [topicId, count] of distribution.entries()) {
    const available = topicGroups.get(topicId)!.length;
    if (count > available) {
      distribution.set(topicId, available);
    }
  }
  
  return distribution;
};

/**
 * Selecciona items de forma proporcional a la cantidad disponible en cada tema.
 * Garantiza que se incluyan preguntas de todos los temas cuando sea posible.
 * 
 * @param items - Array de items (preguntas o flashcards) con topicId
 * @param targetCount - Número de items a seleccionar (0 = todos)
 * @returns Array de items seleccionados de forma proporcional y barajados
 * 
 * @example
 * // Con 3 temas: A (10 preguntas), B (20 preguntas), C (30 preguntas)
 * // Si pedimos 15 preguntas:
 * // - Tema A: 2-3 preguntas (~17%)
 * // - Tema B: 5 preguntas (~33%)
 * // - Tema C: 7-8 preguntas (~50%)
 */
export const selectProportionalQuestions = <T extends ItemWithTopic>(
  items: T[],
  targetCount: number
): T[] => {
  // Si no hay items o targetCount es 0, retornar array vacío
  if (items.length === 0 || targetCount === 0) {
    return [];
  }
  
  // Si pedimos todos o más de los disponibles, barajar y retornar todos
  if (targetCount <= 0 || targetCount >= items.length) {
    return shuffleArray(items);
  }
  
  // Agrupar por tema
  const topicGroups = groupByTopic(items);
  
  // Si solo hay un tema, simplemente barajar y tomar N
  if (topicGroups.size === 1) {
    return shuffleArray(items).slice(0, targetCount);
  }
  
  // Calcular distribución proporcional
  const distribution = calculateProportionalDistribution(topicGroups, targetCount);
  
  // Seleccionar items de cada tema según la distribución
  const selected: T[] = [];
  
  for (const [topicId, count] of distribution.entries()) {
    const topicItems = topicGroups.get(topicId) || [];
    if (count > 0 && topicItems.length > 0) {
      // Barajar items del tema y tomar los primeros N
      const shuffledTopicItems = shuffleArray(topicItems);
      const selectedFromTopic = shuffledTopicItems.slice(0, count);
      selected.push(...selectedFromTopic);
    }
  }
  
  // Barajar el resultado final para evitar agrupación por temas
  return shuffleArray(selected);
};

/**
 * Genera un reporte de la distribución de preguntas por tema
 * Útil para debugging y validación
 */
export const generateDistributionReport = <T extends ItemWithTopic>(
  items: T[],
  selected: T[],
  getTopicTitle: (topicId: string) => string = (id) => id
): string => {
  const totalAvailable = items.length;
  const totalSelected = selected.length;
  
  const availableByTopic = groupByTopic(items);
  const selectedByTopic = groupByTopic(selected);
  
  const lines: string[] = [
    '='.repeat(60),
    'REPORTE DE DISTRIBUCIÓN DE PREGUNTAS',
    '='.repeat(60),
    `Total disponible: ${totalAvailable}`,
    `Total seleccionado: ${totalSelected}`,
    '',
    'Distribución por tema:',
    '-'.repeat(60),
  ];
  
  // Ordenar temas por nombre para consistencia
  const topicIds = Array.from(availableByTopic.keys()).sort();
  
  for (const topicId of topicIds) {
    const available = availableByTopic.get(topicId)?.length || 0;
    const selected = selectedByTopic.get(topicId)?.length || 0;
    const percentage = totalSelected > 0 ? ((selected / totalSelected) * 100).toFixed(1) : '0.0';
    const availablePercentage = totalAvailable > 0 ? ((available / totalAvailable) * 100).toFixed(1) : '0.0';
    
    const title = getTopicTitle(topicId);
    lines.push(
      `${title}:`,
      `  Disponible: ${available} (${availablePercentage}%)`,
      `  Seleccionado: ${selected} (${percentage}%)`,
      ''
    );
  }
  
  lines.push('='.repeat(60));
  
  return lines.join('\n');
};
