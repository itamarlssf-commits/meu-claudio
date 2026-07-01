// Tipos do módulo de Ponto Eletrônico (ferramenta de controle interno).

export type TipoRegistro = 'entrada' | 'inicio_intervalo' | 'fim_intervalo' | 'saida';
export type PapelUsuario = 'admin' | 'funcionaria';
export type LocalTrabalho = 'Consultório Ellas' | 'Casa';

export const LOCAIS_TRABALHO: LocalTrabalho[] = ['Consultório Ellas', 'Casa'];

/** Índice 0 = domingo … 6 = sábado. */
export const DIAS_SEMANA_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
export type JornadaPorDia = [number, number, number, number, number, number, number];

export const TIPO_LABELS: Record<TipoRegistro, string> = {
  entrada: 'Entrada',
  inicio_intervalo: 'Saída p/ intervalo',
  fim_intervalo: 'Volta do intervalo',
  saida: 'Saída',
};

// Tipos que abrem um período de trabalho (começa a contar) e que fecham (para de contar).
export const TIPOS_ABRE: TipoRegistro[] = ['entrada', 'fim_intervalo'];
export const TIPOS_FECHA: TipoRegistro[] = ['saida', 'inicio_intervalo'];

export interface Funcionaria {
  id: string; // = uid do Firebase Auth quando a funcionária tem login
  nome: string;
  local: LocalTrabalho;
  email?: string;
  jornadaPorDia?: JornadaPorDia; // horas esperadas (já líquidas de almoço) por dia da semana
  jornadaSemanalHoras?: number; // soma de jornadaPorDia — guardado só para exibição rápida
  ativo: boolean;
  criadoEm: number;
}

export interface RegistroPonto {
  id: string;
  funcionariaId: string;
  funcionariaNome: string;
  tipo: TipoRegistro;
  timestamp: number; // momento do registro (ms)
  data: string; // 'YYYY-MM-DD'
  hora: string; // 'HH:MM'
  selfieUrl?: string; // URL no Firebase Storage
  lat?: number;
  lng?: number;
  precisao?: number; // precisão GPS (m)
  obs?: string;
  editadoPor?: string; // email do admin quando há correção manual
}

export interface UsuarioPonto {
  uid: string;
  papel: PapelUsuario;
  nome: string;
  funcionariaId?: string; // quando papel === 'funcionaria'
}
