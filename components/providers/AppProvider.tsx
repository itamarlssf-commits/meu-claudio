'use client';

import useAuth from '@/hooks/useAuth';
import useLeadsSync from '@/hooks/useLeadsSync';

export default function AppProvider({ children }: { children: React.ReactNode }) {
  useAuth();
  useLeadsSync();
  return <>{children}</>;
}
