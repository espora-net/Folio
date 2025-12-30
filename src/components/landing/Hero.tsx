'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const Hero = () => {
  const router = useRouter();
  const { user, signIn } = useAuth();

  const handleAccess = async () => {
    if (user) {
      router.push('/dashboard');
      return;
    }
    await signIn('/dashboard');
  };

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
            Tu compañero de estudio inteligente
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          Estudia mejor,{' '}
          <span className="text-primary">aprende más</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Flashcards, tests de práctica y seguimiento de progreso. 
          Todo lo que necesitas para aprobar tus exámenes en un solo lugar.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="text-lg px-8 py-6" onClick={handleAccess}>
            Empezar gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <a href="#features">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Ver características
            </Button>
          </a>
        </div>
        
        {/* Study types */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground">Ideal para:</span>
          <span className="text-sm bg-muted px-3 py-1 rounded-full">📋 Oposiciones</span>
          <span className="text-sm bg-muted px-3 py-1 rounded-full">🚗 Carnet de conducir</span>
          <span className="text-sm bg-muted px-3 py-1 rounded-full">📚 Estudiantes</span>
          <span className="text-sm bg-muted px-3 py-1 rounded-full">🎓 Universidad</span>
          <span className="text-sm bg-muted px-3 py-1 rounded-full">🌍 Idiomas</span>
        </div>
        
        {/* Early adopter message */}
        <div className="mt-10 max-w-xl mx-auto">
          <a 
            href="https://forms.office.com/r/zn5AwbZxmD" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-6 py-3 hover:bg-primary/20 transition-colors"
          >
            <span className="text-sm text-primary font-medium">
              🚀 Sé de los primeros en probarlo — tu feedback nos ayuda a mejorar
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
