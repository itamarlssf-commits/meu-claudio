/* =========================================================================
   Referência de percentil — Fetal Medicine Foundation (Nicolaides 2018).
   Carta de peso fetal populacional. Peso estimado pela fórmula de Hadlock;
   o percentil usa a distribuição log10-gaussiana publicada pela FMF.
   NÃO é sexo-específica (equação populacional única).

   Equação (log10 do PFE) e DP em função da IG, conferidas contra a
   implementação open-source FetalGPSR (Wright/Detroit), validada na
   literatura, e checadas por valores-âncora fisiológicos
   (mediana ≈ 321 g a 20 sem, ≈ 3459 g a 40 sem).

   Nicolaides KH, Wright D, Syngelaki A, Wright A, Akolekar R.
   Ultrasound Obstet Gynecol. 2018;52(1):44–51.
   Verificação: Daniels & Wright. FetalGPSR. Am J Obstet Gynecol. 2020.
   ========================================================================= */
import { normCdf } from '../stats';
import { classify, type EfwReference } from '../types';

// faixa de aplicabilidade: 20 a <43 semanas → 140 a 300 dias
const GA_MIN = 140;
const GA_MAX = 300;

function meanLog10(gaDays: number): number {
  const x = gaDays - 199;
  return 3.0893 + 0.00835 * x - 0.00002965 * x * x - 0.00000006062 * x * x * x;
}
const sdLog10 = (gaDays: number): number => 0.02464 + 0.0000564 * gaDays;

export const fmf2018: EfwReference = {
  id: 'fmf',
  label: 'FMF 2018 (Nicolaides)',
  shortLabel: 'FMF',
  cite: 'Nicolaides KH et al. Ultrasound Obstet Gynecol. 2018;52(1):44–51.',
  gaRangeDays: [GA_MIN, GA_MAX],
  usesSex: false,
  usesMaternal: false,
  percentile(efwGrams, gaDays) {
    if (!Number.isFinite(efwGrams) || efwGrams <= 0 || !Number.isFinite(gaDays)) return null;
    if (gaDays < GA_MIN || gaDays > GA_MAX) return null;
    const mn = meanLog10(gaDays);
    const sde = sdLog10(gaDays);
    const z = (Math.log10(efwGrams) - mn) / sde;
    const p = normCdf(z) * 100;
    return { p, classification: classify(p), median: Math.pow(10, mn), customized: false };
  },
};
