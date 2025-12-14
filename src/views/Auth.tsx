'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Github, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const router = useRouter();
  const { user, signIn, signOut, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [loading, router, user]);

  const handleLogin = async () => {
    setSubmitting(true);
    await signIn();
    setSubmitting(false);
  };

  const handleLogout = async () => {
    setSubmitting(true);
    await signOut();
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Folio</span>
          </Link>
          <CardTitle>Acceso con GitHub</CardTitle>
          <CardDescription>
            Autentícate con tu cuenta de GitHub mediante Authgear para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-left">
                <p className="text-sm text-muted-foreground">Sesión activa</p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {user.name || 'Usuario GitHub'}
                </p>
                {user.email && (
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
            </>
          ) : (
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleLogin}
              disabled={loading || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirigiendo a GitHub...
                </>
              ) : (
                <>
                  <Github className="h-5 w-5" />
                  Continuar con GitHub
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
