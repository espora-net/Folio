import {
  Building2,
  ExternalLink,
  FileCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface OriginTag {
  label: string;
  icon: LucideIcon;
  className: string;
  tooltip: string;
}

const GENERATED_AI_ORIGIN = 'generada-ia';
const ADAPTED_AI_ORIGIN = 'adaptada-ia';

const LEGACY_ORIGIN_ALIASES: Record<string, string> = {
  ia: GENERATED_AI_ORIGIN,
  generated: GENERATED_AI_ORIGIN,
  refuerzo: GENERATED_AI_ORIGIN,
  curada: ADAPTED_AI_ORIGIN,
  'examen-oficial-externo': ADAPTED_AI_ORIGIN,
  'opositatest-referencia': 'opositatest.com',
};

const EXTERNAL_SOURCE_ORIGINS = new Set([
  'opositatest.com',
  'oposito.es',
  'leyesdeoposiciones.es',
  'quizlet.com',
]);

const ORIGIN_ORDER = [
  'oficial',
  ADAPTED_AI_ORIGIN,
  GENERATED_AI_ORIGIN,
  'opositatest.com',
  'oposito.es',
  'leyesdeoposiciones.es',
  'quizlet.com',
];

export const normalizeOrigin = (origin?: string) => {
  const value = (origin ?? GENERATED_AI_ORIGIN).trim();
  if (!value) return GENERATED_AI_ORIGIN;
  if (value.startsWith('ia-common-bank')) return GENERATED_AI_ORIGIN;
  return LEGACY_ORIGIN_ALIASES[value] ?? value;
};

export const getOriginFilterValue = (origin?: string) => {
  return normalizeOrigin(origin);
};

export const matchesOriginFilter = (origin: string | undefined, filter: string) => {
  if (filter === 'all') return true;
  return normalizeOrigin(origin) === normalizeOrigin(filter);
};

export const sortOriginFilters = (a: string, b: string) => {
  const aIndex = ORIGIN_ORDER.indexOf(a);
  const bIndex = ORIGIN_ORDER.indexOf(b);
  if (aIndex !== -1 || bIndex !== -1) {
    return (aIndex === -1 ? ORIGIN_ORDER.length : aIndex) - (bIndex === -1 ? ORIGIN_ORDER.length : bIndex);
  }
  return a.localeCompare(b, 'es');
};

export const getOriginTag = (origin?: string): OriginTag => {
  const value = normalizeOrigin(origin);

  if (value === 'oficial') {
    return {
      label: 'Oficial',
      icon: FileCheck,
      className: 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400',
      tooltip: 'Pregunta de examen oficial o fuente oficial validada',
    };
  }

  if (value === ADAPTED_AI_ORIGIN) {
    return {
      label: 'Adaptada IA',
      icon: Building2,
      className: 'border-teal-300 text-teal-700 dark:border-teal-700 dark:text-teal-400',
      tooltip: 'Pregunta existente u oficial adaptada/mejorada con IA y validada contra el temario',
    };
  }

  if (value === GENERATED_AI_ORIGIN) {
    return {
      label: 'Generada IA',
      icon: Sparkles,
      className: 'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400',
      tooltip: 'Pregunta completamente generada para refuerzo y enlazada a fuentes del temario',
    };
  }

  if (EXTERNAL_SOURCE_ORIGINS.has(value)) {
    return {
      label: value,
      icon: ExternalLink,
      className: 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
      tooltip: `Fuente externa definida: ${value}`,
    };
  }

  return {
    label: value,
    icon: ExternalLink,
    className: 'border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-400',
    tooltip: `Origen: ${value}`,
  };
};
