/* =========================================================================
   Verificação por valores-âncora das funções clínicas puras.
   NÃO é importado pela página em produção. Rodar com:
     npx tsx app/plantao/data/checks.run.ts
   ========================================================================= */
import { erf, normCdf, normInv } from './stats';
import { hadlockEfwFromBiometry } from './efw/hadlockFormula';
import { hadlock1991 } from './efw/hadlock1991';
import { fmf2018 } from './efw/fmf2018';
import { PI_UA, PI_MCA, PI_CPR, PI_UTA, deriveStageFlags } from './doppler';

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

  // --- Doppler Ciobanu 2019 (Tabela 2) ---
  // exatidão do percentil (centis publicados reproduzem o centil nominal ±~0,1)
  const uaMed = PI_UA.percentile(0.965, 227); // p50 a 32s = 0,965
  ck('AU: p50 (0,965 @32s) → ~p50', !!uaMed && approx(uaMed.p, 50, 1), uaMed ? `p${uaMed.p.toFixed(1)}` : 'null');
  const uaP95 = PI_UA.percentile(1.553, 143); // p95 publicado a 20s
  ck('AU: 1,553 @20s → ~p95', !!uaP95 && approx(uaP95.p, 95, 1), uaP95 ? `p${uaP95.p.toFixed(1)}` : 'null');
  const mcaP5 = PI_MCA.percentile(1.162, 143); // p5 publicado a 20s
  ck('ACM: 1,162 @20s → ~p5', !!mcaP5 && approx(mcaP5.p, 5, 1), mcaP5 ? `p${mcaP5.p.toFixed(1)}` : 'null');
  const cprMed = PI_CPR.percentile(1.988, 227); // p50 a 32s
  ck('RCP: 1,988 @32s → ~p50', !!cprMed && approx(cprMed.p, 50, 1), cprMed ? `p${cprMed.p.toFixed(1)}` : 'null');
  const cprP5 = PI_CPR.percentile(0.872, 143); // p5 publicado a 20s
  ck('RCP: 0,872 @20s → ~p5', !!cprP5 && approx(cprP5.p, 5, 1.5), cprP5 ? `p${cprP5.p.toFixed(1)}` : 'null');
  ck('AU: fora de faixa (18s) → null', PI_UA.percentile(1.0, 126) === null, 'null esperado');

  // flag "anormal" com valores claramente na zona patológica
  const uaHi = PI_UA.percentile(1.65, 143); // > p95
  ck('AU: 1,65 @20s → anormal (>p95)', !!uaHi && uaHi.abnormal && uaHi.p > 95, uaHi ? `p${uaHi.p.toFixed(1)}` : 'null');
  const mcaLo = PI_MCA.percentile(1.1, 143); // < p5 (brain sparing)
  ck('ACM: 1,10 @20s → anormal (<p5)', !!mcaLo && mcaLo.abnormal && mcaLo.p < 5, mcaLo ? `p${mcaLo.p.toFixed(1)}` : 'null');
  const cprLo = PI_CPR.percentile(0.8, 143); // < p5
  ck('RCP: 0,80 @20s → anormal (<p5)', !!cprLo && cprLo.abnormal && cprLo.p < 5, cprLo ? `p${cprLo.p.toFixed(1)}` : 'null');

  // --- Doppler uterinas Gómez 2008 ---
  // média do modelo a 11s/34s → ~p50 (centil publicado é arredondado a 2 casas)
  const uta11 = PI_UTA.percentile(1.79, 77);
  ck('Uterinas: 1,79 @11s → ~p50', !!uta11 && approx(uta11.p, 50, 2), uta11 ? `p${uta11.p.toFixed(1)}` : 'null');
  const utaHi = PI_UTA.percentile(2.9, 77); // > p95 (publicado 2,70)
  ck('Uterinas: 2,90 @11s → anormal (>p95)', !!utaHi && utaHi.abnormal && utaHi.p > 95, utaHi ? `p${utaHi.p.toFixed(1)}` : 'null');
  ck('Uterinas: aproximação sinalizada', !!uta11 && uta11.approximate, 'approximate=true');

  // --- deriveStageFlags ---
  const flags = deriveStageFlags({ ua: 1.65, mca: 1.1, cpr: 0.8, uta: 2.9 }, 143);
  ck('deriveStageFlags: todos anormais @20s', flags.uaP95 === true && flags.mcaP5 === true && flags.cprP5 === true && flags.utaP95 === true, JSON.stringify(flags));
  const flagsNorm = deriveStageFlags({ ua: 0.965, mca: 1.915, cpr: 1.988, uta: 0.7 }, 227);
  ck('deriveStageFlags: normais → todos false', flagsNorm.uaP95 === false && flagsNorm.cprP5 === false && flagsNorm.utaP95 === false, JSON.stringify(flagsNorm));

  return out;
}
