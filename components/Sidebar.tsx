'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  CreditCard, 
  FileText, 
  BarChart3, 
  Calendar 
} from 'lucide-react';

const navigation = [
  { name: 'Estudiar hoy', href: '/estudiar-hoy', icon: Calendar },
  { name: 'Temario', href: '/temario', icon: BookOpen },
  { name: 'Tarjetas', href: '/tarjetas', icon: CreditCard },
  { name: 'Test', href: '/test', icon: FileText },
  { name: 'Estadísticas', href: '/estadisticas', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-6">
        <Link href="/">
          <h1 className="text-2xl font-bold text-white">Folio</h1>
          <p className="text-xs text-zinc-400 mt-1">Oposiciones C1</p>
        </Link>
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
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-500 text-center">
          Técnico Auxiliar de Bibliotecas
        </div>
      </div>
    </aside>
  );
}
