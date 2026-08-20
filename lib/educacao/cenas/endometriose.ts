import type { Cena } from '@/types/educacao';

/**
 * Mapa pélvico de endometriose — cada foco é uma camada que pode ser ligada
 * ou desligada, permitindo montar na consulta o mapa daquela paciente.
 *
 * Localizações e correlação clínica conforme a classificação anatômica usual
 * (endometriose superficial, ovariana e profunda). Desenho original.
 */
export const cenaEndometriose: Cena = {
  id: 'endometriose',
  titulo: 'Endometriose',
  subtitulo: 'Onde ficam os focos e o sintoma de cada um',
  icone: '◈',
  modo: 'camadas',
  renderer: 'svg',
  camadas: [
    {
      id: 'ovario',
      titulo: 'Ovário (endometrioma)',
      cor: '#8b5cf6',
      ativaPorPadrao: true,
      sintomas: [
        'Dor pélvica que piora na menstruação',
        'Cisto visto no ultrassom (cisto achocolatado)',
        'Pode afetar a reserva de óvulos',
      ],
    },
    {
      id: 'douglas',
      titulo: 'Fundo de saco de Douglas',
      cor: '#ec4899',
      ativaPorPadrao: true,
      sintomas: [
        'Dor profunda na relação sexual',
        'Dor que piora ao sentar por muito tempo',
        'Sensação de peso na parte baixa da barriga',
      ],
    },
    {
      id: 'uterossacros',
      titulo: 'Ligamentos uterossacros',
      cor: '#f59e0b',
      ativaPorPadrao: false,
      sintomas: [
        'Dor lombar baixa cíclica',
        'Dor profunda na relação sexual',
        'Dor que irradia para o reto',
      ],
    },
    {
      id: 'bexiga',
      titulo: 'Bexiga',
      cor: '#3b82f6',
      ativaPorPadrao: false,
      sintomas: [
        'Dor ao urinar durante a menstruação',
        'Vontade frequente de urinar no período menstrual',
        'Sangue na urina na menstruação (raro)',
      ],
    },
    {
      id: 'intestino',
      titulo: 'Intestino (retossigmoide)',
      cor: '#10b981',
      ativaPorPadrao: false,
      sintomas: [
        'Dor para evacuar durante a menstruação',
        'Alternância entre prisão de ventre e diarreia no período',
        'Sangramento nas fezes na menstruação (raro)',
      ],
    },
    {
      id: 'septo',
      titulo: 'Septo retovaginal',
      cor: '#ef4444',
      ativaPorPadrao: false,
      sintomas: [
        'Dor profunda e intensa na relação sexual',
        'Dor no períneo e no reto',
        'Costuma ser a forma mais profunda da doença',
      ],
    },
  ],
};
