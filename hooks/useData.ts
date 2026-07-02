'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { savePacientes } from '@/lib/firebase';
import { pendingIds, deletedIds } from '@/lib/sync-queue';
import type { AppData } from '@/types/paciente';

export default function useData() {
  const data = useAppStore((s) => s.data);
  const storeSetData = useAppStore((s) => s.setData);
  const setSyncStatus = useAppStore((s) => s.setSyncStatus);
  const user = useAppStore((s) => s.user);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userRef = useRef(user);
  userRef.current = user;

  const flush = useCallback(() => {
    const u = userRef.current;
    if (!u) return;
    const latest = useAppStore.getState().data;
    const ids = new Set(pendingIds);
    const dels = Array.from(deletedIds);
    pendingIds.clear();
    deletedIds.clear();
    const changed = latest.pacientes.filter((p) => ids.has(p.id));
    if (changed.length === 0 && dels.length === 0) return;
    savePacientes(changed, dels, u.email ?? '').catch(() => {
      // Falha de rede: devolve à fila para reenvio na próxima edição.
      changed.forEach((p) => pendingIds.add(p.id));
      dels.forEach((id) => deletedIds.add(id));
      setSyncStatus('offline');
    });
  }, [setSyncStatus]);

  const setData = useCallback(
    (d: AppData) => {
      // Diff contra o estado atual: só os pacientes tocados NESTA ação entram
      // na fila de gravação. Nunca reenviamos o banco inteiro.
      const prev = useAppStore.getState().data;
      const prevMap = new Map(prev.pacientes.map((p) => [p.id, p]));
      const nextIds = new Set(d.pacientes.map((p) => p.id));
      for (const p of d.pacientes) {
        const old = prevMap.get(p.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(p)) {
          pendingIds.add(p.id);
          deletedIds.delete(p.id);
        }
      }
      for (const p of prev.pacientes) {
        if (!nextIds.has(p.id)) {
          deletedIds.add(p.id);
          pendingIds.delete(p.id);
        }
      }

      storeSetData(d); // imediato: store + localStorage

      if (userRef.current) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(flush, 600);
      }
    },
    [storeSetData, flush],
  );

  // Garante que edições pendentes sejam enviadas ao fechar/trocar de aba.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [flush]);

  return { data, setData };
}
