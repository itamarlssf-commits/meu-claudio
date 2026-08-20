'use client';

import type { RendererProps } from '@/types/educacao';
import PartoSvg from '../svg/PartoSvg';
import EndometrioseSvg from '../svg/EndometrioseSvg';
import CicloSvg from '../svg/CicloSvg';

/** Cada cena com renderer 'svg' aponta para o seu desenho pelo id. */
const DESENHOS: Record<string, (p: RendererProps) => JSX.Element> = {
  parto: PartoSvg,
  endometriose: EndometrioseSvg,
  ciclo: CicloSvg,
};

export default function SvgCena(props: RendererProps) {
  const Desenho = DESENHOS[props.cena.id];

  if (!Desenho) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#7a8494', fontSize: 13 }}>
        Desenho não encontrado para a cena {props.cena.id}.
      </div>
    );
  }

  return <Desenho {...props} />;
}
