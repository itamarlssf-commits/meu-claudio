export type LeadStatus = 'agendou' | 'pendente' | 'retornar' | 'perdeu';

export type LeadOrigem =
  | 'Instagram'
  | 'Indicação (amiga/familiar)'
  | 'Indicação médica'
  | 'Google'
  | 'WhatsApp'
  | 'Outra';

export type LeadMotivo =
  | 'gineco'
  | 'pre_natal'
  | 'endometriose'
  | 'anticoncep'
  | 'cirurgia'
  | 'parto'
  | 'histeroscopia'
  | 'consulta_retorno'
  | 'ultrassonografia'
  | 'vacina'
  | 'outro';

export const MOTIVO_LABELS: Record<LeadMotivo, string> = {
  gineco:          '🌸 Consulta Ginecológica',
  pre_natal:       '👶 Pré-natal',
  endometriose:    '🔬 Endometriose',
  anticoncep:      '💊 DIU / Implanon',
  cirurgia:        '⚕️ Cirurgia Ginecológica',
  parto:           '🤱 Parto Humanizado',
  histeroscopia:   '🩺 Histeroscopia',
  consulta_retorno:'🔄 Consulta de Retorno',
  ultrassonografia:'🖥️ Ultrassonografia',
  vacina:          '💉 Vacina / Imunização',
  outro:           '📋 Outro motivo',
};

export type ContatoResultado =
  | 'atendeu'
  | 'caixa_postal'
  | 'nao_atendeu'
  | 'retornou'
  | 'recusou';

export interface ContatoTentativa {
  id: string;
  data: string;
  hora: string;
  resultado: ContatoResultado;
  nota?: string;
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  origem: LeadOrigem;
  motivo: LeadMotivo;
  motivoLabel: string;
  status: LeadStatus;
  data: string;
  hora: string;
  observacoes: string;
  timestamp: number;
  dataRetorno?: string;
  objetaoCodigo?: string;
  criadoPor: string;
  contatos?: ContatoTentativa[];
  dataConsulta?: string;
  horaConsulta?: string;
}
