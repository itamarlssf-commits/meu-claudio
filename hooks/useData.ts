'use client';

import { useRef, useCallback } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { saveData as fbSaveData } from '@/lib/firebase';
import type { AppData } from '@/types/paciente';

export default function useData() {
  const data = useAppStore((s) => s.data);
  const storeSetData = useAppStore((s) => s.setData);
  const setSyncStatus = useAppStore((s) => s.setSyncStatus);
  const user = useAppStore((s) => s.user);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setData = useCallback(
    (d: AppData) => {
      storeSetData(d); // instant: store + localStorage
      if (user) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          fbSaveData(d, user.email ?? '').catch(() => setSyncStatus('offline'));
        }, 500);
      }
    },
    [user, storeSetData, setSyncStatus],
  );

  return { data, setData };
}
