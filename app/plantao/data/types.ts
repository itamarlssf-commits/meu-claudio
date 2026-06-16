/* =========================================================================
   Tipos do domínio (peso fetal) e contrato comum das referências.
   Sem React — só dados e funções puras.
   ========================================================================= */

export type FetalSex = 'unknown' | 'male' | 'female';

// Dados maternos para a customização da Barcelona (Figueras). Todos opcionais:
// sem eles, a referência cai para a curva não-customizada.
export interface MaternalData {
  heightCm?: number;
  bookingWeightKg?: number;
  parity?: number; // 0, 1, 2...
  ethnicity?: 'white' | 'afro' | 'south-asian' | 'east-asian' | 'maghreb' | 'latin' | 'other';
}

// Classe de crescimento por percentil.
//  normal ≥ p10 | sga p3–p10 | severe-sga < p3 | lga > p90
export type GrowthClass = 'normal' | 'sga' | 'severe-sga' | 'lga';

export function classify(p: number): GrowthClass {
  if (p < 3) return 'severe-sga';
  if (p < 10) return 'sga';
  if (p > 90) return 'lga';
  return 'normal';
}

export interface PercentileResult {
  p: number; // 0–100
  classification: GrowthClass;
  median?: number; // peso (g) no p50 para a IG — usado p/ "% da mediana"
  customized: boolean; // true se termos maternos foram aplicados (Barcelona)
}

// Contrato que toda referência de peso fetal implementa.
export interface EfwReference {
  id: 'hadlock' | 'fmf' | 'barcelona';
  label: string; // "Hadlock 1991"
  shortLabel: string; // "Hadlock"
  cite: string;
  gaRangeDays: readonly [number, number]; // janela de aplicabilidade
  usesSex: boolean;
  usesMaternal: boolean;
  // Retorna null quando fora de faixa / entrada insuficiente.
  percentile(
    efwGrams: number,
    gaDays: number,
    sex: FetalSex,
    maternal?: MaternalData
  ): PercentileResult | null;
}
