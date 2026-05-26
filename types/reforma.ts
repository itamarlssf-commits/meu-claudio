export type CategoriaReforma =
  | 'Engenharia'
  | 'Marcenaria'
  | 'Marmoraria'
  | 'Iluminação'
  | 'Elétrica'
  | 'Pintura'
  | 'Móveis'
  | 'Outros';

export const CATEGORIAS: CategoriaReforma[] = [
  'Engenharia',
  'Marcenaria',
  'Marmoraria',
  'Iluminação',
  'Elétrica',
  'Pintura',
  'Móveis',
  'Outros',
];

export const SOCIOS_REFORMA = [
  'Adriana',
  'Amanda',
  'Carla',
  'Eveline',
  'Itamar',
  'Lucas',
  'Marcos',
  'Mariana',
  'Neto',
  'Vanessa',
] as const;

export type SocioReforma = (typeof SOCIOS_REFORMA)[number];

export interface Parcela {
  id: string;
  numero: number; // 0 = entrada, 1+ = parcelas numeradas
  valor: number;
  vencimento: string; // YYYY-MM-DD
  pago: boolean;
  dataPagamento?: string;
}

export interface Gasto {
  id: string;
  descricao: string;
  categoria: CategoriaReforma;
  fornecedor: string;
  parcelas: Parcela[];
  observacoes?: string;
  criadoEm: string;
}

export interface Contribuicao {
  id: string;
  socio: SocioReforma;
  valor: number;
  data: string;
  descricao: string;
}

export interface ReformaData {
  gastos: Gasto[];
  contribuicoes: Contribuicao[];
}

export const REFORMA_DEFAULT: ReformaData = {
  gastos: [],
  contribuicoes: [],
};
