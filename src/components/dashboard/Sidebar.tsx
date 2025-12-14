'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  ClipboardCheck, 
  BarChart3,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/temario', icon: BookOpen, label: 'Temario', end: false },
  { to: '/dashboard/flashcards', icon: Brain, label: 'Flashcards', end: false },
  { to: '/dashboard/tests', icon: ClipboardCheck, label: 'Tests', end: false },
  { to: '/dashboard/progreso', icon: BarChart3, label: 'Progreso', end: false },
];

const Sidebar = () => {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const normalizedPath =
    pathname && pathname !== '/' && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname || '';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Folio</span>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              (item.end ? normalizedPath === item.to : normalizedPath.startsWith(item.to))
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border space-y-2">
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
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={async () => {
            await signOut();
            router.push('/auth');
          }}
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
