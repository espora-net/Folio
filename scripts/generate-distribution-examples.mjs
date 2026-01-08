/**
 * Script para generar ejemplos de distribución proporcional de preguntas
 * 
 * Ejecutar con: node scripts/generate-distribution-examples.mjs
 */

// Función de barajado Fisher-Yates
const shuffleArray = (items) => {
  const deck = [...items];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// Agrupa items por topicId
const groupByTopic = (items) => {
  const groups = new Map();
  
  for (const item of items) {
    const existing = groups.get(item.topicId) || [];
    existing.push(item);
    groups.set(item.topicId, existing);
  }
  
  return groups;
};

// Calcula distribución proporcional
const calculateProportionalDistribution = (topicGroups, targetCount) => {
  const totalItems = Array.from(topicGroups.values()).reduce((sum, group) => sum + group.length, 0);
  const distribution = new Map();
  
  if (totalItems === 0 || targetCount === 0) {
    return distribution;
  }
  
  const effectiveTarget = Math.min(targetCount, totalItems);
  
  const topicIds = Array.from(topicGroups.keys());
  let allocated = 0;
  const quotas = [];
  
  for (const topicId of topicIds) {
    const available = topicGroups.get(topicId).length;
    const exactQuota = (available / totalItems) * effectiveTarget;
    const base = Math.floor(exactQuota);
    const remainder = exactQuota - base;
    
    quotas.push({ topicId, base, remainder, available });
    allocated += base;
  }
  
  for (const { topicId, base } of quotas) {
    distribution.set(topicId, base);
  }
  
  const remaining = effectiveTarget - allocated;
  if (remaining > 0) {
    quotas.sort((a, b) => b.remainder - a.remainder);
    
    for (let i = 0; i < remaining && i < quotas.length; i++) {
      const { topicId, available } = quotas[i];
      const current = distribution.get(topicId) || 0;
      if (current < available) {
        distribution.set(topicId, current + 1);
      }
    }
  }
  
  for (const [topicId, count] of distribution.entries()) {
    const available = topicGroups.get(topicId).length;
    if (count > available) {
      distribution.set(topicId, available);
    }
  }
  
  return distribution;
};

// Selecciona items de forma proporcional
const selectProportionalQuestions = (items, targetCount) => {
  if (items.length === 0 || targetCount === 0) {
    return [];
  }
  
  if (targetCount <= 0 || targetCount >= items.length) {
    return shuffleArray(items);
  }
  
  const topicGroups = groupByTopic(items);
  
  if (topicGroups.size === 1) {
    return shuffleArray(items).slice(0, targetCount);
  }
  
  const distribution = calculateProportionalDistribution(topicGroups, targetCount);
  
  const selected = [];
  
  for (const [topicId, count] of distribution.entries()) {
    const topicItems = topicGroups.get(topicId) || [];
    if (count > 0 && topicItems.length > 0) {
      const shuffledTopicItems = shuffleArray(topicItems);
      const selectedFromTopic = shuffledTopicItems.slice(0, count);
      selected.push(...selectedFromTopic);
    }
  }
  
  return shuffleArray(selected);
};

// Genera un reporte de distribución
const generateDistributionReport = (items, selected, topicNames) => {
  const totalAvailable = items.length;
  const totalSelected = selected.length;
  
  const availableByTopic = groupByTopic(items);
  const selectedByTopic = groupByTopic(selected);
  
  const lines = [
    '='.repeat(70),
    'REPORTE DE DISTRIBUCIÓN DE PREGUNTAS',
    '='.repeat(70),
    `Total disponible: ${totalAvailable}`,
    `Total seleccionado: ${totalSelected}`,
    '',
    'Distribución por tema:',
    '-'.repeat(70),
  ];
  
  const topicIds = Array.from(availableByTopic.keys()).sort();
  
  for (const topicId of topicIds) {
    const available = availableByTopic.get(topicId)?.length || 0;
    const selected = selectedByTopic.get(topicId)?.length || 0;
    const percentage = totalSelected > 0 ? ((selected / totalSelected) * 100).toFixed(1) : '0.0';
    const availablePercentage = totalAvailable > 0 ? ((available / totalAvailable) * 100).toFixed(1) : '0.0';
    
    const title = topicNames[topicId] || topicId;
    lines.push(
      `${title}:`,
      `  Disponible: ${available.toString().padStart(3)} (${availablePercentage.padStart(5)}% del total)`,
      `  Seleccionado: ${selected.toString().padStart(2)} (${percentage.padStart(5)}% de selección) ✓`,
      ''
    );
  }
  
  lines.push('='.repeat(70));
  
  return lines.join('\n');
};

// Genera preguntas de ejemplo
const generateMockQuestions = (topicConfig) => {
  const questions = [];
  let id = 1;
  
  for (const { topicId, count } of topicConfig) {
    for (let i = 0; i < count; i++) {
      questions.push({
        id: `q-${id++}`,
        topicId,
        question: `Pregunta ${i + 1} del tema ${topicId}`,
      });
    }
  }
  
  return questions;
};

// Ejemplos de configuraciones
const examples = [
  {
    name: 'Ejemplo 1: Distribución equilibrada (3 temas, 20 preguntas seleccionadas)',
    topicConfig: [
      { topicId: 'tema-a', count: 30, name: 'Tema A: Constitución Española' },
      { topicId: 'tema-b', count: 30, name: 'Tema B: Organización del Estado' },
      { topicId: 'tema-c', count: 30, name: 'Tema C: Administración Pública' },
    ],
    targetCount: 20,
  },
  {
    name: 'Ejemplo 2: Temas con diferente disponibilidad (20 preguntas de 60 totales)',
    topicConfig: [
      { topicId: 'tema-a', count: 10, name: 'Tema A: Derecho Constitucional (pequeño)' },
      { topicId: 'tema-b', count: 20, name: 'Tema B: Derecho Administrativo (mediano)' },
      { topicId: 'tema-c', count: 30, name: 'Tema C: Derecho Laboral (grande)' },
    ],
    targetCount: 20,
  },
  {
    name: 'Ejemplo 3: Muchos temas pequeños (5 temas, 15 preguntas seleccionadas)',
    topicConfig: [
      { topicId: 'tema-1', count: 12, name: 'Tema 1: Historia de España' },
      { topicId: 'tema-2', count: 8, name: 'Tema 2: Geografía' },
      { topicId: 'tema-3', count: 15, name: 'Tema 3: Economía' },
      { topicId: 'tema-4', count: 10, name: 'Tema 4: Política' },
      { topicId: 'tema-5', count: 5, name: 'Tema 5: Cultura' },
    ],
    targetCount: 15,
  },
  {
    name: 'Ejemplo 4: Caso extremo - un tema muy grande y otros pequeños',
    topicConfig: [
      { topicId: 'tema-principal', count: 80, name: 'Tema Principal: Legislación General (80%)' },
      { topicId: 'tema-a', count: 10, name: 'Tema A: Temas específicos (10%)' },
      { topicId: 'tema-b', count: 10, name: 'Tema B: Casos prácticos (10%)' },
    ],
    targetCount: 25,
  },
  {
    name: 'Ejemplo 5: Selección de todas las preguntas disponibles',
    topicConfig: [
      { topicId: 'tema-a', count: 15, name: 'Tema A' },
      { topicId: 'tema-b', count: 20, name: 'Tema B' },
      { topicId: 'tema-c', count: 25, name: 'Tema C' },
    ],
    targetCount: -1, // valores <= 0 o >= total significan "todas"
  },
];

// Generar reportes
console.log('\n');
console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║    EJEMPLOS DE DISTRIBUCIÓN PROPORCIONAL DE PREGUNTAS             ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log('\n');

for (const example of examples) {
  console.log(`\n${example.name}\n`);
  
  const topicNames = {};
  for (const { topicId, name } of example.topicConfig) {
    topicNames[topicId] = name;
  }
  
  const questions = generateMockQuestions(example.topicConfig);
  const selected = selectProportionalQuestions(questions, example.targetCount);
  
  const report = generateDistributionReport(questions, selected, topicNames);
  console.log(report);
  console.log('\n');
}

console.log('\n');
console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║    CONCLUSIONES                                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log('\n');
console.log('✓ La distribución proporcional garantiza que todos los temas estén');
console.log('  representados según su peso en el total de preguntas disponibles.');
console.log('');
console.log('✓ El algoritmo usa el método de Hamilton (mayor resto) para distribuir');
console.log('  las unidades residuales de forma justa.');
console.log('');
console.log('✓ Las preguntas se barajan aleatoriamente dentro de cada tema y el');
console.log('  resultado final también se baraja para evitar agrupación.');
console.log('\n');
