'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const router = useRouter();
  const { user, signIn, signOut, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const hasTriggeredLogin = useRef(false);

  useEffect(() => {
    if (loading) return;
    
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (user) {
      router.push('/dashboard');
      return;
    }
    
    // Si no está autenticado y no hemos iniciado el login, redirigir a Authgear
    if (!hasTriggeredLogin.current) {
      hasTriggeredLogin.current = true;
      signIn('/dashboard');
    }
  }, [loading, user, router, signIn]);

  const handleLogout = async () => {
    setSubmitting(true);
    await signOut();
    setSubmitting(false);
  };

  // Mostrar pantalla de carga mientras se redirige a Authgear
  if (loading || (!user && !submitting)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Folio</span>
            </Link>
            <CardTitle>Redirigiendo a GitHub...</CardTitle>
            <CardDescription>
              Serás redirigido a GitHub para autenticarte.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Solo mostrar la UI de usuario logado (para cerrar sesión)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Folio</span>
          </Link>
          <CardTitle>Sesión activa</CardTitle>
          <CardDescription>
            Ya estás autenticado con GitHub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-left">
            <p className="text-sm text-muted-foreground">Sesión activa</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {user?.name || 'Usuario GitHub'}
            </p>
            {user?.email && (
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
          <Button className="w-full" variant="outline" onClick={() => router.push('/dashboard')}>
            Ir al dashboard
          </Button>
          <Button
            className="w-full"
            variant="ghost"
            onClick={handleLogout}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cerrando sesión...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
