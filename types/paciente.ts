export type Via = 'Normal' | 'Cesária' | 'A definir';
export type Origem = 'Indicação' | 'Instagram' | 'Site' | 'Google' | 'Outra';
export type FormaPagamento = 'PIX' | 'Cartão' | 'Dinheiro' | 'Boleto' | 'Transferência';
export type StatusPagamento = 'pago' | 'parcial' | 'pendente';
export type NomeSocio = 'Marcos' | 'Lucas' | '';

export interface Pagamento {
  id: string;
  valor: number;
  data: string;
  forma: FormaPagamento;
  tipo: string;
}

export interface SocioLegado {
  nome: string;
  papel: string;
  valor: number;
  impostos: number;
  pago: boolean;
  dataPgt: string | null;
}

export interface MultiItem {
  profissional: string;
  valor: number;
  pago: boolean;
  data?: string | null;
}

export interface Consulta {
  semana: number;
  data: string;
  realizada: boolean;
}

export interface Observacao {
  data: string;
  texto: string;
}

export interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  dataNasc: string;
  dum: string;
  dpp: string;
  via: Via;
  pacote: string;
  contrato: number;
  pagamentos: Pagamento[];
  partoRealizado: boolean;
  dataPartoReal: string | null;
  socio?: NomeSocio;
  socioValor?: number;
  socioImpostos?: number;
  socioPago?: boolean;
  socioDataPgt?: string | null;
  socios?: SocioLegado[];
  multi: MultiItem[];
  consultas: Consulta[];
  observacoes: Observacao[];
  status: StatusPagamento;
  origem: Origem;
  criadoEm: string;
}

export interface AppData {
  pacientes: Paciente[];
}

export interface SocioFlat {
  nome: string;
  papel: string;
  valor: number;
  impostos: number;
  pago: boolean;
  dataPgt: string | null;
  _legacy: boolean;
  _idx: number;
  paciente?: Paciente;
}

export interface AlertaCobranca {
  d: number;
  label: string;
  meta: number;
  diasRestantes: number;
  pctAtual: number;
}

export interface ConsultaSugerida {
  semana: number;
  data: string;
  especial: string | null;
}

export interface IdadeGestacional {
  semanas: number;
  dias: number;
  total: number;
}

export interface SocioInfo {
  nome: string;
  tipo: string;
  valorPadrao: number;
  descricao: string;
}

export interface ProfissionalMulti {
  nome: string;
  valorConsulta: number;
}
