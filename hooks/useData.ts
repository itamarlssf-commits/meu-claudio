'use client';

import { useAppStore } from '@/store/use-app-store';
import { saveData as fbSaveData } from '@/lib/firebase';
import type { AppData } from '@/types/paciente';

export default function useData() {
  const data = useAppStore((s) => s.data);
  const storeSetData = useAppStore((s) => s.setData);
  const user = useAppStore((s) => s.user);

  function setData(d: AppData) {
    storeSetData(d); // saves to localStorage internally
    if (user) {
      fbSaveData(d, user.email || '').catch(console.error);
    }
  }

  return { data, setData };
}
