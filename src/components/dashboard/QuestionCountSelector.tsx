'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QuestionCountSelectorProps {
  totalAvailable: number;
  selectedCount: number;
  onCountChange: (count: number) => void;
}

const PRESET_COUNTS = [10, 20, 30];

export default function QuestionCountSelector({
  totalAvailable,
  selectedCount,
  onCountChange,
}: QuestionCountSelectorProps) {
  // Generar opciones válidas basadas en el total disponible
  const options = PRESET_COUNTS.filter(count => count <= totalAvailable);
  
  // Siempre incluir "Todas" como opción
  const showAll = totalAvailable > 0;
  
  // Determinar el label a mostrar
  const getLabel = () => {
    if (selectedCount === totalAvailable || selectedCount === 0) {
      return `Todas (${totalAvailable})`;
    }
    return selectedCount.toString();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100 hover:text-violet-800 dark:bg-violet-950 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-900"
        >
          {getLabel()}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[100px]">
        {options.map((count) => (
          <DropdownMenuItem
            key={count}
            onClick={() => onCountChange(count)}
            className={selectedCount === count ? 'bg-accent' : ''}
          >
            {count} preguntas
          </DropdownMenuItem>
        ))}
        {showAll && (
          <DropdownMenuItem
            onClick={() => onCountChange(totalAvailable)}
            className={selectedCount === totalAvailable ? 'bg-accent' : ''}
          >
            Todas ({totalAvailable})
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
