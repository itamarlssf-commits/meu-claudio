'use client';

import { useEffect } from 'react';
import { usePontoStore } from '@/store/use-ponto-store';
import { subscribeFuncionarias, subscribeRegistros } from '@/lib/ponto-firebase';

export default function usePontoSync() {
  const usuario = usePontoStore((s) => s.usuario);
  const setFuncionarias = usePontoStore((s) => s.setFuncionarias);
  const setRegistros = usePontoStore((s) => s.setRegistros);
  const setSyncStatus = usePontoStore((s) => s.setSyncStatus);

  const papel = usuario?.papel;
  const funcionariaId = usuario?.funcionariaId;

  // Registros: admin vê todos; funcionária vê apenas os seus.
  useEffect(() => {
    if (!usuario) return;
    setSyncStatus('connecting');
    const filtro = papel === 'funcionaria' ? funcionariaId : undefined;
    const unsub = subscribeRegistros((registros) => {
      setRegistros(registros);
      setSyncStatus('live');
    }, filtro);
    return () => unsub();
  }, [usuario, papel, funcionariaId, setRegistros, setSyncStatus]);

  // Lista de funcionárias: apenas o admin precisa.
  useEffect(() => {
    if (papel !== 'admin') {
      setFuncionarias([]);
      return;
    }
    const unsub = subscribeFuncionarias((funcionarias) => setFuncionarias(funcionarias));
    return () => unsub();
  }, [papel, setFuncionarias]);
}
