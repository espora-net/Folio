'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { hydrateFromApi } from '@/lib/storage';
import { isAuthenticated } from '@/lib/authgear';

const SIDEBAR_COLLAPSED_KEY = 'folio-sidebar-collapsed';
const AUTO_LOGIN_ERROR_KEY = 'folio-auto-login-error';

const Dashboard = ({ children }: { children: ReactNode }) => {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const hasStartedLogin = useRef(false);

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
    if (!loading && user && typeof window !== 'undefined') {
      sessionStorage.removeItem(AUTO_LOGIN_ERROR_KEY);
    }
  }, [user, loading]);

  useEffect(() => {
    const shouldBlockAutoLogin =
      typeof window !== 'undefined' && sessionStorage.getItem(AUTO_LOGIN_ERROR_KEY) === 'true';

    if (shouldBlockAutoLogin) {
      router.push('/');
      return;
    }

    // Solo intentar login si no hay usuario Y no estamos cargando
    if (!loading && !user && !hasStartedLogin.current) {
      // Verificar directamente con Authgear antes de iniciar login
      // Esto evita race conditions donde el estado de React aún no se actualizó
      const checkAndLogin = async () => {
        try {
          const alreadyAuthenticated = await isAuthenticated();
          console.log('[Folio Dashboard] Verificación directa - authenticated:', alreadyAuthenticated);
          
          if (alreadyAuthenticated) {
            // Ya hay sesión en Authgear, solo esperar a que hydrateUser actualice el estado
            console.log('[Folio Dashboard] Ya autenticado en Authgear, esperando actualización de estado...');
            return;
          }
          
          // Realmente no hay sesión, iniciar login
          hasStartedLogin.current = true;
          console.log('[Folio Dashboard] Sin sesión, iniciando login automático...');
          await signIn('/dashboard');
        } catch (error) {
          console.error('[Folio Dashboard] Error al verificar/iniciar sesión', error);
          hasStartedLogin.current = false;
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(AUTO_LOGIN_ERROR_KEY, 'true');
          }
          router.push('/');
        }
      };
      
      checkAndLogin();
    }
  }, [user, loading, router, signIn]);

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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={`p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>{children}</main>
    </div>
  );
};

export default Dashboard;
