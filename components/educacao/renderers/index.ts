import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { RendererProps, TipoRenderer } from '@/types/educacao';

/**
 * Resolve o renderer de uma cena.
 *
 * Os renderers são carregados sob demanda para que uma futura implementação 3D
 * (three / @react-three/fiber) não entre no bundle das cenas 2D. Para adicionar
 * 3D no futuro basta criar ThreeCena.tsx e registrá-lo aqui — o player e a view
 * não mudam.
 */
const RENDERERS: Partial<Record<TipoRenderer, ComponentType<RendererProps>>> = {
  svg: dynamic(() => import('./SvgCena'), { ssr: false }),
};

export function resolverRenderer(tipo: TipoRenderer): ComponentType<RendererProps> | undefined {
  return RENDERERS[tipo];
}
