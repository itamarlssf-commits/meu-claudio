'use client';

import type { RendererProps } from '@/types/educacao';
import { clamp } from '@/lib/educacao/interpolar';
import { TOKENS } from '@/lib/tokens';

const DIAS = 28;

/* Área do gráfico. */
const X0 = 52;
const X1 = 424;
const Y_HORM_BASE = 172;
const Y_HORM_TOPO = 84;
const Y_ENDO_BASE = 288;
/* Topo das faixas de fase e base da linha do dia. */
const Y_FAIXAS = 76;
const Y_MIOMETRIO = Y_ENDO_BASE + 16;

const ENDOMETRIO      = '#e8a0ac';
const ENDOMETRIO_MIOM = '#f3dade';
const OVARIO_FUNDO    = '#f7ecd9';
const OVARIO_LINHA    = '#d9b98a';

/** Converte um dia (1..28) em coordenada horizontal. */
function xDia(dia: number): number {
  return X0 + ((dia - 1) / (DIAS - 1)) * (X1 - X0);
}

/** Espessura endometrial em milímetros para um dado dia. */
function espessuraMm(dia: number): number {
  if (dia <= 5) return 8 - (dia - 1) * 1.5;      // descamação: 8 -> 2
  if (dia <= 14) return 2 + (dia - 5) * 0.9;      // proliferativa: 2 -> 10
  if (dia <= 24) return 10 + (dia - 14) * 0.4;    // secretora: 10 -> 14
  return 14 - (dia - 24) * 0.25;                  // pré-menstrual
}

function gauss(x: number, mu: number, sigma: number): number {
  return Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));
}

const HORMONIOS = [
  { id: 'estradiol',    nome: 'Estrogênio',   cor: '#2c5282', f: (d: number) => gauss(d, 13, 3) + 0.55 * gauss(d, 21, 4.5) },
  { id: 'lh',           nome: 'LH',            cor: '#8b5cf6', f: (d: number) => gauss(d, 14, 0.9) },
  { id: 'progesterona', nome: 'Progesterona',  cor: '#10b981', f: (d: number) => 0.95 * gauss(d, 21, 4) },
  { id: 'fsh',          nome: 'FSH',           cor: '#f59e0b', f: (d: number) => 0.5 * gauss(d, 3, 2.5) + 0.38 * gauss(d, 14, 1.4) },
];

/** Gera o traçado de uma curva hormonal ao longo do ciclo. */
function curvaHormonal(f: (d: number) => number): string {
  const pontos: string[] = [];
  for (let d = 1; d <= DIAS; d += 0.5) {
    const y = Y_HORM_BASE - clamp(f(d)) * (Y_HORM_BASE - Y_HORM_TOPO);
    pontos.push(`${d === 1 ? 'M' : 'L'} ${xDia(d).toFixed(1)} ${y.toFixed(1)}`);
  }
  return pontos.join(' ');
}

/** Contorno do endométrio ao longo de todo o ciclo. */
function contornoEndometrio(): string {
  const topo: string[] = [];
  for (let d = 1; d <= DIAS; d += 0.5) {
    const y = Y_ENDO_BASE - espessuraMm(d) * 3.4;
    topo.push(`${d === 1 ? 'M' : 'L'} ${xDia(d).toFixed(1)} ${y.toFixed(1)}`);
  }
  return `${topo.join(' ')} L ${X1} ${Y_ENDO_BASE} L ${X0} ${Y_ENDO_BASE} Z`;
}

const NIVEIS_FLUXO = [
  { titulo: 'Normal',           altura: 14, cor: '#f9a8b4', desc: 'a cada 4h ou mais' },
  { titulo: 'Aumentado',        altura: 26, cor: '#ef4444', desc: 'a cada 2h' },
  { titulo: 'Muito aumentado',  altura: 38, cor: '#b91c1c', desc: 'a cada 1h, com coágulos' },
];

export default function CicloSvg({ progresso, camadasAtivas }: RendererProps) {
  const dia = 1 + clamp(progresso) * (DIAS - 1);
  const x = xDia(dia);
  const espessura = espessuraMm(dia);
  const mostrarHormonios = camadasAtivas.has('hormonios');
  const mostrarFluxo = camadasAtivas.has('fluxo');

  /* Folículo cresce até a ovulação; depois vira corpo lúteo. */
  const antesOvulacao = dia <= 14;
  const raioFoliculo = antesOvulacao ? 4 + (dia / 14) * 12 : 14 - ((dia - 14) / 14) * 5;

  const yMarcador = Y_ENDO_BASE - espessura * 3.4;
  /* Perto das bordas, a pílula e o rótulo em mm invertem o lado para não sair do quadro. */
  const xPilula = Math.min(Math.max(x, X0 + 30), X1 - 30);
  const mmAEsquerda = dia > 22;

  return (
    <svg
      viewBox="0 0 460 452"
      style={{ width: '100%', height: '100%', display: 'block' }}
      role="img"
      aria-label={`Ciclo menstrual, dia ${Math.round(dia)}`}
    >
      {/* ---------- faixas de fase, ao fundo ---------- */}
      <rect x={xDia(1)} y={Y_FAIXAS} width={xDia(5) - xDia(1)} height={Y_ENDO_BASE - Y_FAIXAS} fill="#fdecee" />
      <rect x={xDia(14) - 5} y={Y_FAIXAS} width={10} height={Y_ENDO_BASE - Y_FAIXAS} fill="#ede9fe" opacity={0.7} />

      <text x={xDia(14)} y={38} fontSize={9.5} fill="#7c3aed" textAnchor="middle" fontWeight={700}>ovulação</text>
      <text x={xDia(3)} y={56} fontSize={9.5} fill={TOKENS.muted} textAnchor="middle">menstruação</text>
      <text x={xDia(9.5)} y={56} fontSize={9.5} fill={TOKENS.muted} textAnchor="middle">fase folicular</text>
      <text x={xDia(21)} y={56} fontSize={9.5} fill={TOKENS.muted} textAnchor="middle">fase lútea</text>

      {/* ---------- curvas hormonais (camada opcional) ---------- */}
      {mostrarHormonios && (
        <g>
          {HORMONIOS.map((h, i) => (
            <g key={h.id} transform={`translate(${X0 + i * 94} 70)`}>
              <line x1={0} y1={-3} x2={14} y2={-3} stroke={h.cor} strokeWidth={2.5} strokeLinecap="round" />
              <text x={18} y={0} fontSize={9} fill={TOKENS.ink2}>{h.nome}</text>
            </g>
          ))}
          <line x1={X0} y1={Y_HORM_BASE} x2={X1} y2={Y_HORM_BASE} stroke={TOKENS.line} strokeWidth={1} />
          {HORMONIOS.map((h) => (
            <path key={h.id} d={curvaHormonal(h.f)} fill="none" stroke={h.cor} strokeWidth={2} strokeLinecap="round" />
          ))}
        </g>
      )}

      {/* ---------- endométrio ---------- */}
      <text x={X0} y={Y_ENDO_BASE - 84} fontSize={10.5} fill={TOKENS.ink2} fontWeight={700}>
        Camada interna do útero
      </text>
      <rect x={X0} y={Y_ENDO_BASE} width={X1 - X0} height={16} fill={ENDOMETRIO_MIOM} stroke="#dfc3c8" strokeWidth={1} />
      <path d={contornoEndometrio()} fill={ENDOMETRIO} opacity={0.85} />

      {/* ---------- marcador do dia ---------- */}
      <line x1={x} y1={Y_FAIXAS - 12} x2={x} y2={Y_MIOMETRIO} stroke={TOKENS.primary} strokeWidth={2} />
      <circle cx={x} cy={yMarcador} r={5} fill={TOKENS.primary} stroke="#fff" strokeWidth={2} />
      <g transform={`translate(${xPilula} 20)`}>
        <rect x={-30} y={-15} width={60} height={20} rx={10} fill={TOKENS.primary} />
        <text x={0} y={-1} fontSize={11} fill="#fff" fontWeight={700} textAnchor="middle">
          dia {Math.round(dia)}
        </text>
      </g>
      <text
        x={mmAEsquerda ? x - 9 : x + 9}
        y={yMarcador - 9}
        fontSize={10}
        fill={TOKENS.primary}
        fontWeight={700}
        textAnchor={mmAEsquerda ? 'end' : 'start'}
      >
        {espessura.toFixed(1)} mm
      </text>

      {/* ---------- eixo de dias ---------- */}
      {[1, 7, 14, 21, 28].map((d) => (
        <text key={d} x={xDia(d)} y={Y_MIOMETRIO + 18} fontSize={9} fill={TOKENS.muted} textAnchor="middle">
          {d}
        </text>
      ))}
      <text x={(X0 + X1) / 2} y={Y_MIOMETRIO + 32} fontSize={9} fill={TOKENS.muted} textAnchor="middle">
        dia do ciclo
      </text>

      {/* ---------- ovário ---------- */}
      <g transform="translate(104 394)">
        <text x={0} y={-44} fontSize={10.5} fill={TOKENS.ink2} fontWeight={700} textAnchor="middle">
          Ovário
        </text>
        <ellipse cx={0} cy={0} rx={44} ry={28} fill={OVARIO_FUNDO} stroke={OVARIO_LINHA} strokeWidth={2} />
        {antesOvulacao ? (
          <g>
            <circle cx={0} cy={0} r={raioFoliculo} fill="#fff" stroke={OVARIO_LINHA} strokeWidth={1.5} />
            <circle cx={0} cy={0} r={Math.max(2, raioFoliculo * 0.28)} fill={TOKENS.accent} />
            <text x={0} y={44} fontSize={9} fill={TOKENS.muted} textAnchor="middle">folículo amadurecendo</text>
          </g>
        ) : (
          <g>
            <circle cx={0} cy={0} r={raioFoliculo} fill="#fde68a" stroke="#d9a441" strokeWidth={1.5} />
            <text x={0} y={44} fontSize={9} fill={TOKENS.muted} textAnchor="middle">corpo lúteo</text>
          </g>
        )}
        {Math.abs(dia - 14) < 0.6 && (
          <g>
            <circle cx={0} cy={0} r={22} fill="none" stroke="#7c3aed" strokeWidth={2} strokeDasharray="4 3" />
            <circle cx={26} cy={-16} r={4} fill={TOKENS.accent} />
          </g>
        )}
      </g>

      {/* ---------- escala de fluxo (camada opcional) ---------- */}
      {mostrarFluxo && (
        <g transform="translate(226 352)">
          <text x={0} y={0} fontSize={10.5} fill={TOKENS.ink2} fontWeight={700}>
            Quanto é sangramento demais
          </text>
          {NIVEIS_FLUXO.map((n, i) => (
            <g key={n.titulo} transform={`translate(${i * 80} 14)`}>
              <rect x={0} y={44 - n.altura} width={26} height={n.altura} rx={4} fill={n.cor} />
              <rect x={0} y={4} width={26} height={40} rx={4} fill="none" stroke={TOKENS.line} strokeWidth={1.2} />
              <text x={13} y={58} fontSize={9} fill={TOKENS.ink2} fontWeight={700} textAnchor="middle">
                {n.titulo}
              </text>
              <text x={13} y={69} fontSize={7.5} fill={TOKENS.muted} textAnchor="middle">
                {n.desc}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
