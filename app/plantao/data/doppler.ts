/* =========================================================================
   Doppler feto-placentário — percentil automático por idade gestacional.
   Puro, sem React. Dados transcritos de fontes primárias e validados por
   valores-âncora (ver checks.ts).

   Referências:
   • Artéria umbilical (AU), cerebral média (ACM) e razão cerebroplacentária
     (RCP = ACM/AU): Ciobanu A, Wright A, Syngelaki A, Wright D, Akolekar R,
     Nicolaides KH. "Fetal Medicine Foundation reference ranges for umbilical
     artery and middle cerebral artery pulsatility index and cerebroplacental
     ratio." Ultrasound Obstet Gynecol 2019;53(4):465–472.
     DOI: 10.1002/uog.20157.  Distribuição log10-gaussiana; mediana e DP por IG
     transcritos da Tabela 2 (centis 5/10/25/50/75/90/95, IG 20–41 sem). O DP
     em log10 é recuperado de (log10 p95 − log10 p5)/(2·1,6449); a reconstrução
     de p10/p90 confere com a tabela com erro ≤ 0,0015.
   • Artérias uterinas (IP médio): Gómez O, Figueras F, Fernández S, Bennasar M,
     Martínez JM, Puerto B, Gratacós E. "Reference ranges for uterine artery
     mean pulsatility index at 11–41 weeks of gestation." Ultrasound Obstet
     Gynecol 2008;32(2):128–132. DOI: 10.1002/uog.5315.
     Média: ln(IP) = 1,39 − 0,012·IG + 0,0000198·IG² (IG em dias). O DP em
     escala ln é APROXIMADO, derivado dos centis publicados (média e p95 em
     11, 34 e 41 sem) por interpolação linear — marcado como aproximação.
   ========================================================================= */

import { normCdf } from './stats';

export type DopplerVesselId = 'ua' | 'mca' | 'cpr' | 'uta';

export interface DopplerPercentile {
  p: number; // 0–100
  median: number; // IP esperado (p50) na IG
  abnormal: boolean; // além do limiar anormal do vaso (AU/UtA: >p95; ACM/RCP: <p5)
  approximate: boolean; // true para uterina (DP derivado)
}

export interface PiReference {
  id: DopplerVesselId;
  label: string;
  shortLabel: string;
  cite: string;
  highIsAbnormal: boolean; // true: IP > p95 é anormal | false: IP < p5 é anormal
  gaRangeDays: readonly [number, number];
  percentile(value: number, gaDays: number): DopplerPercentile | null;
}

// ---- Ciobanu 2019 — anâncoras de IG (dias): 143..290, passo 7 (20–41 sem) ----
const CIOBANU_GA: readonly number[] = [
  143, 150, 157, 164, 171, 178, 185, 192, 199, 206, 213, 220, 227, 234, 241, 248,
  255, 262, 269, 276, 283, 290,
];

interface Log10Table {
  median: readonly number[];
  sdLog10: readonly number[];
}

const UA_TABLE: Log10Table = {
  median: [1.218, 1.197, 1.176, 1.155, 1.134, 1.113, 1.092, 1.07, 1.049, 1.028, 1.007, 0.986, 0.965, 0.944, 0.923, 0.902, 0.881, 0.86, 0.839, 0.818, 0.797, 0.776],
  sdLog10: [0.064191, 0.064106, 0.064161, 0.064072, 0.06422, 0.064526, 0.064783, 0.065304, 0.065748, 0.06631, 0.066998, 0.067783, 0.068709, 0.069676, 0.070797, 0.071859, 0.073085, 0.074371, 0.075721, 0.077477, 0.07898, 0.080564],
};

const MCA_TABLE: Log10Table = {
  median: [1.486, 1.54, 1.595, 1.651, 1.705, 1.757, 1.805, 1.848, 1.883, 1.909, 1.924, 1.926, 1.915, 1.889, 1.848, 1.791, 1.718, 1.632, 1.532, 1.421, 1.302, 1.177],
  sdLog10: [0.064983, 0.063078, 0.061669, 0.060417, 0.059661, 0.059019, 0.058753, 0.058896, 0.05931, 0.059937, 0.061007, 0.062395, 0.064021, 0.065958, 0.068249, 0.070883, 0.073704, 0.076982, 0.08054, 0.084412, 0.088567, 0.093093],
};

const CPR_TABLE: Log10Table = {
  median: [1.212, 1.289, 1.367, 1.447, 1.526, 1.605, 1.68, 1.751, 1.817, 1.875, 1.924, 1.962, 1.988, 2.0, 1.997, 1.979, 1.944, 1.894, 1.827, 1.747, 1.653, 1.547],
  sdLog10: [0.087042, 0.085136, 0.083656, 0.082412, 0.081542, 0.080921, 0.080784, 0.080743, 0.081182, 0.0819, 0.082874, 0.084276, 0.08592, 0.087866, 0.090245, 0.092875, 0.095779, 0.099098, 0.102638, 0.106514, 0.110811, 0.115246],
};

// interpolação linear sobre as âncoras de Ciobanu (clampa nas pontas)
function interpCiobanu(table: Log10Table, gaDays: number): { median: number; sd: number } {
  const first = CIOBANU_GA[0];
  const last = CIOBANU_GA[CIOBANU_GA.length - 1];
  const g = Math.max(first, Math.min(last, gaDays));
  const pos = (g - first) / 7;
  const i = Math.min(CIOBANU_GA.length - 2, Math.floor(pos));
  const f = pos - i;
  const lerp = (a: readonly number[]) => a[i] + (a[i + 1] - a[i]) * f;
  return { median: lerp(table.median), sd: lerp(table.sdLog10) };
}

function makeCiobanuRef(
  id: DopplerVesselId,
  label: string,
  shortLabel: string,
  table: Log10Table,
  highIsAbnormal: boolean
): PiReference {
  return {
    id,
    label,
    shortLabel,
    cite: 'Ciobanu A et al. Ultrasound Obstet Gynecol 2019;53:465–472 (DOI: 10.1002/uog.20157).',
    highIsAbnormal,
    gaRangeDays: [140, 293],
    percentile(value: number, gaDays: number): DopplerPercentile | null {
      if (!Number.isFinite(value) || value <= 0) return null;
      if (!Number.isFinite(gaDays) || gaDays < 140 || gaDays > 293) return null;
      const { median, sd } = interpCiobanu(table, gaDays);
      const z = (Math.log10(value) - Math.log10(median)) / sd;
      const p = normCdf(z) * 100;
      const abnormal = highIsAbnormal ? p > 95 : p < 5;
      return { p, median, abnormal, approximate: false };
    },
  };
}

// ---- Gómez 2008 — artérias uterinas (IP médio) ----
// média: ln(IP) = 1,39 − 0,012·GA + 0,0000198·GA²  (GA em dias)
function utaMeanLn(gaDays: number): number {
  return 1.39 - 0.012 * gaDays + 0.0000198 * gaDays * gaDays;
}

// DP em ln derivado dos centis publicados (média e p95 em 11/34/41 sem):
//   DP_ln = ln(p95/média)/1,6449  →  0,2499 (77 d) · 0,2107 (238 d) · 0,1911 (287 d)
// Aproximação por interpolação linear entre essas três âncoras.
const UTA_SD_GA: readonly number[] = [77, 238, 287];
const UTA_SD_LN: readonly number[] = [0.249915, 0.210729, 0.191085];

function utaSdLn(gaDays: number): number {
  const g = Math.max(UTA_SD_GA[0], Math.min(UTA_SD_GA[UTA_SD_GA.length - 1], gaDays));
  for (let i = 0; i < UTA_SD_GA.length - 1; i++) {
    if (g <= UTA_SD_GA[i + 1]) {
      const f = (g - UTA_SD_GA[i]) / (UTA_SD_GA[i + 1] - UTA_SD_GA[i]);
      return UTA_SD_LN[i] + (UTA_SD_LN[i + 1] - UTA_SD_LN[i]) * f;
    }
  }
  return UTA_SD_LN[UTA_SD_LN.length - 1];
}

const utaRef: PiReference = {
  id: 'uta',
  label: 'Artérias uterinas (IP médio)',
  shortLabel: 'Uterinas',
  cite: 'Gómez O et al. Ultrasound Obstet Gynecol 2008;32:128–132 (DOI: 10.1002/uog.5315). DP aproximado.',
  highIsAbnormal: true,
  gaRangeDays: [77, 294],
  percentile(value: number, gaDays: number): DopplerPercentile | null {
    if (!Number.isFinite(value) || value <= 0) return null;
    if (!Number.isFinite(gaDays) || gaDays < 77 || gaDays > 294) return null;
    const meanLn = utaMeanLn(gaDays);
    const sd = utaSdLn(gaDays);
    const z = (Math.log(value) - meanLn) / sd;
    const p = normCdf(z) * 100;
    return { p, median: Math.exp(meanLn), abnormal: p > 95, approximate: true };
  },
};

export const PI_UA = makeCiobanuRef('ua', 'Artéria umbilical (AU)', 'AU', UA_TABLE, true);
export const PI_MCA = makeCiobanuRef('mca', 'Artéria cerebral média (ACM)', 'ACM', MCA_TABLE, false);
export const PI_CPR = makeCiobanuRef('cpr', 'Razão cerebroplacentária (RCP)', 'RCP', CPR_TABLE, false);
export const PI_UTA = utaRef;

export const PI_REFERENCES = [PI_UA, PI_MCA, PI_CPR, PI_UTA] as const;

// Flags de estágio I da RCF derivadas automaticamente do Doppler.
// undefined = sem dado/IG → a aba RCF mantém o controle manual.
export interface StageFlags {
  uaP95?: boolean;
  mcaP5?: boolean;
  cprP5?: boolean;
  utaP95?: boolean;
}

export function deriveStageFlags(
  inputs: { ua: number; mca: number; cpr: number; uta: number },
  gaDays: number
): StageFlags {
  const f: StageFlags = {};
  const ua = PI_UA.percentile(inputs.ua, gaDays);
  if (ua) f.uaP95 = ua.abnormal;
  const mca = PI_MCA.percentile(inputs.mca, gaDays);
  if (mca) f.mcaP5 = mca.abnormal;
  const cpr = PI_CPR.percentile(inputs.cpr, gaDays);
  if (cpr) f.cprP5 = cpr.abnormal;
  const uta = PI_UTA.percentile(inputs.uta, gaDays);
  if (uta) f.utaP95 = uta.abnormal;
  return f;
}
