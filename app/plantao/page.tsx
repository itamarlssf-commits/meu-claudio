'use client';

import React, { useMemo, useState } from 'react';
import { num, fmt, daysToWD } from './data/stats';
import { type FetalSex, type GrowthClass } from './data/types';
import { EFW_REFERENCES, BARCELONA_CALC_URL } from './data/efw';
import { hadlockEfwFromBiometry } from './data/efw/hadlockFormula';

/* =========================================================================
   PLANTÃO OBSTÉTRICO — ferramentas de bolso
   Rota standalone (/plantao). Offline. Nenhum dado de paciente é salvo
   ou enviado. Métodos e referências na aba Métodos.
   ========================================================================= */

// ---------- paleta ----------
const C = {
  ink: '#0B2027',
  petrol: '#0E4B5A',
  petrolDeep: '#08313B',
  teal: '#1B7F8C',
  mist: '#EAF1F2',
  paper: '#F7FAFA',
  line: '#D3E0E2',
  amber: '#C8821A',
  amberSoft: '#F4E2C2',
  good: '#2E7D5B',
  goodSoft: '#DCEFE5',
  warn: '#C46A12',
  high: '#C0491F',
  crit: '#9B2226',
  white: '#FFFFFF',
  sub: '#5A6E72',
};

// ---------- helpers de data (timezone-safe, sempre horário LOCAL) ----------
const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * 86400000);
const toISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
const parseDate = (s: string): Date | null => (s ? new Date(s + 'T00:00:00') : null);
const diffDays = (a: Date, b: Date): number => Math.round((a.getTime() - b.getTime()) / 86400000);
const fmtDateBR = (date: Date): string =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// =========================================================================
type TabId = 'ig' | 'peso' | 'dop' | 'rcf' | 'met';

export default function PlantaoPage() {
  const [tab, setTab] = useState<TabId>('ig');
  // IG compartilhada (em dias) p/ peso e estadiamento — calculada na aba IG
  const [gaDays, setGaDays] = useState<number>(NaN);
  const [gaSource, setGaSource] = useState<string>('');
  // sexo fetal compartilhado (usado nas curvas sexo-específicas)
  const [sex, setSex] = useState<FetalSex>('unknown');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'ig', label: 'IG / DPP' },
    { id: 'peso', label: 'Peso fetal' },
    { id: 'dop', label: 'Doppler' },
    { id: 'rcf', label: 'RCF' },
    { id: 'met', label: 'Métodos' },
  ];

  return (
    <div style={S.app}>
      <style>{globalCss}</style>
      <header style={S.header}>
        <div style={S.brandRow}>
          <Mark />
          <div>
            <div style={S.brandTitle}>Plantão Obstétrico</div>
            <div style={S.brandSub}>ferramentas de bolso · offline</div>
          </div>
        </div>
        {Number.isFinite(gaDays) && (
          <div style={S.gaPill} title={gaSource}>
            <span style={S.gaPillLabel}>IG atual</span>
            <span style={S.gaPillVal}>{daysToWD(gaDays)}</span>
          </div>
        )}
      </header>

      <main style={S.main}>
        {tab === 'ig' && <TabIG setGaDays={setGaDays} setGaSource={setGaSource} />}
        {tab === 'peso' && <TabPeso gaDays={gaDays} sex={sex} setSex={setSex} />}
        {tab === 'dop' && <TabDoppler />}
        {tab === 'rcf' && <TabRCF />}
        {tab === 'met' && <TabMetodos />}
      </main>

      <nav style={S.nav}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ ...S.navBtn, ...(tab === t.id ? S.navBtnOn : {}) }}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// =========================================================================
// ABA 1 — IG / DPP
// =========================================================================
type IGResult =
  | { ok: false; err: string }
  | { ok: true; gaDays: number; dpp: Date; src: string };

function TabIG({
  setGaDays,
  setGaSource,
}: {
  setGaDays: (d: number) => void;
  setGaSource: (s: string) => void;
}) {
  const [mode, setMode] = useState<'dum' | 'usg' | 'crl'>('dum');
  const today = toISO(new Date());

  const [dum, setDum] = useState('');
  const [usgDate, setUsgDate] = useState('');
  const [usgW, setUsgW] = useState('');
  const [usgD, setUsgD] = useState('');
  const [crl, setCrl] = useState('');
  const [crlDate, setCrlDate] = useState(today);

  const res: IGResult | null = useMemo(() => {
    const now = parseDate(today)!;
    if (mode === 'dum') {
      const d = parseDate(dum);
      if (!d) return null;
      const ga = diffDays(now, d);
      if (ga < 0 || ga > 320) return { ok: false, err: 'DUM fora da faixa (0–45 semanas).' };
      return { ok: true, gaDays: ga, dpp: addDays(d, 280), src: 'DUM (Naegele)' };
    }
    if (mode === 'usg') {
      const d = parseDate(usgDate);
      const w = num(usgW);
      const dd = num(usgD);
      if (!d || !Number.isFinite(w)) return null;
      const gaAtUsg = w * 7 + (Number.isFinite(dd) ? dd : 0);
      const ga = gaAtUsg + diffDays(now, d);
      if (ga < 0 || ga > 320) return { ok: false, err: 'Datas inconsistentes.' };
      const dpp = addDays(d, 280 - gaAtUsg);
      return { ok: true, gaDays: ga, dpp, src: 'USG prévia (carry-forward)' };
    }
    // CCN — Robinson & Fleming 1975 (com fator de calibração 1,037)
    const mm = num(crl);
    const d = parseDate(crlDate);
    if (!Number.isFinite(mm) || !d) return null;
    if (mm < 10 || mm > 84) return { ok: false, err: 'CCN válido entre 10–84 mm.' };
    const gaAtCrl = 8.052 * Math.sqrt(1.037 * mm) + 23.73; // dias
    const ga = gaAtCrl + diffDays(now, d);
    const dpp = addDays(d, 280 - gaAtCrl);
    return { ok: true, gaDays: ga, dpp, src: 'CCN (Robinson-Fleming)' };
  }, [mode, dum, usgDate, usgW, usgD, crl, crlDate, today]);

  // empurra IG p/ estado global (usado nas abas Peso e RCF)
  React.useEffect(() => {
    if (res && res.ok && Number.isFinite(res.gaDays)) {
      setGaDays(res.gaDays);
      setGaSource(res.src);
    }
  }, [res, setGaDays, setGaSource]);

  return (
    <div>
      <SegRow
        value={mode}
        onChange={(v) => setMode(v as typeof mode)}
        opts={[
          { id: 'dum', label: 'DUM' },
          { id: 'usg', label: 'USG prévia' },
          { id: 'crl', label: 'CCN' },
        ]}
      />

      <Card>
        {mode === 'dum' && (
          <Field label="Data da última menstruação">
            <input type="date" value={dum} max={today} onChange={(e) => setDum(e.target.value)} style={S.input} />
          </Field>
        )}

        {mode === 'usg' && (
          <>
            <Field label="Data da USG">
              <input type="date" value={usgDate} max={today} onChange={(e) => setUsgDate(e.target.value)} style={S.input} />
            </Field>
            <Row>
              <Field label="Semanas na USG">
                <input type="number" inputMode="numeric" value={usgW} onChange={(e) => setUsgW(e.target.value)} style={S.input} placeholder="ex. 12" />
              </Field>
              <Field label="Dias">
                <input type="number" inputMode="numeric" value={usgD} onChange={(e) => setUsgD(e.target.value)} style={S.input} placeholder="0–6" />
              </Field>
            </Row>
          </>
        )}

        {mode === 'crl' && (
          <>
            <Field label="CCN (mm)">
              <input type="number" inputMode="decimal" value={crl} onChange={(e) => setCrl(e.target.value)} style={S.input} placeholder="10–84" />
            </Field>
            <Field label="Data da medida">
              <input type="date" value={crlDate} max={today} onChange={(e) => setCrlDate(e.target.value)} style={S.input} />
            </Field>
          </>
        )}
      </Card>

      {res && !res.ok && <Note tone="warn">{res.err}</Note>}

      {res && res.ok && (
        <div style={S.resultGrid}>
          <Stat big label="Idade gestacional" value={daysToWD(res.gaDays)} sub={`${res.gaDays} dias`} />
          <Stat label="DPP" value={fmtDateBR(res.dpp)} />
          <Stat
            label="Trimestre"
            value={res.gaDays < 14 * 7 ? '1º' : res.gaDays < 28 * 7 ? '2º' : '3º'}
          />
          <Stat label="Método" value={res.src} small />
        </div>
      )}

      <Note>Define a IG usada nas abas Peso e RCF. USG do 1º trimestre tem prioridade sobre a DUM.</Note>
    </div>
  );
}

// =========================================================================
// ABA 2 — Peso fetal: percentil em múltiplas referências
// =========================================================================
const SEX_OPTS = [
  { id: 'unknown', label: 'Não inf.' },
  { id: 'male', label: 'Masc.' },
  { id: 'female', label: 'Fem.' },
];

const toneColor = (t: ToneOrEmpty): string =>
  t === 'good' ? C.good : t === 'warn' ? C.warn : t === 'high' ? C.high : C.ink;

const classToTone = (c: GrowthClass): ToneOrEmpty =>
  c === 'severe-sga' ? 'high' : c === 'sga' || c === 'lga' ? 'warn' : 'good';

const classLabel = (c: GrowthClass): string =>
  c === 'severe-sga' ? '< p3' : c === 'sga' ? 'p3–p10' : c === 'lga' ? '> p90' : 'AIG';

function TabPeso({
  gaDays,
  sex,
  setSex,
}: {
  gaDays: number;
  sex: FetalSex;
  setSex: (s: FetalSex) => void;
}) {
  const [mode, setMode] = useState<'peso' | 'bio'>('peso');
  const [directW, setDirectW] = useState('');
  const [bpd, setBpd] = useState('');
  const [hc, setHc] = useState('');
  const [ac, setAc] = useState('');
  const [fl, setFl] = useState('');
  const [unit, setUnit] = useState<'mm' | 'cm'>('mm');
  const [manualW, setManualW] = useState('');
  const [manualD, setManualD] = useState('');

  const k = unit === 'mm' ? 0.1 : 1; // converte p/ cm (Hadlock exige cm)

  const efw = useMemo(() => {
    if (mode === 'peso') return num(directW);
    return hadlockEfwFromBiometry(num(bpd) * k, num(hc) * k, num(ac) * k, num(fl) * k);
  }, [mode, directW, bpd, hc, ac, fl, k]);

  // IG usada: manual se preenchida, senão a da aba IG
  const gaUsedDays = useMemo(() => {
    const w = num(manualW);
    if (Number.isFinite(w)) return w * 7 + (Number.isFinite(num(manualD)) ? num(manualD) : 0);
    return gaDays;
  }, [manualW, manualD, gaDays]);

  const results = useMemo(
    () => EFW_REFERENCES.map((ref) => ({ ref, res: ref.percentile(efw, gaUsedDays, sex) })),
    [efw, gaUsedDays, sex]
  );

  return (
    <div>
      <SegRow
        value={mode}
        onChange={(v) => setMode(v as typeof mode)}
        opts={[
          { id: 'peso', label: 'Peso direto' },
          { id: 'bio', label: 'Por biometria' },
        ]}
      />

      <Card>
        {mode === 'peso' ? (
          <Field label="Peso fetal estimado (g)">
            <input type="number" inputMode="numeric" value={directW} onChange={(e) => setDirectW(e.target.value)} style={S.input} placeholder="ex. 2500" />
          </Field>
        ) : (
          <>
            <SegRow
              value={unit}
              onChange={(v) => setUnit(v as typeof unit)}
              opts={[
                { id: 'mm', label: 'mm' },
                { id: 'cm', label: 'cm' },
              ]}
              tight
            />
            <Row>
              <Field label={`DBP (${unit})`}>
                <input type="number" inputMode="decimal" value={bpd} onChange={(e) => setBpd(e.target.value)} style={S.input} />
              </Field>
              <Field label={`CC / HC (${unit})`}>
                <input type="number" inputMode="decimal" value={hc} onChange={(e) => setHc(e.target.value)} style={S.input} />
              </Field>
            </Row>
            <Row>
              <Field label={`CA / AC (${unit})`}>
                <input type="number" inputMode="decimal" value={ac} onChange={(e) => setAc(e.target.value)} style={S.input} />
              </Field>
              <Field label={`CF / FL (${unit})`}>
                <input type="number" inputMode="decimal" value={fl} onChange={(e) => setFl(e.target.value)} style={S.input} />
              </Field>
            </Row>
          </>
        )}
      </Card>

      <Card>
        <div style={S.cardLabel}>Sexo fetal</div>
        <SegRow value={sex} onChange={(v) => setSex(v as FetalSex)} opts={SEX_OPTS} tight />
        <div style={S.subtle}>
          Só altera o percentil em curvas sexo-específicas (Barcelona). Hadlock e FMF são populacionais.
        </div>
      </Card>

      <Stat
        big
        label="Peso fetal estimado"
        value={Number.isFinite(efw) ? `${fmt(efw)} g` : '—'}
        sub={mode === 'bio' ? 'Hadlock 4 parâmetros' : 'inserido manualmente'}
      />

      <div style={S.refGrid}>
        {results.map(({ ref, res }) => (
          <div key={ref.id} style={S.refCard}>
            <div style={S.refName}>{ref.shortLabel}</div>
            {res ? (
              <>
                <div style={{ ...S.refP, color: toneColor(classToTone(res.classification)) }}>p{fmt(res.p)}</div>
                <div style={S.refClass}>{classLabel(res.classification)}</div>
                {res.median != null && Number.isFinite(efw) && (
                  <div style={S.refMed}>{fmt((efw / res.median) * 100)}% da mediana</div>
                )}
              </>
            ) : (
              <div style={S.refNa}>fora de faixa</div>
            )}
          </div>
        ))}

        <a href={BARCELONA_CALC_URL} target="_blank" rel="noopener noreferrer" style={S.refCardLink}>
          <div style={S.refName}>Barcelona</div>
          <div style={S.refLinkText}>abrir calculadora ↗</div>
          <div style={S.refMed}>customizada (Figueras) · usa dados maternos</div>
        </a>
      </div>

      {!Number.isFinite(gaUsedDays) && Number.isFinite(efw) && (
        <Note tone="warn">Defina a IG (aba IG/DPP) ou abaixo para calcular o percentil.</Note>
      )}

      <Card>
        <div style={S.cardLabel}>IG para o percentil</div>
        <div style={S.subtle}>
          {Number.isFinite(gaDays) ? `Usando IG da aba: ${daysToWD(gaDays)}. ` : 'Sem IG definida. '}
          Sobrescrever (opcional):
        </div>
        <Row>
          <Field label="Semanas">
            <input type="number" inputMode="numeric" value={manualW} onChange={(e) => setManualW(e.target.value)} style={S.input} placeholder="—" />
          </Field>
          <Field label="Dias">
            <input type="number" inputMode="numeric" value={manualD} onChange={(e) => setManualD(e.target.value)} style={S.input} placeholder="0–6" />
          </Field>
        </Row>
      </Card>

      <Note>
        Mesmo peso comparado em referências distintas. Hadlock 1991 e FMF (Nicolaides 2018) são
        populacionais e calculados aqui; a Barcelona (Figueras customizada) depende de dados maternos
        e abre na calculadora oficial. Percentil de Hadlock por aproximação log-normal. Ver Métodos.
      </Note>
    </div>
  );
}

// =========================================================================
// ABA 3 — Doppler
// =========================================================================
function TabDoppler() {
  const [uaPI, setUaPI] = useState('');
  const [mcaPI, setMcaPI] = useState('');
  const [utaR, setUtaR] = useState('');
  const [utaL, setUtaL] = useState('');

  const cpr = useMemo(() => {
    const a = num(mcaPI);
    const b = num(uaPI);
    return Number.isFinite(a) && Number.isFinite(b) && b !== 0 ? a / b : NaN;
  }, [mcaPI, uaPI]);
  const ucr = Number.isFinite(cpr) ? 1 / cpr : NaN; // razão umbilicocerebral
  const utaMean = useMemo(() => {
    const r = num(utaR);
    const l = num(utaL);
    const xs = [r, l].filter(Number.isFinite);
    return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : NaN;
  }, [utaR, utaL]);

  return (
    <div>
      <Card>
        <div style={S.cardLabel}>Índices de pulsatilidade (IP)</div>
        <Row>
          <Field label="Art. umbilical (AU)">
            <input type="number" inputMode="decimal" value={uaPI} onChange={(e) => setUaPI(e.target.value)} style={S.input} placeholder="IP" />
          </Field>
          <Field label="Art. cerebral média (ACM)">
            <input type="number" inputMode="decimal" value={mcaPI} onChange={(e) => setMcaPI(e.target.value)} style={S.input} placeholder="IP" />
          </Field>
        </Row>
        <Row>
          <Field label="Art. uterina D">
            <input type="number" inputMode="decimal" value={utaR} onChange={(e) => setUtaR(e.target.value)} style={S.input} placeholder="IP" />
          </Field>
          <Field label="Art. uterina E">
            <input type="number" inputMode="decimal" value={utaL} onChange={(e) => setUtaL(e.target.value)} style={S.input} placeholder="IP" />
          </Field>
        </Row>
      </Card>

      <div style={S.resultGrid}>
        <Stat big label="RCP (ACM / AU)" value={Number.isFinite(cpr) ? fmt(cpr, 2) : '—'} sub="razão cerebroplacentária" />
        <Stat label="RUC (AU / ACM)" value={Number.isFinite(ucr) ? fmt(ucr, 2) : '—'} />
        <Stat label="IP uterina médio" value={Number.isFinite(utaMean) ? fmt(utaMean, 2) : '—'} />
      </div>

      <Note>
        Cálculos exatos (sem tabela). RCP/RUC e IP médio prontos. Para classificar percentil (p5/p95) por IG,
        use os limiares na aba RCF — assim funciona o protocolo de estadiamento.
      </Note>
    </div>
  );
}

// =========================================================================
// ABA 4 — RCF (estadiamento Barcelona — Figueras & Gratacós 2014)
// =========================================================================
type StageKey = 0 | 1 | 2 | 3 | 4 | 'sga';
interface StageInfo {
  tag: string;
  title: string;
  parto: string;
  vigilancia: string;
  color: string;
  bg: string;
}

const STAGE_DATA: Record<StageKey, StageInfo> = {
  0: {
    tag: 'Sem restrição',
    title: 'Crescimento adequado',
    parto: 'A termo, conforme indicação obstétrica',
    vigilancia: 'Rotina pré-natal habitual',
    color: C.good,
    bg: C.goodSoft,
  },
  sga: {
    tag: 'PIG',
    title: 'Pequeno para a idade gestacional (Doppler normal)',
    parto: '37–40 sem; parto vaginal não contraindicado',
    vigilancia: 'Doppler + biometria a cada 2–3 semanas',
    color: C.teal,
    bg: C.mist,
  },
  1: {
    tag: 'Estágio I',
    title: 'RCF — pequenez grave ou insuficiência placentária leve',
    parto: '~ 37 sem; indução possível',
    vigilancia: 'Doppler 1×/semana; confirmar limiares em 2 medidas (≥12 h)',
    color: C.warn,
    bg: C.amberSoft,
  },
  2: {
    tag: 'Estágio II',
    title: 'RCF — diástole zero na AU (AEDV)',
    parto: '~ 34 sem; cesárea',
    vigilancia: 'Doppler 2–3×/semana; corticoide para maturação',
    color: C.high,
    bg: '#F6DEC9',
  },
  3: {
    tag: 'Estágio III',
    title: 'RCF — diástole reversa na AU ou ducto venoso alterado',
    parto: '~ 30 sem; cesárea',
    vigilancia: 'Doppler + CTG em dias alternados/diário; centro terciário',
    color: C.crit,
    bg: '#F3D2CF',
  },
  4: {
    tag: 'Estágio IV',
    title: 'RCF — sofrimento fetal (CTG anormal / STV < 3 ms)',
    parto: 'A partir da viabilidade (~26–30 sem); cesárea',
    vigilancia: 'Internação; cardiotoco contínua; corticoide + neuroproteção; centro terciário',
    color: C.crit,
    bg: '#EFC9C7',
  },
};

function TabRCF() {
  const [efwClass, setEfwClass] = useState<'' | '>=p10' | 'p3-p10' | '<p3'>('');
  // Doppler — limiares de estágio I
  const [uaP95, setUaP95] = useState(false);
  const [mcaP5, setMcaP5] = useState(false);
  const [cprP5, setCprP5] = useState(false);
  const [utaP95, setUtaP95] = useState(false);
  // AU diástole final
  const [edf, setEdf] = useState<'presente' | 'ausente' | 'reverso'>('presente');
  // Ducto venoso
  const [dvP95, setDvP95] = useState(false);
  const [dvAwave, setDvAwave] = useState<'positiva' | 'ausente' | 'reversa'>('positiva');
  // Bem-estar fetal
  const [ctg, setCtg] = useState<'normal' | 'desacel'>('normal');
  const [stv3, setStv3] = useState(false);

  const result = useMemo<(StageInfo & { stage: StageKey }) | null>(() => {
    if (efwClass === '') return null;

    const anyStage1Doppler = uaP95 || mcaP5 || cprP5 || utaP95;
    const allNormal =
      !anyStage1Doppler &&
      edf === 'presente' &&
      !dvP95 &&
      dvAwave === 'positiva' &&
      ctg === 'normal' &&
      !stv3;

    // sem restrição
    if (efwClass === '>=p10' && allNormal) return { stage: 0, ...STAGE_DATA[0] };
    // PIG: p3–p10 com Doppler normal
    if (efwClass === 'p3-p10' && allNormal) return { stage: 'sga', ...STAGE_DATA.sga };

    // Estágio IV — endpoint de acidose: CTG anormal / STV < 3 ms
    if (ctg === 'desacel' || stv3) return { stage: 4, ...STAGE_DATA[4] };
    // Estágio III — diástole reversa AU, OU IP-DV > p95, OU onda a ausente/reversa
    if (edf === 'reverso' || dvP95 || dvAwave === 'ausente' || dvAwave === 'reversa')
      return { stage: 3, ...STAGE_DATA[3] };
    // Estágio II — diástole zero na AU
    if (edf === 'ausente') return { stage: 2, ...STAGE_DATA[2] };
    // Estágio I — EFW < p3 OU qualquer Doppler de estágio I alterado
    if (efwClass === '<p3' || anyStage1Doppler) return { stage: 1, ...STAGE_DATA[1] };

    // p3–p10 com algo limítrofe → PIG
    return { stage: 'sga', ...STAGE_DATA.sga };
  }, [efwClass, uaP95, mcaP5, cprP5, utaP95, edf, dvP95, dvAwave, ctg, stv3]);

  return (
    <div>
      <Card>
        <div style={S.cardLabel}>Peso fetal estimado</div>
        <SegRow
          value={efwClass}
          onChange={(v) => setEfwClass(v as typeof efwClass)}
          opts={[
            { id: '>=p10', label: '≥ p10' },
            { id: 'p3-p10', label: 'p3–p10' },
            { id: '<p3', label: '< p3' },
          ]}
          tight
        />
      </Card>

      <Card>
        <div style={S.cardLabel}>Doppler — limiares (estágio I)</div>
        <Toggle on={uaP95} set={setUaP95} label="IP AU > p95" />
        <Toggle on={mcaP5} set={setMcaP5} label="IP ACM < p5" />
        <Toggle on={cprP5} set={setCprP5} label="RCP < p5" />
        <Toggle on={utaP95} set={setUtaP95} label="IP uterina médio > p95" />
      </Card>

      <Card>
        <div style={S.cardLabel}>Fluxo diastólico umbilical (AU)</div>
        <SegRow
          value={edf}
          onChange={(v) => setEdf(v as typeof edf)}
          opts={[
            { id: 'presente', label: 'Presente' },
            { id: 'ausente', label: 'Ausente' },
            { id: 'reverso', label: 'Reverso' },
          ]}
          tight
        />
      </Card>

      <Card>
        <div style={S.cardLabel}>Ducto venoso</div>
        <Toggle on={dvP95} set={setDvP95} label="IP-DV > p95" />
        <div style={{ height: 8 }} />
        <div style={S.subtle}>Onda a:</div>
        <SegRow
          value={dvAwave}
          onChange={(v) => setDvAwave(v as typeof dvAwave)}
          opts={[
            { id: 'positiva', label: 'Positiva' },
            { id: 'ausente', label: 'Ausente' },
            { id: 'reversa', label: 'Reversa' },
          ]}
          tight
        />
      </Card>

      <Card>
        <div style={S.cardLabel}>Bem-estar fetal (CTG)</div>
        <SegRow
          value={ctg}
          onChange={(v) => setCtg(v as typeof ctg)}
          opts={[
            { id: 'normal', label: 'Normal' },
            { id: 'desacel', label: 'Desacel. recorrentes' },
          ]}
          tight
        />
        <div style={{ height: 8 }} />
        <Toggle on={stv3} set={setStv3} label="STV < 3 ms (cCTG)" />
      </Card>

      {result == null && <Note>Selecione a classe de peso fetal para estadiar.</Note>}

      {result && (
        <div style={{ ...S.stageBox, borderColor: result.color, background: result.bg }}>
          <div style={{ ...S.stageTag, background: result.color }}>{result.tag}</div>
          <div style={S.stageTitle}>{result.title}</div>
          <div style={S.stageRow}>
            <span style={S.stageK}>Parto</span>
            <span style={S.stageV}>{result.parto}</span>
          </div>
          <div style={S.stageRow}>
            <span style={S.stageK}>Vigilância</span>
            <span style={S.stageV}>{result.vigilancia}</span>
          </div>
        </div>
      )}

      <Note tone="warn">
        Limiares anormais (AU/DV/RCP) devem ser confirmados em duas medidas com pelo menos 12 h de
        intervalo. Os tempos de parto são orientativos — sempre individualizar.
      </Note>
    </div>
  );
}

// =========================================================================
// ABA 5 — Métodos / referências
// =========================================================================
function TabMetodos() {
  return (
    <div>
      <Note tone="warn">
        Ferramenta de apoio à decisão. Não substitui o julgamento clínico, a avaliação
        individual nem o protocolo da instituição. Confira sempre os valores antes de aplicar.
      </Note>

      <Card>
        <div style={S.cardLabel}>IG / DPP</div>
        <Method
          title="DUM — regra de Naegele"
          body="DPP = DUM + 280 dias. IG = dias entre hoje e a DUM. Datas tratadas em horário local para evitar erro de ±1 dia."
        />
        <Method
          title="USG prévia (carry-forward)"
          body="A IG informada na USG é projetada para hoje somando os dias decorridos. USG do 1º trimestre tem prioridade sobre a DUM."
        />
        <Method
          title="CCN — Robinson & Fleming 1975"
          body="IG (dias) = 8,052 × √(1,037 × CCN) + 23,73, com CCN em mm. Usa-se o fator de calibração 1,037 da equação original. Faixa aplicada: 10–84 mm (a curva publicada vai de ~5–84 mm). Acima de 84 mm, datar por biometria."
          cite="Robinson HP, Fleming JEE. BJOG. 1975;82(9):702–710."
        />
      </Card>

      <Card>
        <div style={S.cardLabel}>Peso fetal estimado</div>
        <Method
          title="Hadlock — 4 parâmetros (DBP, CC, CA, CF)"
          body="log10(PFE) = 1,3596 − 0,00386·CA·CF + 0,0064·CC + 0,00061·DBP·CA + 0,0424·CA + 0,174·CF. Todas as medidas em centímetros; PFE em gramas. Erro ~1 DP = 7,5%."
          cite="Hadlock FP et al. Am J Obstet Gynecol. 1985;151(3):333–337."
        />
        <Method
          title="Percentil — Hadlock 1991 (aproximação log-normal)"
          body={`Sobre a mediana de Hadlock 1991, percentil = Φ((ln PFE − ln mediana) / σ), com σ = √(ln(1+CV²)) ≈ 0,124 para CV = 12,5%. Cálculo na escala log porque o peso fetal é log-normal. O CV não é constante ao longo da gestação — é uma aproximação. Não é sexo-específica.`}
          cite="Hadlock FP et al. Radiology. 1991;181(1):129–133."
        />
        <Method
          title="Percentil — FMF 2018 (Nicolaides)"
          body="Carta de peso fetal populacional. PFE estimado por Hadlock; percentil pela distribuição log10-gaussiana da FMF: média de log10(PFE) por polinômio cúbico na IG e DP linear na IG (20 a <43 sem). Equação conferida contra a implementação open-source FetalGPSR e por âncoras fisiológicas (mediana ≈ 321 g a 20 sem, ≈ 3459 g a 40 sem). Não é sexo-específica."
          cite="Nicolaides KH et al. Ultrasound Obstet Gynecol. 2018;52(1):44–51."
        />
        <Method
          title="Percentil — Barcelona (Figueras customizada)"
          body="Padrão customizado (peso/altura maternos, paridade, etnia + sexo fetal). Por depender de coeficientes não disponíveis offline e do modelo proprietário, o app não o reproduz internamente: abre a calculadora oficial fetalmedicinebarcelona.org/calc para conferência."
          cite="Figueras F et al. Eur J Obstet Gynecol Reprod Biol. 2008;136(1):20–24."
        />
      </Card>

      <Card>
        <div style={S.cardLabel}>Doppler</div>
        <Method
          title="Razões"
          body="RCP = IP ACM ÷ IP AU. RUC = IP AU ÷ IP ACM. IP uterino médio = média das artérias uterinas direita e esquerda. A classificação por percentil (p5/p95) por IG é feita na aba RCF."
        />
      </Card>

      <Card>
        <div style={S.cardLabel}>Estadiamento da RCF (Barcelona)</div>
        <Method
          title="Protocolo por estágios"
          body="PIG: p3–p10 com Doppler normal — termo. Estágio I: PFE < p3, ou IP AU > p95, ou RCP < p5, ou IP ACM < p5, ou IP uterino médio > p95 — ~37 sem. Estágio II: diástole zero na AU — ~34 sem, cesárea. Estágio III: diástole reversa na AU, ou IP-DV > p95, ou onda a do DV ausente/reversa — ~30 sem, cesárea. Estágio IV: CTG anormal (desacelerações recorrentes ou STV < 3 ms) — a partir da viabilidade, cesárea em centro terciário."
          cite="Figueras F, Gratacós E. Fetal Diagn Ther. 2014;36(2):86–98. ISUOG Practice Guidelines (Lees C et al.). UOG. 2020."
        />
      </Card>

      <Note>Versão offline. Nenhum dado é salvo ou transmitido.</Note>
    </div>
  );
}

function Method({ title, body, cite }: { title: string; body: string; cite?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>{body}</div>
      {cite && <div style={{ fontSize: 11, color: C.teal, marginTop: 4, fontStyle: 'italic' }}>{cite}</div>}
    </div>
  );
}

// =========================================================================
// COMPONENTES DE UI (autocontidos)
// =========================================================================
type Tone = 'good' | 'warn' | 'high';
type ToneOrEmpty = Tone | '';

function Mark() {
  return (
    <div style={S.mark} aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21s-7-4.35-9.33-9.02C1.1 8.86 2.7 5.5 6 5.5c1.98 0 3.3 1.1 4 2.3.7-1.2 2.02-2.3 4-2.3 3.3 0 4.9 3.36 3.33 6.48C19 16.65 12 21 12 21z"
          stroke={C.white}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={S.card}>{children}</div>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={S.row}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={S.field}>
      <span style={S.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function SegRow({
  value,
  onChange,
  opts,
  tight,
}: {
  value: string;
  onChange: (v: string) => void;
  opts: { id: string; label: string }[];
  tight?: boolean;
}) {
  return (
    <div style={{ ...S.seg, ...(tight ? { marginBottom: 12 } : {}) }}>
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{ ...S.segBtn, ...(value === o.id ? S.segBtnOn : {}) }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => set(!on)} style={{ ...S.toggle, ...(on ? S.toggleOn : {}) }}>
      <span style={{ ...S.toggleDot, ...(on ? S.toggleDotOn : {}) }} />
      <span>{label}</span>
    </button>
  );
}

function Stat({
  label,
  value,
  sub,
  big,
  small,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  big?: boolean;
  small?: boolean;
  tone?: ToneOrEmpty;
}) {
  const toneColor = tone === 'good' ? C.good : tone === 'warn' ? C.warn : tone === 'high' ? C.high : C.ink;
  return (
    <div style={{ ...S.stat, ...(big ? S.statBig : {}) }}>
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statValue, ...(big ? { fontSize: 26 } : {}), ...(small ? { fontSize: 14 } : {}), color: toneColor }}>
        {value}
      </div>
      {sub && <div style={S.statSub}>{sub}</div>}
    </div>
  );
}

function Note({ children, tone }: { children: React.ReactNode; tone?: Tone }) {
  const bg = tone === 'warn' ? C.amberSoft : tone === 'high' ? '#F3D2CF' : C.mist;
  const col = tone === 'warn' ? C.warn : tone === 'high' ? C.crit : C.sub;
  return <div style={{ ...S.note, background: bg, color: col }}>{children}</div>;
}

// =========================================================================
// estilos
// =========================================================================
const S = {
  app: {
    maxWidth: 680,
    margin: '0 auto',
    minHeight: '100vh',
    background: C.paper,
    color: C.ink,
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 76,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 18px',
    background: `linear-gradient(135deg, ${C.petrol} 0%, ${C.petrolDeep} 100%)`,
    color: C.white,
    position: 'sticky',
    top: 0,
    zIndex: 5,
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: 11 },
  mark: {
    width: 38,
    height: 38,
    borderRadius: 11,
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandTitle: { fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' },
  brandSub: { fontSize: 11, opacity: 0.7, marginTop: 1 },
  gaPill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: '5px 11px',
  },
  gaPillLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.75 },
  gaPillVal: { fontSize: 15, fontWeight: 700 },
  main: { flex: 1, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    background: C.white,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    padding: 16,
    boxShadow: '0 1px 3px rgba(8,49,59,0.04)',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: C.teal,
    marginBottom: 12,
  },
  row: { display: 'flex', gap: 10 },
  field: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12, flex: 1 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: C.sub },
  input: {
    width: '100%',
    padding: '11px 12px',
    border: `1.5px solid ${C.line}`,
    borderRadius: 10,
    fontSize: 16,
    color: C.ink,
    background: C.white,
    outline: 'none',
    fontFamily: 'inherit',
  },
  seg: {
    display: 'flex',
    gap: 4,
    background: C.mist,
    padding: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  segBtn: {
    flex: 1,
    padding: '9px 6px',
    border: 'none',
    borderRadius: 9,
    background: 'transparent',
    color: C.sub,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  segBtnOn: { background: C.white, color: C.petrol, boxShadow: '0 1px 3px rgba(8,49,59,0.12)' },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 12px',
    border: `1.5px solid ${C.line}`,
    borderRadius: 10,
    background: C.white,
    color: C.sub,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginBottom: 7,
    textAlign: 'left',
  },
  toggleOn: { borderColor: C.teal, background: C.mist, color: C.petrolDeep },
  toggleDot: {
    width: 18,
    height: 18,
    borderRadius: 6,
    border: `1.5px solid ${C.line}`,
    background: C.white,
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  toggleDotOn: { background: C.teal, borderColor: C.teal },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
  },
  refGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
    marginTop: 10,
  },
  refCard: {
    background: C.white,
    border: `1px solid ${C.line}`,
    borderRadius: 12,
    padding: 14,
    textAlign: 'center',
  },
  refName: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: C.teal,
    marginBottom: 6,
  },
  refP: { fontSize: 23, fontWeight: 700, lineHeight: 1.1 },
  refClass: { fontSize: 12.5, fontWeight: 600, color: C.sub, marginTop: 2 },
  refMed: { fontSize: 11, color: C.sub, marginTop: 4, lineHeight: 1.35 },
  refNa: { fontSize: 13, color: C.sub, padding: '10px 0' },
  refCardLink: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: C.mist,
    border: `1px solid ${C.line}`,
    borderRadius: 12,
    padding: 14,
    textDecoration: 'none',
    color: C.petrol,
  },
  refLinkText: { fontSize: 15, fontWeight: 700, marginTop: 2 },
  stat: {
    background: C.white,
    border: `1px solid ${C.line}`,
    borderRadius: 12,
    padding: 14,
  },
  statBig: { gridColumn: '1 / -1', background: `linear-gradient(135deg, ${C.white}, ${C.mist})` },
  statLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: C.sub,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: 6,
  },
  statValue: { fontSize: 19, fontWeight: 700, color: C.ink, lineHeight: 1.15 },
  statSub: { fontSize: 11.5, color: C.sub, marginTop: 4 },
  note: {
    fontSize: 12.5,
    lineHeight: 1.5,
    padding: '11px 13px',
    borderRadius: 10,
    color: C.sub,
  },
  subtle: { fontSize: 12.5, color: C.sub, marginBottom: 8, lineHeight: 1.45 },
  stageBox: {
    border: '2px solid',
    borderRadius: 14,
    padding: 16,
  },
  stageTag: {
    display: 'inline-block',
    color: C.white,
    fontSize: 12,
    fontWeight: 700,
    padding: '3px 11px',
    borderRadius: 20,
    marginBottom: 9,
  },
  stageTitle: { fontSize: 15.5, fontWeight: 700, color: C.ink, marginBottom: 12, lineHeight: 1.3 },
  stageRow: {
    display: 'flex',
    gap: 10,
    padding: '8px 0',
    borderTop: `1px solid ${C.line}`,
  },
  stageK: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: C.sub,
    width: 78,
    flexShrink: 0,
    paddingTop: 1,
  },
  stageV: { fontSize: 13.5, color: C.ink, lineHeight: 1.4 },
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: 680,
    margin: '0 auto',
    display: 'flex',
    background: C.white,
    borderTop: `1px solid ${C.line}`,
    boxShadow: '0 -2px 12px rgba(8,49,59,0.06)',
    zIndex: 10,
  },
  navBtn: {
    flex: 1,
    padding: '13px 4px',
    border: 'none',
    background: 'transparent',
    color: C.sub,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    borderTop: '2px solid transparent',
  },
  navBtnOn: { color: C.petrol, borderTop: `2px solid ${C.petrol}` },
} satisfies Record<string, React.CSSProperties>;

const globalCss = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: ${C.paper}; }
  input:focus { border-color: ${C.teal} !important; box-shadow: 0 0 0 3px ${C.mist}; }
  button:active { transform: scale(0.985); }
  input[type=number]::-webkit-outer-spin-button,
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`;
