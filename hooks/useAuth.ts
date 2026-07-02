'use client';

import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  subscribePacientes,
  savePacientes,
  fetchLegacyData,
  saveDailyBackup,
} from '@/lib/firebase';
import { pendingIds, deletedIds } from '@/lib/sync-queue';
import { useAppStore } from '@/store/use-app-store';
import { loadData } from '@/lib/business-logic';
import type { Paciente } from '@/types/paciente';

export default function useAuth() {
  const setUser = useAppStore((s) => s.setUser);
  const setAuthReady = useAppStore((s) => s.setAuthReady);
  const setData = useAppStore((s) => s.setData);
  const setSyncStatus = useAppStore((s) => s.setSyncStatus);
  const migrated = useRef(false);
  const backupDone = useRef(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthReady(true);

      if (!user) {
        setSyncStatus('offline');
        return;
      }

      setSyncStatus('connecting');

      const unsubData = subscribePacientes(
        (remote, meta) => {
          setSyncStatus(meta.fromCache ? 'connecting' : 'live');

          if (remote.length > 0) {
            // Merge: pacientes com edição local ainda não enviada mantêm a
            // versão local — o snapshot remoto nunca apaga o que acabou de
            // ser digitado neste dispositivo.
            const local = useAppStore.getState().data;
            const localMap = new Map(local.pacientes.map((p) => [p.id, p]));
            const remoteIds = new Set(remote.map((p) => p.id));
            const merged: Paciente[] = remote.map((p) =>
              pendingIds.has(p.id) ? localMap.get(p.id) ?? p : p,
            );
            for (const p of local.pacientes) {
              if (pendingIds.has(p.id) && !remoteIds.has(p.id)) merged.push(p);
            }
            const final = merged.filter((p) => !deletedIds.has(p.id));
            setData({ pacientes: final });

            // Backup diário automático (uma foto do banco por dia).
            if (!meta.fromCache && !backupDone.current) {
              backupDone.current = true;
              saveDailyBackup(final).catch(() => {});
            }
            return;
          }

          // Coleção vazia confirmada pelo servidor → migração automática:
          // 1º do banco antigo (blob único), senão do localStorage.
          if (!meta.fromCache && !migrated.current) {
            migrated.current = true;
            fetchLegacyData().then((legacy) => {
              const source = legacy?.pacientes?.length ? legacy : loadData();
              if (source?.pacientes?.length) {
                savePacientes(source.pacientes, [], user.email ?? '')
                  .then(() => setSyncStatus('live'))
                  .catch(() => setSyncStatus('offline'));
              }
            });
          }
        },
        () => setSyncStatus('offline'),
      );

      return () => {
        unsubData();
      };
    });

    return () => {
      unsubAuth();
    };
  }, [setUser, setAuthReady, setData, setSyncStatus]);
}
