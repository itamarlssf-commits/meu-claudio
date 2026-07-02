'use client';

import usePontoAuth from '@/hooks/usePontoAuth';
import usePontoSync from '@/hooks/usePontoSync';

export default function PontoProvider({ children }: { children: React.ReactNode }) {
  usePontoAuth();
  usePontoSync();
  return <>{children}</>;
}
