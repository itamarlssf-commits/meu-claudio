'use client';

import useAuth from '@/hooks/useAuth';

export default function AppProvider({ children }: { children: React.ReactNode }) {
  useAuth();
  return <>{children}</>;
}
