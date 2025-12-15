'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  ClipboardCheck, 
  BarChart3,
  LogOut,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/temario', icon: BookOpen, label: 'Temario', end: false },
  { to: '/dashboard/flashcards', icon: Brain, label: 'Flashcards', end: false },
  { to: '/dashboard/tests', icon: ClipboardCheck, label: 'Tests', end: false },
  { to: '/dashboard/progreso', icon: BarChart3, label: 'Progreso', end: false },
];

const SIDEBAR_COLLAPSED_KEY = 'folio-sidebar-collapsed';

const Sidebar = () => {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
    setMounted(true);
  }, []);

  const toggleCollapsed = () => {
    const newValue = !collapsed;
    setCollapsed(newValue);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
    // Emitir evento para que el layout ajuste el padding
    window.dispatchEvent(new CustomEvent('folio-sidebar-toggle', { detail: { collapsed: newValue } }));
  };

  const normalizedPath =
    pathname && pathname !== '/' && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname || '';

  // Evitar flash de contenido incorrecto
  if (!mounted) {
    return <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border" />;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn("border-b border-border flex items-center", collapsed ? "p-3 justify-center" : "p-6")}>
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary flex-shrink-0" />
            {!collapsed && <span className="text-xl font-bold text-foreground">Folio</span>}
          </Link>
        </div>
        
        <nav className={cn("flex-1 space-y-2", collapsed ? "p-2" : "p-4")}>
          {navItems.map((item) => {
            const isActive = item.end ? normalizedPath === item.to : normalizedPath.startsWith(item.to);
            const linkContent = (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-lg transition-colors',
                  collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            return linkContent;
          })}
        </nav>
        
        <div className={cn("border-t border-border space-y-2", collapsed ? "p-2" : "p-4")}>
          {/* Toggle collapse button */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full"
                  onClick={toggleCollapsed}
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Expandir menú</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={toggleCollapsed}
            >
              <PanelLeftClose className="h-5 w-5" />
              <span>Colapsar menú</span>
            </Button>
          )}

          {/* Theme toggle */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full"
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-5 w-5" />
                  <span>Modo oscuro</span>
                </>
              ) : (
                <>
                  <Sun className="h-5 w-5" />
                  <span>Modo claro</span>
                </>
              )}
            </Button>
          )}

          {/* Logout */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Cerrar sesión</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
