'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  CreditCard,
  FileText,
  BarChart3,
  Calendar,
  Moon,
  SunMedium,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navigation = [
  { name: 'Estudiar hoy', href: '/estudiar-hoy', icon: Calendar },
  { name: 'Temario', href: '/temario', icon: BookOpen },
  { name: 'Tarjetas', href: '/tarjetas', icon: CreditCard },
  { name: 'Test', href: '/test', icon: FileText },
  { name: 'Estadísticas', href: '/estadisticas', icon: BarChart3 },
];

type ThemeMode = 'light' | 'dark';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  theme,
  onThemeChange,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col transition-[width] duration-300"
      style={{ width: collapsed ? 80 : 256 }}
    >
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white leading-none">
              {collapsed ? 'F' : 'Folio'}
            </h1>
            {!collapsed && (
              <p className="text-xs text-zinc-400 mt-1">Oposiciones C1</p>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="px-3 pb-4">
        <fieldset className="border-0 p-0 m-0">
          <legend className="sr-only">Selector de tema</legend>
          <div className={`flex ${collapsed ? 'flex-col gap-2' : 'items-center gap-2'}`}>
            <label
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                theme === 'light'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              } ${collapsed ? 'justify-center' : ''}`}
              title="Modo claro"
            >
              <input
                type="radio"
                name="theme"
                value="light"
                className="sr-only"
                checked={theme === 'light'}
                onChange={() => onThemeChange('light')}
              />
              <SunMedium className="w-4 h-4" />
              {!collapsed && <span>Claro</span>}
            </label>
            <label
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              } ${collapsed ? 'justify-center' : ''}`}
              title="Modo oscuro"
            >
              <input
                type="radio"
                name="theme"
                value="dark"
                className="sr-only"
                checked={theme === 'dark'}
                onChange={() => onThemeChange('dark')}
              />
              <Moon className="w-4 h-4" />
              {!collapsed && <span>Oscuro</span>}
            </label>
          </div>
        </fieldset>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href) || (item.href === '/' && pathname === '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                } ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-zinc-800">
        <div className={`text-xs text-zinc-500 text-center ${collapsed ? 'text-[11px]' : ''}`}>
          {collapsed ? 'TAB C1' : 'Técnico Auxiliar de Bibliotecas'}
        </div>
      </div>
    </aside>
  );
}
