/* =========================================================================
   Estatística e helpers numéricos — puros, sem React.
   Extraídos de page.tsx para serem reutilizáveis e testáveis.
   ========================================================================= */

// erf p/ percentil normal (Abramowitz & Stegun 7.1.26)
export function erf(x: number): number {
  const s = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return s * y;
}

export const normCdf = (z: number): number => 0.5 * (1 + erf(z / Math.SQRT2));

// inverso da normal padrão (Acklam, 2003). p em (0,1) → z.
export function normInv(p: number): number {
  if (!(p > 0 && p < 1)) return NaN;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  const ph = 1 - pl;
  let q: number, r: number;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= ph) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

export const num = (v: string | number | null | undefined): number =>
  v === '' || v === null || v === undefined ? NaN : Number(v);

export const fmt = (v: number, d = 0): string =>
  Number.isFinite(v)
    ? v.toLocaleString('pt-BR', { maximumFractionDigits: d, minimumFractionDigits: d })
    : '—';

export const daysToWD = (d: number): string => {
  if (!Number.isFinite(d) || d < 0) return '—';
  const w = Math.floor(d / 7);
  const dd = Math.round(d % 7);
  return `${w}s ${dd}d`;
};
