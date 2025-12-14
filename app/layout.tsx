import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from '@/components/providers';
import '@/index.css';

export const metadata: Metadata = {
  title: 'Folio - Prepara tu oposición con método',
  description: 'Folio: tu hub de estudio moderno con login de GitHub y datos locales.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
