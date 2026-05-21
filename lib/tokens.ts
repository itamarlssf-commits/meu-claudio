import type { StatusPagamento } from '@/types/paciente';

export const TOKENS = {
  bg: '#fafaf7',
  surface: '#ffffff',
  ink: '#1a1f2e',
  ink2: '#3d4658',
  muted: '#7a8494',
  line: '#e8eaed',
  line2: '#f0f1f3',
  primary: '#1f3a5f',
  primary2: '#2c5282',
  accent: '#b8915a',
  accent2: '#d4b478',
  green: '#10b981',
  greenSoft: '#d1fae5',
  red: '#ef4444',
  redSoft: '#fee2e2',
  amber: '#f59e0b',
  amberSoft: '#fef3c7',
  blue: '#3b82f6',
  blueSoft: '#dbeafe',
  purple: '#8b5cf6',
  purpleSoft: '#ede9fe',
  pink: '#ec4899',
  pinkSoft: '#fce7f3',
} as const;

export type TokenKey = keyof typeof TOKENS;

export function rowTint(status: StatusPagamento): string {
  switch (status) {
    case 'pago':
      return '#f0fdf4';
    case 'parcial':
      return '#fffbeb';
    case 'pendente':
      return '#fff1f2';
    default:
      return '#ffffff';
  }
}
