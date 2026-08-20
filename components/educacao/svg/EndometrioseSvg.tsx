'use client';

import type { RendererProps } from '@/types/educacao';
import { TOKENS } from '@/lib/tokens';

/* Paleta anatômica local. */
const UTERO       = '#f2d8dd';
const UTERO_LINHA = '#cf9aa4';
const VIZINHO     = '#eceff3';
const VIZINHO_LINHA = '#bcc4d0';
const OSSO        = '#e3d8c0';

/**
 * Corte sagital da pelve, anterior (púbis) à esquerda.
 *
 * A vista sagital é a que separa de verdade os focos profundos: fundo de saco
 * de Douglas, ligamentos uterossacros e septo retovaginal ficam em planos
 * distintos, o que a vista frontal não mostra. Desenho original.
 */

/** Focos de cada camada. */
const FOCOS: Record<string, Array<{ cx: number; cy: number; r: number }>> = {
  ovario:       [{ cx: 284, cy: 142, r: 11 }],
  douglas:      [{ cx: 274, cy: 248, r: 7 }, { cx: 288, cy: 262, r: 5.5 }, { cx: 264, cy: 264, r: 5 }],
  uterossacros: [{ cx: 288, cy: 226, r: 6 }, { cx: 312, cy: 216, r: 5 }],
  bexiga:       [{ cx: 170, cy: 214, r: 6.5 }, { cx: 184, cy: 226, r: 5 }, { cx: 158, cy: 230, r: 4.5 }],
  intestino:    [{ cx: 314, cy: 190, r: 6.5 }, { cx: 318, cy: 244, r: 6 }, { cx: 308, cy: 288, r: 5 }],
  septo:        [{ cx: 256, cy: 302, r: 6.5 }, { cx: 268, cy: 314, r: 5 }],
};

type Ancora = 'start' | 'middle' | 'end';

/** Rótulo curto no desenho; o nome completo fica no painel lateral. */
const ROTULOS: Record<string, { texto: string; x: number; y: number; ax: number; ay: number; ancora: Ancora }> = {
  ovario:       { texto: 'ovário',        x: 412, y: 122, ax: 300, ay: 136, ancora: 'start' },
  uterossacros: { texto: 'uterossacros',  x: 412, y: 196, ax: 320, ay: 214, ancora: 'start' },
  intestino:    { texto: 'intestino',     x: 412, y: 258, ax: 326, ay: 246, ancora: 'start' },
  bexiga:       { texto: 'bexiga',        x: 92,  y: 202, ax: 152, ay: 216, ancora: 'end' },
  septo:        { texto: 'septo',         x: 92,  y: 316, ax: 248, ay: 304, ancora: 'end' },
  douglas:      { texto: 'fundo de saco de Douglas', x: 250, y: 372, ax: 276, ay: 272, ancora: 'middle' },
};

export default function EndometrioseSvg({ cena, camadasAtivas }: RendererProps) {
  const camadas = cena.camadas ?? [];

  return (
    <svg
      viewBox="0 44 520 348"
      style={{ width: '100%', height: '100%', display: 'block' }}
      role="img"
      aria-label="Corte sagital da pelve com os focos de endometriose"
    >
      {/* ---------- referências ósseas ---------- */}
      {/* sacro, ao fundo à direita */}
      <path d="M 350 108 C 372 146, 370 202, 346 244" fill="none" stroke={OSSO} strokeWidth={17} strokeLinecap="round" opacity={0.75} />
      {/* sínfise púbica, à frente */}
      <g transform="translate(148 296) rotate(-18)">
        <rect x={-10} y={-19} width={20} height={38} rx={9} fill={OSSO} opacity={0.8} />
      </g>

      {/* ---------- reto, atrás ---------- */}
      <path
        d="M 336 140 C 350 182, 344 238, 320 278 C 308 298, 296 314, 290 332"
        fill="none"
        stroke={VIZINHO}
        strokeWidth={26}
        strokeLinecap="round"
      />
      <path
        d="M 336 140 C 350 182, 344 238, 320 278 C 308 298, 296 314, 290 332"
        fill="none"
        stroke={VIZINHO_LINHA}
        strokeWidth={1.4}
        opacity={0.7}
      />

      {/* ---------- útero anteverso, tuba e ovário ---------- */}
      <g transform="translate(216 182) rotate(-32)">
        <ellipse cx={0} cy={0} rx={54} ry={39} fill={UTERO} stroke={UTERO_LINHA} strokeWidth={2.5} />
      </g>
      {/* colo do útero */}
      <path d="M 240 208 C 252 222, 258 236, 258 250" fill="none" stroke={UTERO_LINHA} strokeWidth={22} strokeLinecap="round" opacity={0.55} />
      {/* vagina */}
      <path d="M 254 254 C 240 280, 224 302, 208 320" fill="none" stroke={UTERO_LINHA} strokeWidth={13} strokeLinecap="round" opacity={0.45} />
      {/* tuba e ovário */}
      <path d="M 246 142 C 260 132, 272 130, 280 136" fill="none" stroke={UTERO_LINHA} strokeWidth={4.5} strokeLinecap="round" />
      <ellipse cx={284} cy={142} rx={21} ry={15} fill={UTERO} stroke={UTERO_LINHA} strokeWidth={2} />

      {/* ligamentos uterossacros, do colo em direção ao sacro */}
      <path d="M 262 236 C 288 230, 312 220, 330 208" fill="none" stroke={UTERO_LINHA} strokeWidth={4} strokeLinecap="round" opacity={0.65} />

      {/* fundo de saco de Douglas: recesso entre o útero e o reto */}
      <path d="M 252 232 C 262 260, 284 274, 306 268" fill="none" stroke={UTERO_LINHA} strokeWidth={1.6} strokeDasharray="4 3" opacity={0.7} />

      {/* ---------- bexiga, à frente ---------- */}
      <ellipse cx={168} cy={230} rx={46} ry={35} fill={VIZINHO} stroke={VIZINHO_LINHA} strokeWidth={2} />
      <path d="M 152 262 C 146 284, 140 300, 136 314" fill="none" stroke={VIZINHO} strokeWidth={9} strokeLinecap="round" />

      {/* ---------- nomes dos órgãos ---------- */}
      <text x={196} y={168} fontSize={10.5} fill={TOKENS.muted} textAnchor="middle">útero</text>
      <text x={168} y={254} fontSize={10.5} fill={TOKENS.muted} textAnchor="middle">bexiga</text>
      <text x={352} y={176} fontSize={10.5} fill={TOKENS.muted}>reto</text>
      <text x={210} y={336} fontSize={10.5} fill={TOKENS.muted} textAnchor="middle">vagina</text>

      {/* ---------- focos, por camada ---------- */}
      {camadas.map((camada) => {
        if (!camadasAtivas.has(camada.id)) return null;
        const focos = FOCOS[camada.id] ?? [];
        const rotulo = ROTULOS[camada.id];

        return (
          <g key={camada.id}>
            {focos.map((f, i) => (
              <g key={i}>
                <circle cx={f.cx} cy={f.cy} r={f.r + 4} fill={camada.cor} opacity={0.18} />
                <circle cx={f.cx} cy={f.cy} r={f.r} fill={camada.cor} stroke="#fff" strokeWidth={1.5} />
              </g>
            ))}
            {rotulo && (
              <g>
                <line
                  x1={rotulo.ancora === 'end' ? rotulo.x + 4 : rotulo.ancora === 'start' ? rotulo.x - 4 : rotulo.x}
                  y1={rotulo.ancora === 'middle' ? rotulo.y - 11 : rotulo.y - 4}
                  x2={rotulo.ax}
                  y2={rotulo.ay}
                  stroke={camada.cor}
                  strokeWidth={1.2}
                  opacity={0.6}
                />
                <text x={rotulo.x} y={rotulo.y} fontSize={11} fontWeight={700} fill={camada.cor} textAnchor={rotulo.ancora}>
                  {rotulo.texto}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* ---------- orientação ---------- */}
      <text x={92} y={88} fontSize={10} fill={TOKENS.muted}>← frente</text>
      <text x={428} y={88} fontSize={10} fill={TOKENS.muted} textAnchor="end">coluna →</text>
      <text x={260} y={64} fontSize={10.5} fill={TOKENS.muted} textAnchor="middle">
        pelve vista de lado
      </text>
    </svg>
  );
}
