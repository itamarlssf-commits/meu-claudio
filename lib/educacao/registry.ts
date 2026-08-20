import type { Cena } from '@/types/educacao';
import { cenaParto } from './cenas/parto';
import { cenaEndometriose } from './cenas/endometriose';
import { cenaCiclo } from './cenas/ciclo';

/** Todas as cenas disponíveis no módulo Educação, na ordem em que aparecem. */
export const CENAS: Cena[] = [cenaParto, cenaEndometriose, cenaCiclo];

export function buscarCena(id: string): Cena | undefined {
  return CENAS.find((c) => c.id === id);
}

/** Camadas que já vêm ligadas ao abrir a cena. */
export function camadasIniciais(cena: Cena): Set<string> {
  return new Set((cena.camadas ?? []).filter((c) => c.ativaPorPadrao).map((c) => c.id));
}
