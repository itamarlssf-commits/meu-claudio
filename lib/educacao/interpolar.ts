import type { Etapa } from '@/types/educacao';

/** Limita um número ao intervalo [min, max]. */
export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v));
}

/** Interpolação linear entre a e b. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Suaviza a transição nas bordas (ease-in-out cúbico).
 * Usado para que o movimento não comece nem termine em solavanco.
 */
export function suavizar(t: number): number {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Mapeia um progresso global 0..1 para 0..1 dentro de uma faixa,
 * devolvendo 0 antes da faixa e 1 depois dela.
 */
export function faixa(progresso: number, inicio: number, fim: number): number {
  if (fim <= inicio) return progresso >= fim ? 1 : 0;
  return clamp((progresso - inicio) / (fim - inicio));
}

/** Etapa vigente para um dado progresso (a última cujo início já passou). */
export function etapaAtual(etapas: Etapa[], progresso: number): Etapa | undefined {
  if (etapas.length === 0) return undefined;
  let atual = etapas[0];
  for (const e of etapas) {
    if (progresso >= e.progresso - 1e-6) atual = e;
  }
  return atual;
}

/** Índice da etapa vigente, ou -1 se não houver etapas. */
export function indiceEtapaAtual(etapas: Etapa[], progresso: number): number {
  const atual = etapaAtual(etapas, progresso);
  return atual ? etapas.indexOf(atual) : -1;
}

/**
 * Interpola um valor ao longo de uma tabela de chaves [progresso, valor],
 * ordenada por progresso crescente. Fora das bordas devolve o valor da ponta.
 */
export function porChaves(progresso: number, chaves: ReadonlyArray<readonly [number, number]>): number {
  if (chaves.length === 0) return 0;
  const p = clamp(progresso);
  if (p <= chaves[0][0]) return chaves[0][1];
  const ultima = chaves[chaves.length - 1];
  if (p >= ultima[0]) return ultima[1];

  for (let i = 0; i < chaves.length - 1; i++) {
    const [pa, va] = chaves[i];
    const [pb, vb] = chaves[i + 1];
    if (p >= pa && p <= pb) {
      return lerp(va, vb, suavizar(faixa(p, pa, pb)));
    }
  }
  return ultima[1];
}
