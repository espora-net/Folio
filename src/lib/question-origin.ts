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

const IA_COMMON_BANK_FILTER = 'ia-common-bank';

const ORIGIN_ORDER = [
  'oficial',
  'examen-oficial-externo',
  'curada',
  'refuerzo',
  IA_COMMON_BANK_FILTER,
  'opositatest-referencia',
  'generated',
];

export const normalizeOrigin = (origin?: string) => {
  const value = (origin ?? 'generated').trim();
  return value || 'generated';
};

export const getOriginFilterValue = (origin?: string) => {
  const value = normalizeOrigin(origin);
  if (value.startsWith('ia-common-bank')) return IA_COMMON_BANK_FILTER;
  if (value === 'ia') return 'generated';
  return value;
};

export const matchesOriginFilter = (origin: string | undefined, filter: string) => {
  if (filter === 'all') return true;
  const value = normalizeOrigin(origin);

  if (filter === 'generated') return value === 'generated' || value === 'ia';
  if (filter === IA_COMMON_BANK_FILTER) return value.startsWith('ia-common-bank');

  return value === filter;
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
  const filterValue = getOriginFilterValue(value);

  if (value === 'oficial') {
    return {
      label: 'Oficial',
      icon: FileCheck,
      className: 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400',
      tooltip: 'Pregunta de examen oficial o fuente oficial validada',
    };
  }

  if (value === 'examen-oficial-externo') {
    return {
      label: 'Oficial externa',
      icon: FileCheck,
      className: 'border-teal-300 text-teal-700 dark:border-teal-700 dark:text-teal-400',
      tooltip: 'Pregunta oficial externa conservada por estar alineada con normativa común del temario',
    };
  }

  if (value === 'curada') {
    return {
      label: 'Curada UAH',
      icon: Building2,
      className: 'border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-400',
      tooltip: 'Pregunta revisada y adaptada al temario UAH con fuente de apoyo',
    };
  }

  if (value === 'refuerzo') {
    return {
      label: 'Refuerzo UAH',
      icon: Building2,
      className: 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400',
      tooltip: 'Pregunta adicional de refuerzo revisada para el tema UAH',
    };
  }

  if (filterValue === IA_COMMON_BANK_FILTER) {
    return {
      label: 'Refuerzo IA',
      icon: Sparkles,
      className: 'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400',
      tooltip: 'Pregunta sintética del banco común enlazada a fuentes del temario',
    };
  }

  if (value === 'opositatest-referencia') {
    return {
      label: 'Opositatest ref.',
      icon: ExternalLink,
      className: 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400',
      tooltip: 'Pregunta original basada en cobertura de Opositatest y validada con fuente oficial',
    };
  }

  if (value === 'ia') {
    return {
      label: 'IA',
      icon: Sparkles,
      className: 'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400',
      tooltip: 'Pregunta generada por IA',
    };
  }

  if (value === 'generated') {
    return {
      label: 'Generadas',
      icon: Sparkles,
      className: 'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400',
      tooltip: 'Pregunta generada',
    };
  }

  if (value === 'oposito.es' || value === 'leyesdeoposiciones.es' || value === 'quizlet.com') {
    return {
      label: value,
      icon: ExternalLink,
      className: 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
      tooltip: `Banco externo reutilizable: ${value}`,
    };
  }

  return {
    label: value,
    icon: ExternalLink,
    className: 'border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-400',
    tooltip: `Origen: ${value}`,
  };
};
