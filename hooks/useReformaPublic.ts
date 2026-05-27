'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { subscribeReforma, saveReforma } from '@/lib/firebase';
import type { ReformaData } from '@/types/reforma';
import { REFORMA_DEFAULT } from '@/types/reforma';

export function useReformaPublic() {
  const [reforma, setReformaState] = useState<ReformaData>(REFORMA_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'live' | 'offline'>('connecting');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = subscribeReforma((data) => {
      setReformaState(data ?? REFORMA_DEFAULT);
      setLoading(false);
      setSyncStatus('live');
    });
    return unsub;
  }, []);

  const setReforma = useCallback((data: ReformaData) => {
    setReformaState(data);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveReforma(data).catch(() => setSyncStatus('offline'));
    }, 400);
  }, []);

  return { reforma, setReforma, loading, syncStatus };
}
