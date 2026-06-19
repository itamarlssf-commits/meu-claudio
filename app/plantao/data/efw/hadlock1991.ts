/* =========================================================================
   Referência de percentil — Hadlock 1991 (sem sexo).
   Aproximação log-normal sobre a mediana publicada.
   Hadlock FP et al. Radiology. 1991;181(1):129–133.
   ========================================================================= */
import { normCdf } from '../stats';
import { classify, type EfwReference } from '../types';

// mediana (g) por semana — Hadlock 1991
const HADLOCK_P50: Record<number, number> = {
  10: 35, 11: 45, 12: 58, 13: 73, 14: 93, 15: 117, 16: 146, 17: 181, 18: 223,
  19: 273, 20: 331, 21: 399, 22: 478, 23: 568, 24: 670, 25: 785, 26: 913,
  27: 1055, 28: 1210, 29: 1379, 30: 1559, 31: 1751, 32: 1953, 33: 2162,
  34: 2377, 35: 2595, 36: 2813, 37: 3028, 38: 3236, 39: 3435, 40: 3619,
};

export function hadlockMedian(gaWeeksFloat: number): number {
  const w = Math.max(10, Math.min(40, gaWeeksFloat));
  const lo = Math.floor(w);
  const hi = Math.min(40, lo + 1);
  const a = HADLOCK_P50[lo];
  const b = HADLOCK_P50[hi];
  if (a == null) return NaN;
  if (b == null || hi === lo) return a;
  return a + (b - a) * (w - lo);
}

const CV = 0.125; // coeficiente de variação aproximado (Hadlock)
const SIGMA_LOG = Math.sqrt(Math.log(1 + CV * CV)); // ≈ 0.1244 — desvio na escala log

export const hadlock1991: EfwReference = {
  id: 'hadlock',
  label: 'Hadlock 1991',
  shortLabel: 'Hadlock',
  cite: 'Hadlock FP et al. Radiology. 1991;181(1):129–133.',
  gaRangeDays: [70, 294],
  usesSex: false,
  usesMaternal: false,
  percentile(efwGrams, gaDays) {
    if (!Number.isFinite(efwGrams) || !Number.isFinite(gaDays)) return null;
    if (gaDays < 70 || gaDays > 294) return null;
    const median = hadlockMedian(gaDays / 7);
    if (!Number.isFinite(median)) return null;
    // peso fetal é log-normal → percentil na escala log
    const z = (Math.log(efwGrams) - Math.log(median)) / SIGMA_LOG;
    const p = normCdf(z) * 100;
    return { p, classification: classify(p), median, customized: false };
  },
};
