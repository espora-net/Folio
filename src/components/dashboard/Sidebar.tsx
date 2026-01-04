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
  PanelLeft,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile, MOBILE_BREAKPOINT } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { STUDY_TYPES, type StudyType, getUserPreferences, saveUserPreferences } from '@/lib/storage';

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
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedStudyType, setSelectedStudyType] = useState<StudyType>('oposiciones');
  const [customLabel, setCustomLabel] = useState('');

  useEffect(() => {
    // En móvil, siempre colapsar por defecto
    if (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT) {
      setCollapsed(true);
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, 'true');
      window.dispatchEvent(new CustomEvent('folio-sidebar-toggle', { detail: { collapsed: true } }));
    } else {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (saved !== null) {
        setCollapsed(saved === 'true');
      }
    }
    
    // Cargar preferencias actuales
    const prefs = getUserPreferences();
    if (prefs) {
      setSelectedStudyType(prefs.studyType);
      setCustomLabel(prefs.studyTypeLabel || '');
    }
    
    // Escuchar cambios de preferencias realizados desde otros componentes
    const onPrefsUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) {
        setSelectedStudyType(detail.studyType);
        setCustomLabel(detail.studyTypeLabel || '');
      }
    };
    window.addEventListener('folio-preferences-updated', onPrefsUpdated);

    setMounted(true);

    return () => {
      window.removeEventListener('folio-preferences-updated', onPrefsUpdated);
    };
  }, []);

  const handleSavePreferences = () => {
    saveUserPreferences({
      studyType: selectedStudyType,
      studyTypeLabel: customLabel.trim() || undefined,
      onboardingCompleted: true,
    });
    setSettingsOpen(false);
  };

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
    return (
      <>
        <aside className="fixed left-0 top-0 h-screen w-16 bg-card border-r border-border hidden md:block" />
        <div className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border md:hidden" />
      </>
    );
  }

  // Contenido del sidebar (compartido entre desktop y mobile)
  const sidebarContent = (isSheetContent = false) => (
    <>
      <div className={cn(
        "border-b border-border flex items-center",
        isSheetContent ? "p-4" : (collapsed ? "p-3 justify-center" : "p-6")
      )}>
        <Link href="/" className="flex items-center gap-2" onClick={() => isSheetContent && setMobileOpen(false)}>
          <BookOpen className="h-8 w-8 text-primary flex-shrink-0" />
          {(isSheetContent || !collapsed) && <span className="text-xl font-bold text-foreground">Folio</span>}
        </Link>
        {isSheetContent && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <nav className={cn(
        "flex-1 space-y-2",
        isSheetContent ? "p-4" : (collapsed ? "p-2" : "p-4")
      )}>
        {navItems.map((item) => {
          const isActive = item.end ? normalizedPath === item.to : normalizedPath.startsWith(item.to);
          const linkContent = (
            <Link
              key={item.to}
              href={item.to}
              onClick={() => isSheetContent && setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg transition-colors',
                isSheetContent ? 'px-4 py-3' : (collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'),
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {(isSheetContent || !collapsed) && <span className="font-medium">{item.label}</span>}
            </Link>
          );

          if (!isSheetContent && collapsed) {
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
      
      <div className={cn(
        "border-t border-border space-y-2",
        isSheetContent ? "p-4" : (collapsed ? "p-2" : "p-4")
      )}>
        {/* Toggle collapse button - solo desktop */}
        {!isSheetContent && (
          collapsed ? (
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
          )
        )}

        {/* Settings/Preferences */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          {(!isSheetContent && collapsed) ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Preferencias</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
              >
                <Settings className="h-5 w-5" />
                <span>Preferencias</span>
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preferencias de estudio</DialogTitle>
              <DialogDescription>
                Configura tu tipo de estudio para personalizar la experiencia.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2 grid-cols-2">
                {STUDY_TYPES.map((type) => (
                  <Card
                    key={type.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      selectedStudyType === type.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => setSelectedStudyType(type.id)}
                  >
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <span>{type.icon} {type.label}</span>
                        {selectedStudyType === type.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <CardDescription className="text-xs">{type.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customLabelSettings">Especifica qué estudias (opcional)</Label>
                <Input
                  id="customLabelSettings"
                  placeholder="Ej: Auxiliar Administrativo, Permiso B..."
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleSavePreferences}>
                Guardar preferencias
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Theme toggle */}
        {(!isSheetContent && collapsed) ? (
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
        {(!isSheetContent && collapsed) ? (
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
            onClick={() => {
              if (isSheetContent) setMobileOpen(false);
              signOut();
            }}
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </Button>
        )}
      </div>
    </>
  );

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile: Top bar with hamburger menu */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-card border-b border-border flex items-center px-4 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-card">
              <div className="flex flex-col h-full">
                {sidebarContent(true)}
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 ml-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Folio</span>
          </Link>
        </header>
      )}

      {/* Desktop: Sidebar */}
      {!isMobile && (
        <aside 
          className={cn(
            "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
            collapsed ? "w-16" : "w-64"
          )}
        >
          {sidebarContent(false)}
        </aside>
      )}
    </TooltipProvider>
  );
};

export default Sidebar;
