/* =========================================================================
   Verificação por valores-âncora das funções clínicas puras.
   NÃO é importado pela página em produção. Rodar com:
     npx tsx app/plantao/data/checks.run.ts
   ========================================================================= */
import { erf, normCdf, normInv } from './stats';
import { hadlockEfwFromBiometry } from './efw/hadlockFormula';
import { hadlock1991 } from './efw/hadlock1991';
import { fmf2018 } from './efw/fmf2018';

export interface Check {
  name: string;
  pass: boolean;
  detail: string;
}

const approx = (a: number, b: number, tol: number): boolean =>
  Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;

export function runChecks(): Check[] {
  const out: Check[] = [];
  const ck = (name: string, pass: boolean, detail: string) => out.push({ name, pass, detail });

  // --- estatística ---
  ck('erf(0)=0', approx(erf(0), 0, 1e-6), `${erf(0)}`);
  ck('normCdf(0)=0.5', approx(normCdf(0), 0.5, 1e-6), `${normCdf(0)}`);
  ck('normCdf(1.645)≈0.95', approx(normCdf(1.645), 0.95, 1e-3), `${normCdf(1.645)}`);
  ck('normInv(0.5)≈0', approx(normInv(0.5), 0, 1e-6), `${normInv(0.5)}`);
  ck('normInv↔normCdf round-trip (z=1.2)', approx(normInv(normCdf(1.2)), 1.2, 1e-4), `${normInv(normCdf(1.2))}`);

  // --- Hadlock fórmula: exemplo (BPD 9.0, HC 32.0, AC 30.0, FL 6.5 cm) ---
  const efw = hadlockEfwFromBiometry(9.0, 32.0, 30.0, 6.5);
  ck('hadlockEfwFromBiometry plausível (~2000–3500 g)', efw > 2000 && efw < 3500, `${efw.toFixed(0)} g`);

  // --- Hadlock 1991 percentil: peso = mediana → ~p50 ---
  const hMed = hadlock1991.percentile(3028, 37 * 7, 'unknown'); // mediana 37s ≈ 3028 g
  ck('Hadlock: mediana 37s → ~p50', !!hMed && approx(hMed.p, 50, 2), hMed ? `p${hMed.p.toFixed(1)}` : 'null');
  ck('Hadlock: fora de faixa (8s) → null', hadlock1991.percentile(50, 56, 'unknown') === null, 'null esperado');

  // --- FMF 2018: mediana fisiológica e p50 ---
  const fmf40 = fmf2018.percentile(3459, 280, 'unknown'); // mediana ≈ 3459 g a 40s
  ck('FMF: mediana 40s → ~p50', !!fmf40 && approx(fmf40.p, 50, 2), fmf40 ? `p${fmf40.p.toFixed(1)}` : 'null');
  const fmf20 = fmf2018.percentile(321, 140, 'unknown'); // mediana ≈ 321 g a 20s
  ck('FMF: mediana 20s → ~p50', !!fmf20 && approx(fmf20.p, 50, 3), fmf20 ? `p${fmf20.p.toFixed(1)}` : 'null');
  ck('FMF: fora de faixa (18s) → null', fmf2018.percentile(200, 126, 'unknown') === null, 'null esperado');
  // peso baixo p/ a IG cai na cauda inferior
  const fmfLow = fmf2018.percentile(2200, 280, 'unknown');
  ck('FMF: 2200 g a 40s → < p3', !!fmfLow && fmfLow.p < 3, fmfLow ? `p${fmfLow.p.toFixed(1)}` : 'null');

  return out;
}
