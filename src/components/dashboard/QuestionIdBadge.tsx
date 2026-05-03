'use client';

import { Hash, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface QuestionIdBadgeProps {
  questionId: string;
  className?: string;
}

/**
 * Muestra el identificador único de una pregunta del dataset como un tag.
 * Permite copiarlo al portapapeles haciendo clic, para poder referenciarla.
 */
const QuestionIdBadge = ({ questionId, className = '' }: QuestionIdBadgeProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!questionId) return null;

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(questionId);
      }
      setCopied(true);
      toast({
        title: 'ID copiado',
        description: questionId,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'No se pudo copiar el ID',
        description: questionId,
        variant: 'destructive',
      });
    }
  };

  const Icon = copied ? Check : Copy;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copiar identificador de la pregunta: ${questionId}`}
            className="inline-flex"
          >
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0.5 gap-1 font-mono cursor-pointer hover:bg-muted ${className}`}
            >
              <Hash className="h-3 w-3" />
              <span className="max-w-[140px] truncate">{questionId}</span>
              <Icon className="h-3 w-3 opacity-60" />
            </Badge>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">ID de la pregunta</p>
          <p className="text-xs font-mono">{questionId}</p>
          <p className="text-[10px] text-muted-foreground">Clic para copiar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default QuestionIdBadge;
