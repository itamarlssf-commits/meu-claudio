'use client';

import { useRef, useCallback } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { saveReforma as fbSaveReforma } from '@/lib/firebase';
import type { ReformaData } from '@/types/reforma';

export default function useReforma() {
  const reforma = useAppStore((s) => s.reforma);
  const storeSetReforma = useAppStore((s) => s.setReforma);
  const setSyncStatus = useAppStore((s) => s.setSyncStatus);
  const user = useAppStore((s) => s.user);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setReforma = useCallback(
    (d: ReformaData) => {
      storeSetReforma(d);
      if (user) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          fbSaveReforma(d, user.email ?? '').catch(() => setSyncStatus('offline'));
        }, 500);
      }
    },
    [user, storeSetReforma, setSyncStatus],
  );

  return { reforma, setReforma };
}
