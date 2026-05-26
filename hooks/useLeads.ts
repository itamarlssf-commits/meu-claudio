'use client';

import { useRef, useCallback } from 'react';
import { useAppStore } from '@/store/use-app-store';
import {
  saveLead as fbSaveLead,
  deleteLead as fbDeleteLead,
} from '@/lib/firebase';
import type { Lead } from '@/types/lead';

export default function useLeads() {
  const leads = useAppStore((s) => s.leads);
  const upsertLead = useAppStore((s) => s.upsertLead);
  const removeLeadFromStore = useAppStore((s) => s.removeLeadFromStore);
  const setSyncStatus = useAppStore((s) => s.setSyncStatus);
  const user = useAppStore((s) => s.user);
  const debounceRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const saveLead = useCallback(
    (lead: Lead) => {
      upsertLead(lead);
      if (user) {
        const existing = debounceRef.current.get(lead.id);
        if (existing) clearTimeout(existing);
        const t = setTimeout(() => {
          fbSaveLead(lead, user.email ?? '').catch(() => setSyncStatus('offline'));
          debounceRef.current.delete(lead.id);
        }, 500);
        debounceRef.current.set(lead.id, t);
      }
    },
    [user, upsertLead, setSyncStatus],
  );

  const removeLead = useCallback(
    (id: string) => {
      removeLeadFromStore(id);
      if (user) {
        fbDeleteLead(id).catch(() => setSyncStatus('offline'));
      }
    },
    [user, removeLeadFromStore, setSyncStatus],
  );

  return { leads, saveLead, removeLead };
}
