'use client';

import { useRef, useCallback } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { saveReforma as fbSaveReforma } from '@/lib/firebase';
import type { ReformaData } from '@/types/reforma';

export default function useReforma() {
  const reforma = useAppStore((s) => s.reforma);
  const storeSetReforma = useAppStore((s) => s.setReforma);
  const setSyncStatus = useAppStore((s) => s.setSyncStatus);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setReforma = useCallback(
    (d: ReformaData) => {
      storeSetReforma(d);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fbSaveReforma(d).catch(() => setSyncStatus('offline'));
      }, 500);
    },
    [storeSetReforma, setSyncStatus],
  );

  return { reforma, setReforma };
}
