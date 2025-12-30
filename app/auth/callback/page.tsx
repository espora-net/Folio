'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { finishLogin, consumePostLoginRedirect } from '@/lib/authgear';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState('/dashboard');

  const handleRetry = useCallback(() => {
    signIn(redirectTo);
  }, [redirectTo, signIn]);

  useEffect(() => {
    const target = consumePostLoginRedirect() ?? '/dashboard';
    setRedirectTo(target);

    const handleCallback = async () => {
      try {
        console.log('[Folio Callback] Procesando callback de autenticación...');
        await finishLogin();
        console.log('[Folio Callback] Login completado, redirigiendo a:', target);
        // Limpiar flag de login en progreso
        sessionStorage.removeItem('folio-login-in-progress');
        // replace updates the current entry so the callback page is not kept in history
        router.replace(target);
      } catch (err) {
        console.error('[Folio Callback] Error en callback de autenticación:', err);
        sessionStorage.removeItem('folio-login-in-progress');
        setError(err instanceof Error ? err.message : 'Error desconocido durante la autenticación');
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Folio</span>
            </Link>
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error de autenticación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">{error}</p>
            {/* Direct retry without intermediate screens */}
            <Button className="w-full" onClick={handleRetry}>
              Volver a intentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Folio</span>
          </Link>
          <CardTitle>Completando autenticación...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}
