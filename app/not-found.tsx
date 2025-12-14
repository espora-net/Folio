import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background text-center px-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Folio</p>
        <h1 className="text-4xl font-bold text-foreground">Página no encontrada</h1>
        <p className="text-muted-foreground max-w-md">
          No pudimos encontrar la ruta solicitada. Vuelve al inicio o accede al dashboard si ya has iniciado sesión.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/">
          <Button>Ir al inicio</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
