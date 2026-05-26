import type { Gasto, Contribuicao, ReformaData, SocioReforma } from '@/types/reforma';
import { SOCIOS_REFORMA } from '@/types/reforma';

export function totalPrevisto(gastos: Gasto[]): number {
  return gastos.reduce((acc, g) => acc + g.parcelas.reduce((s, p) => s + p.valor, 0), 0);
}

export function totalPago(gastos: Gasto[]): number {
  return gastos.reduce((acc, g) => acc + g.parcelas.filter((p) => p.pago).reduce((s, p) => s + p.valor, 0), 0);
}

export function totalAPagar(gastos: Gasto[]): number {
  return totalPrevisto(gastos) - totalPago(gastos);
}

export function parcelasProximas(gastos: Gasto[], dias = 30): { gasto: Gasto; parcela: import('@/types/reforma').Parcela }[] {
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);

  const result: { gasto: Gasto; parcela: import('@/types/reforma').Parcela }[] = [];

  for (const gasto of gastos) {
    for (const parcela of gasto.parcelas) {
      if (parcela.pago) continue;
      const venc = new Date(parcela.vencimento + 'T00:00:00');
      if (venc <= limite) {
        result.push({ gasto, parcela });
      }
    }
  }

  return result.sort((a, b) => a.parcela.vencimento.localeCompare(b.parcela.vencimento));
}

export function parcelasVencidas(gastos: Gasto[]): { gasto: Gasto; parcela: import('@/types/reforma').Parcela }[] {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const result: { gasto: Gasto; parcela: import('@/types/reforma').Parcela }[] = [];
  for (const gasto of gastos) {
    for (const parcela of gasto.parcelas) {
      if (parcela.pago) continue;
      const venc = new Date(parcela.vencimento + 'T00:00:00');
      if (venc < hoje) result.push({ gasto, parcela });
    }
  }
  return result;
}

export interface SaldoSocio {
  socio: SocioReforma;
  quota: number;        // quanto deve pagar (total_pago / 10)
  contribuiu: number;   // quanto já pagou
  saldo: number;        // positivo = crédito, negativo = deve
}

export function saldosPorSocio(dados: ReformaData): SaldoSocio[] {
  const quota = totalPago(dados.gastos) / SOCIOS_REFORMA.length;

  return SOCIOS_REFORMA.map((socio) => {
    const contribuiu = dados.contribuicoes
      .filter((c) => c.socio === socio)
      .reduce((s, c) => s + c.valor, 0);
    return { socio, quota, contribuiu, saldo: contribuiu - quota };
  });
}

export function pctConcluido(gastos: Gasto[]): number {
  const prev = totalPrevisto(gastos);
  if (prev === 0) return 0;
  return Math.round((totalPago(gastos) / prev) * 100);
}

export function totalGastoPorCategoria(gastos: Gasto[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const g of gastos) {
    const pago = g.parcelas.filter((p) => p.pago).reduce((s, p) => s + p.valor, 0);
    result[g.categoria] = (result[g.categoria] ?? 0) + pago;
  }
  return result;
}
