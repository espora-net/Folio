'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          ¿Listo para aprobar tu oposición?
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Únete a miles de opositores que ya están preparando su futuro con Folio.
        </p>
        <Link href="/auth">
          <Button size="lg" className="text-lg px-8 py-6">
            Empezar gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTA;
