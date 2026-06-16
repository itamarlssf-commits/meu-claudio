/* =========================================================================
   Peso fetal estimado a partir da biometria — Hadlock 4 parâmetros.
   Hadlock FP et al. Am J Obstet Gynecol. 1985;151(3):333–337.
   Medidas em CENTÍMETROS; resultado em gramas.
   ========================================================================= */

export function hadlockEfwFromBiometry(
  bpdCm: number,
  hcCm: number,
  acCm: number,
  flCm: number
): number {
  if (![bpdCm, hcCm, acCm, flCm].every(Number.isFinite)) return NaN;
  const log10 =
    1.3596 -
    0.00386 * acCm * flCm +
    0.0064 * hcCm +
    0.00061 * bpdCm * acCm +
    0.0424 * acCm +
    0.174 * flCm;
  return Math.pow(10, log10);
}
