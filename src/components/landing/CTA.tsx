'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const CTA = () => {
  const router = useRouter();
  const { user, signIn } = useAuth();

  const handleStart = async () => {
    if (user) {
      router.push('/dashboard');
      return;
    }
    await signIn('/dashboard');
  };

  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          ¿Listo para estudiar mejor?
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Estamos construyendo la mejor herramienta de estudio. 
          Únete ahora y alcanza tus metas.
        </p>
        <Button size="lg" className="text-lg px-8 py-6" onClick={handleStart}>
          Empezar gratis
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

export default CTA;
