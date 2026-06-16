/* Registro de referências de percentil de peso fetal computáveis no app.
   A aba Peso itera este array — adicionar uma curva nova é uma linha aqui.
   Barcelona (Figueras customizado) ainda não entra no registro: depende de
   coeficientes não disponíveis offline; é oferecida via atalho oficial na UI. */
import { hadlock1991 } from './hadlock1991';
import { fmf2018 } from './fmf2018';

export const EFW_REFERENCES = [hadlock1991, fmf2018] as const;

// Atalho para a calculadora oficial Barcelona (modelo Figueras customizado).
export const BARCELONA_CALC_URL = 'https://fetalmedicinebarcelona.org/calc/';
