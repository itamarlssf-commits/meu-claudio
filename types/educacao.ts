/**
 * Contrato do módulo Educação — cenas explicativas usadas na consulta.
 *
 * O player (controles) e o renderer (desenho) conversam apenas por estas
 * interfaces. É isso que permite plugar um renderer 3D no futuro sem tocar
 * no player nem na view.
 */

/** Como a cena é percorrida. */
export type ModoCena =
  /** Linha do tempo contínua controlada por slider (ex.: mecanismo do parto). */
  | 'timeline'
  /** Camadas alternáveis, sem progressão temporal (ex.: focos de endometriose). */
  | 'camadas';

/** Tecnologia de desenho. 'three' está reservado — ainda não implementado. */
export type TipoRenderer = 'svg' | 'three';

/** Marco nomeado dentro de uma cena de linha do tempo. */
export interface Etapa {
  id: string;
  titulo: string;
  /** Posição no slider, de 0 a 1. */
  progresso: number;
  /** Texto de apoio, em linguagem de paciente, para o médico narrar. */
  narrativa: string;
}

/** Elemento que pode ser ligado/desligado sobre o desenho base. */
export interface Camada {
  id: string;
  titulo: string;
  /** Cor de destaque (valor hex, normalmente vindo de TOKENS). */
  cor: string;
  /** Sintomas que costumam acompanhar este achado. */
  sintomas: string[];
  ativaPorPadrao: boolean;
}

export interface Cena {
  id: string;
  titulo: string;
  subtitulo: string;
  icone: string;
  modo: ModoCena;
  renderer: TipoRenderer;
  /** Presente quando modo === 'timeline'. */
  etapas?: Etapa[];
  /** Presente quando modo === 'camadas'. */
  camadas?: Camada[];
}

/** Tudo que um renderer recebe — SVG hoje, Three amanhã. */
export interface RendererProps {
  cena: Cena;
  /** Progresso normalizado de 0 a 1. */
  progresso: number;
  camadasAtivas: Set<string>;
}
