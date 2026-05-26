'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { subscribeLeads } from '@/lib/firebase';

export default function useLeadsSync() {
  const user = useAppStore((s) => s.user);
  const setLeads = useAppStore((s) => s.setLeads);
  const setLeadsReady = useAppStore((s) => s.setLeadsReady);

  useEffect(() => {
    if (!user) {
      setLeadsReady(true);
      return;
    }
    const unsub = subscribeLeads((leads) => {
      setLeads(leads);
      setLeadsReady(true);
    });
    return () => unsub();
  }, [user, setLeads, setLeadsReady]);
}
