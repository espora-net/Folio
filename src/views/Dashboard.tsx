'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, BookOpen, ExternalLink, LogOut } from 'lucide-react';
import { hydrateFromApi } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SIDEBAR_COLLAPSED_KEY = 'folio-sidebar-collapsed';

const Dashboard = ({ children }: { children: ReactNode }) => {
  const { user, loading, isBetaUser, betaFormUrl, signOut } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Leer estado inicial del sidebar
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true');
    }

    // Escuchar cambios del sidebar
    const handleSidebarToggle = (e: CustomEvent<{ collapsed: boolean }>) => {
      setSidebarCollapsed(e.detail.collapsed);
    };
    window.addEventListener('folio-sidebar-toggle', handleSidebarToggle as EventListener);
    return () => window.removeEventListener('folio-sidebar-toggle', handleSidebarToggle as EventListener);
  }, []);

  useEffect(() => {
    hydrateFromApi().catch((error) => console.warn('Failed to hydrate study data from static API', error));
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Usuario autenticado pero NO está en la lista beta
  if (!isBetaUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Folio</span>
            </Link>
            <CardTitle>Piloto Beta Cerrado</CardTitle>
            <CardDescription>
              Actualmente Folio está en fase de piloto beta con acceso limitado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Has iniciado sesión como:</p>
              <p className="text-lg font-semibold text-foreground">
                {user?.name || 'Usuario GitHub'}
              </p>
              {user?.email && (
                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Tu cuenta aún no tiene acceso al piloto beta. Solicita acceso rellenando el formulario:
            </p>

            {betaFormUrl && (
              <Button className="w-full" asChild>
                <a href={betaFormUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Solicitar acceso al piloto beta
                </a>
              </Button>
            )}

            <Button
              className="w-full"
              variant="ghost"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={`p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>{children}</main>
    </div>
  );
};

export default Dashboard;
