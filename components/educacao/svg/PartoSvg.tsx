'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RendererProps } from '@/types/educacao';
import { porChaves, suavizar, clamp, lerp } from '@/lib/educacao/interpolar';
import { TOKENS } from '@/lib/tokens';

/* Paleta anatômica local — tons que não existem nos TOKENS do CRM. */
const OSSO        = '#ded2b6';
const OSSO_LINHA  = '#b3a179';
const CANAL       = '#fdf1f2';
const MOLE        = '#f2d3d7';
const MOLE_LINHA  = '#d9a3ab';
const UTERO       = '#f6e2e5';
const UTERO_LINHA = '#d5a3ad';
const PELE        = '#f7d7bd';
const PELE_LINHA  = '#c8916a';

/**
 * Eixo do canal de parto (curva de Carus): a cabeça desce pela concavidade do
 * sacro e volta para frente na saída. Anterior (púbis) à esquerda.
 *
 * As paredes da bacia são calculadas a partir desta mesma curva, deslocando-a
 * para os dois lados. Assim o canal e a cabeça nunca saem de registro.
 */
const CURVA_CARUS =
  'M 212 96 C 204 146, 210 196, 234 222 C 256 246, 226 278, 168 276 C 152 275, 138 272, 126 268';

/** Onde o canal começa e termina, como fração do comprimento da curva. */
const T_ENTRADA = 0;
const T_SAIDA = 0.8;

/** Meia-largura do canal: um pouco mais folgado na entrada que na saída. */
const RAIO_ENTRADA = 50;
const RAIO_SAIDA = 42;

const AMOSTRAS = 72;

/** Flexão da cabeça em graus: positivo = queixo encostado no peito. */
const CHAVES_FLEXAO: ReadonlyArray<readonly [number, number]> = [
  [0, -8], [0.34, -8], [0.52, 24], [0.7, 24], [0.86, -46], [1, -64],
];

/** Plano de De Lee, de -3 (alto) a +3 (baixo). */
const CHAVES_DELEE: ReadonlyArray<readonly [number, number]> = [
  [0, -3], [0.18, -3], [0.34, -1.5], [0.52, 0], [0.7, 1.5], [0.86, 3], [1, 3],
];

/**
 * Occipito visto pela saída da bacia, em graus a partir da frente da mãe.
 * 90 = occipito-transversa, 0 = occipito-púbica, 45 = restituição.
 */
const CHAVES_OCCIPITO: ReadonlyArray<readonly [number, number]> = [
  [0, 90], [0.52, 90], [0.7, 0], [0.86, 0], [1, 45],
];

interface Amostra {
  x: number;
  y: number;
  /** Normal unitária apontando para o lado anterior (frente da mãe). */
  nx: number;
  ny: number;
  /** Direção da tangente, em graus. */
  ang: number;
  raio: number;
}

function linha(pontos: Array<{ x: number; y: number }>): string {
  return pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

function deslocar(a: Amostra[], sentido: 1 | -1): Array<{ x: number; y: number }> {
  return a.map((s) => ({ x: s.x + s.nx * s.raio * sentido, y: s.y + s.ny * s.raio * sentido }));
}

export default function PartoSvg({ progresso }: RendererProps) {
  const guiaRef = useRef<SVGPathElement>(null);
  const [amostras, setAmostras] = useState<Amostra[]>([]);
  const [pose, setPose] = useState({ x: 212, y: 96, ang: 90, tx: 212, ty: 40 });

  /* As paredes da bacia dependem só da curva: calcula uma vez. */
  useEffect(() => {
    const guia = guiaRef.current;
    if (!guia) return;

    const total = guia.getTotalLength();
    const lista: Amostra[] = [];

    for (let i = 0; i <= AMOSTRAS; i++) {
      const f = i / AMOSTRAS;
      const comp = total * lerp(T_ENTRADA, T_SAIDA, f);
      const p = guia.getPointAtLength(comp);
      const a = guia.getPointAtLength(Math.max(0, comp - 1.5));
      const b = guia.getPointAtLength(Math.min(total, comp + 1.5));

      const tx = b.x - a.x;
      const ty = b.y - a.y;
      const norma = Math.hypot(tx, ty) || 1;

      lista.push({
        x: p.x,
        y: p.y,
        nx: -ty / norma,
        ny: tx / norma,
        ang: (Math.atan2(ty, tx) * 180) / Math.PI,
        raio: lerp(RAIO_ENTRADA, RAIO_SAIDA, f),
      });
    }

    setAmostras(lista);
  }, []);

  /* Posição da cabeça e do tronco ao longo da curva. */
  useEffect(() => {
    const guia = guiaRef.current;
    if (!guia) return;

    const total = guia.getTotalLength();

    /** Antes do início, prolonga a reta da tangente inicial. */
    const em = (comp: number) => {
      if (comp >= 0) return guia.getPointAtLength(Math.min(comp, total));
      const i0 = guia.getPointAtLength(0);
      const i1 = guia.getPointAtLength(2);
      return { x: i0.x + ((i1.x - i0.x) / 2) * comp, y: i0.y + ((i1.y - i0.y) / 2) * comp };
    };

    const percorrido = total * suavizar(clamp(progresso));
    const cabeca = em(percorrido);
    const adiante = em(percorrido + 2);
    const tronco = em(percorrido - 48);

    setPose({
      x: cabeca.x,
      y: cabeca.y,
      ang: (Math.atan2(adiante.y - cabeca.y, adiante.x - cabeca.x) * 180) / Math.PI,
      tx: tronco.x,
      ty: tronco.y,
    });
  }, [progresso]);

  const anterior  = useMemo(() => deslocar(amostras, 1), [amostras]);
  const posterior = useMemo(() => deslocar(amostras, -1), [amostras]);

  const flexao   = porChaves(progresso, CHAVES_FLEXAO);
  const deLee    = porChaves(progresso, CHAVES_DELEE);
  const occipito = porChaves(progresso, CHAVES_OCCIPITO);

  const anguloCabeca = pose.ang - 90 + flexao;
  const anguloTronco = (Math.atan2(pose.y - pose.ty, pose.x - pose.tx) * 180) / Math.PI - 90;

  /* Régua de De Lee: -3 em y=88, +3 em y=212. */
  const yDeLee = 88 + ((deLee + 3) / 6) * 124;

  const pronto = amostras.length > 0;
  const iPubis = Math.round(AMOSTRAS * 0.78);
  const pubis = anterior[iPubis];
  const anguloPubis = amostras[iPubis]?.ang ?? 0;

  /* Trechos usados por sacro e períneo. */
  const sacro = posterior.slice(Math.round(AMOSTRAS * 0.04), Math.round(AMOSTRAS * 0.68));
  const coccix = posterior.slice(Math.round(AMOSTRAS * 0.68), Math.round(AMOSTRAS * 0.9));

  return (
    <svg
      viewBox="0 0 500 380"
      style={{ width: '100%', height: '100%', display: 'block' }}
      role="img"
      aria-label={`Mecanismo do parto, ${Math.round(progresso * 100)} por cento`}
    >
      {/* curva-guia: não aparece, serve de base para todo o resto */}
      <path ref={guiaRef} d={CURVA_CARUS} fill="none" stroke="none" />

      {pronto && (
        <>
          {/* ================= bacia e canal ================= */}

          {/* útero: apoiado na entrada da bacia, aberto no topo do corte */}
          <path
            d={`M ${anterior[0].x} ${anterior[0].y}
                C ${anterior[0].x - 30} ${anterior[0].y - 88}, ${posterior[0].x + 30} ${posterior[0].y - 92},
                  ${posterior[0].x} ${posterior[0].y} Z`}
            fill={UTERO}
            stroke={UTERO_LINHA}
            strokeWidth={2.5}
          />

          {/* lúmen do canal */}
          <path
            d={`${linha(anterior)} L ${posterior[posterior.length - 1].x} ${posterior[posterior.length - 1].y}
                ${linha([...posterior].reverse()).replace('M', 'L')} Z`}
            fill={CANAL}
          />

          {/* parede anterior (tecidos moles) */}
          <path d={linha(anterior)} fill="none" stroke={MOLE} strokeWidth={13} strokeLinecap="round" />
          {/* parede posterior (tecidos moles) */}
          <path d={linha(posterior)} fill="none" stroke={MOLE} strokeWidth={13} strokeLinecap="round" />
          {/* períneo: fecha a saída da bacia */}
          <path
            d={`M ${anterior[AMOSTRAS].x} ${anterior[AMOSTRAS].y}
                Q ${anterior[AMOSTRAS].x - 30} ${(anterior[AMOSTRAS].y + posterior[AMOSTRAS].y) / 2}
                  ${posterior[AMOSTRAS].x} ${posterior[AMOSTRAS].y}`}
            fill="none"
            stroke={MOLE}
            strokeWidth={11}
            strokeLinecap="round"
            opacity={0.75}
          />

          {/* ================= feto ================= */}

          <g transform={`translate(${pose.tx} ${pose.ty}) rotate(${anguloTronco})`}>
            <ellipse cx={0} cy={0} rx={30} ry={38} fill={PELE} stroke={PELE_LINHA} strokeWidth={2} opacity={0.92} />
          </g>

          <g transform={`translate(${pose.x} ${pose.y}) rotate(${anguloCabeca})`}>
            <ellipse cx={0} cy={0} rx={35} ry={39} fill={PELE} stroke={PELE_LINHA} strokeWidth={2.5} />
            {/* perfil do rosto: torna a flexão e a extensão visíveis */}
            <path
              d="M -34 2 L -43 16 L -33 21 L -29 33"
              fill="none"
              stroke={PELE_LINHA}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={0} cy={-25} r={7} fill={TOKENS.accent} stroke="#fff" strokeWidth={1.5} />
          </g>

          {/* ================= ossos, por cima do corte ================= */}

          <path d={linha(sacro)} fill="none" stroke={OSSO} strokeWidth={20} strokeLinecap="round" />
          <path d={linha(sacro)} fill="none" stroke={OSSO_LINHA} strokeWidth={1.3} opacity={0.4} />
          <path d={linha(coccix)} fill="none" stroke={OSSO} strokeWidth={11} strokeLinecap="round" />

          {pubis && (
            <g transform={`translate(${pubis.x} ${pubis.y}) rotate(${anguloPubis})`}>
              <rect x={-21} y={-11} width={42} height={22} rx={10} fill={OSSO} stroke={OSSO_LINHA} strokeWidth={1.6} />
            </g>
          )}

          {/* planos de entrada e de saída */}
          <line
            x1={anterior[0].x} y1={anterior[0].y}
            x2={posterior[0].x} y2={posterior[0].y}
            stroke={TOKENS.primary} strokeWidth={1.4} strokeDasharray="5 4" opacity={0.55}
          />

          {/* rótulos com linha de chamada, fora do desenho */}
          <g>
            <line x1={104} y1={80} x2={anterior[0].x - 4} y2={anterior[0].y - 2} stroke={TOKENS.muted} strokeWidth={1} opacity={0.5} />
            <text x={100} y={83} fontSize={10} fill={TOKENS.muted} textAnchor="end">entrada da bacia</text>
          </g>
          <g>
            <line x1={96} y1={206} x2={anterior[AMOSTRAS].x - 6} y2={anterior[AMOSTRAS].y} stroke={TOKENS.muted} strokeWidth={1} opacity={0.5} />
            <text x={92} y={209} fontSize={10} fill={TOKENS.muted} textAnchor="end">saída da bacia</text>
          </g>
          <g>
            <line x1={300} y1={168} x2={posterior[Math.round(AMOSTRAS * 0.32)].x + 4} y2={posterior[Math.round(AMOSTRAS * 0.32)].y} stroke={TOKENS.muted} strokeWidth={1} opacity={0.5} />
            <text x={304} y={171} fontSize={10} fill={TOKENS.muted}>sacro</text>
          </g>
        </>
      )}

      {/* orientação e legenda */}
      <text x={16} y={26} fontSize={10} fill={TOKENS.muted}>← frente da mãe</text>
      <text x={300} y={26} fontSize={10} fill={TOKENS.muted} textAnchor="end">coluna →</text>
      <g transform="translate(20 362)">
        <circle cx={0} cy={-4} r={6} fill={TOKENS.accent} />
        <text x={13} y={0} fontSize={10} fill={TOKENS.muted}>occipito — a nuca do bebê</text>
      </g>

      {/* ================= régua do plano de De Lee ================= */}
      <g>
        <text x={368} y={68} fontSize={10.5} fill={TOKENS.ink2} fontWeight={700} textAnchor="middle">
          Plano de De Lee
        </text>
        <line x1={368} y1={88} x2={368} y2={212} stroke={TOKENS.line} strokeWidth={2} />
        {[-3, -2, -1, 0, 1, 2, 3].map((n) => {
          const y = 88 + ((n + 3) / 6) * 124;
          const zero = n === 0;
          return (
            <g key={n}>
              <line
                x1={zero ? 354 : 361} y1={y} x2={zero ? 382 : 375} y2={y}
                stroke={zero ? TOKENS.primary : TOKENS.line}
                strokeWidth={zero ? 2.2 : 1.5}
              />
              <text
                x={346} y={y + 3.5} fontSize={9.5}
                fill={zero ? TOKENS.primary : TOKENS.muted}
                fontWeight={zero ? 700 : 400}
                textAnchor="end"
              >
                {n > 0 ? `+${n}` : n}
              </text>
            </g>
          );
        })}
        <text x={390} y={91} fontSize={9} fill={TOKENS.muted}>alto</text>
        <text x={390} y={153} fontSize={9} fill={TOKENS.primary} fontWeight={700}>encaixada</text>
        <text x={390} y={215} fontSize={9} fill={TOKENS.muted}>baixo</text>
        <circle cx={368} cy={yDeLee} r={7} fill={TOKENS.accent} stroke="#fff" strokeWidth={2} />
      </g>

      {/* ================= vista pela saída da bacia ================= */}
      <g transform="translate(412 300)">
        <text x={0} y={-74} fontSize={10.5} fill={TOKENS.ink2} fontWeight={700} textAnchor="middle">
          Visto pela saída
        </text>
        <text x={0} y={-60} fontSize={9} fill={TOKENS.muted} textAnchor="middle">
          frente da mãe em cima
        </text>
        <circle cx={0} cy={0} r={46} fill={CANAL} stroke={MOLE_LINHA} strokeWidth={2} />
        <rect x={-17} y={-53} width={34} height={11} rx={5} fill={OSSO} stroke={OSSO_LINHA} strokeWidth={1.5} />
        <g transform={`rotate(${occipito})`}>
          <ellipse cx={0} cy={0} rx={27} ry={33} fill={PELE} stroke={PELE_LINHA} strokeWidth={2} />
          <line x1={0} y1={14} x2={0} y2={-13} stroke={PELE_LINHA} strokeWidth={1.6} strokeDasharray="3 3" />
          <circle cx={0} cy={-21} r={7} fill={TOKENS.accent} stroke="#fff" strokeWidth={1.5} />
        </g>
      </g>
    </svg>
  );
}
