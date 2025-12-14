'use client';

import { ReactNode } from 'react';
import Dashboard from '@/views/Dashboard';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <Dashboard>{children}</Dashboard>;
}
