'use client';

import { ExternalLink } from 'lucide-react';
import type { DocumentReference } from '@/types';

interface Props {
  reference: DocumentReference;
}

export function DocumentReferenceCard({ reference }: Props) {
  const sanitizedPath = reference.path.replace(/^\/+/, '');
  const fragmentParts: string[] = [];

  if (reference.page) {
    fragmentParts.push(`page=${reference.page}`);
  }

  if (reference.highlightText) {
    fragmentParts.push(`search=${encodeURIComponent(reference.highlightText)}`);
  }

  const fragment = fragmentParts.length > 0 ? `#${fragmentParts.join('&')}` : '';
  const viewerUrl = `/api/docs/${sanitizedPath}${fragment}`;

  return (
    <div className="mt-4 rounded-lg border border-zinc-700/80 bg-zinc-900/70 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Referencia en documentación
          </p>
          <p className="text-sm text-zinc-200 font-medium">
            {reference.path} · Pág. {reference.page}
          </p>
          <p className="text-xs text-zinc-500">Material: {reference.materialId}</p>
        </div>
        <a
          href={viewerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-200 hover:bg-orange-500/20 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir PDF
        </a>
      </div>
      {reference.highlightText && (
        <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
          <span className="text-zinc-400 mr-1">Respuesta:</span>
          <mark className="rounded bg-orange-500/20 px-1 text-orange-200">
            {reference.highlightText}
          </mark>
        </p>
      )}
    </div>
  );
}
