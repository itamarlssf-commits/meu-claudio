'use client';

import { useCallback, useState } from 'react';
import { usePontoStore } from '@/store/use-ponto-store';
import { saveRegistro, uploadSelfie } from '@/lib/ponto-firebase';
import {
  novoId,
  dataLocal,
  horaLocal,
  comprimirImagem,
  obterLocalizacao,
} from '@/lib/ponto-logic';
import type { RegistroPonto, TipoRegistro } from '@/types/ponto';

interface BaterPontoParams {
  funcionariaId: string;
  funcionariaNome: string;
  tipo: TipoRegistro;
  selfie?: File | null;
  obs?: string;
}

/**
 * Hook para registrar uma batida de ponto: captura GPS, comprime/sobe a selfie
 * e grava o registro no Firestore. Atualiza o store de forma otimista.
 */
export default function useBaterPonto() {
  const upsertRegistro = usePontoStore((s) => s.upsertRegistro);
  const setSyncStatus = usePontoStore((s) => s.setSyncStatus);
  const [salvando, setSalvando] = useState(false);

  const baterPonto = useCallback(
    async ({ funcionariaId, funcionariaNome, tipo, selfie, obs }: BaterPontoParams) => {
      setSalvando(true);
      try {
        const agora = new Date();
        const id = novoId();

        // GPS (não bloqueia o registro se for negado)
        let lat: number | undefined;
        let lng: number | undefined;
        let precisao: number | undefined;
        try {
          const coord = await obterLocalizacao();
          lat = coord.lat;
          lng = coord.lng;
          precisao = coord.precisao;
        } catch {
          // segue sem localização
        }

        // Selfie (também opcional)
        let selfieUrl: string | undefined;
        if (selfie) {
          try {
            const dataUrl = await comprimirImagem(selfie);
            selfieUrl = await uploadSelfie(funcionariaId, id, dataUrl);
          } catch {
            // segue sem selfie
          }
        }

        const registro: RegistroPonto = {
          id,
          funcionariaId,
          funcionariaNome,
          tipo,
          timestamp: agora.getTime(),
          data: dataLocal(agora),
          hora: horaLocal(agora),
          selfieUrl,
          lat,
          lng,
          precisao,
          obs: obs || undefined,
        };

        upsertRegistro(registro);
        await saveRegistro(registro);
        setSyncStatus('live');
        return registro;
      } catch (err) {
        setSyncStatus('offline');
        throw err;
      } finally {
        setSalvando(false);
      }
    },
    [upsertRegistro, setSyncStatus],
  );

  return { baterPonto, salvando };
}
