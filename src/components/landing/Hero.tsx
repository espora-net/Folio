'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-10"
        style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 mb-8">
          <Sparkles className="h-4 w-4 text-accent-foreground" />
          <span className="text-sm font-medium text-accent-foreground">
            Tu plataforma de estudio para oposiciones
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          Prepara tu oposición{' '}
          <span className="text-primary">con método</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Flashcards, tests de práctica y seguimiento de progreso. 
          Todo lo que necesitas para aprobar tu oposición en un solo lugar.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Comenzar ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Ver características
            </Button>
          </a>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-xl mx-auto">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">10K+</div>
            <div className="text-sm text-muted-foreground">Estudiantes</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground">Tests</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">95%</div>
            <div className="text-sm text-muted-foreground">Aprobados</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
