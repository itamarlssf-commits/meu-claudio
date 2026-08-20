import type { Cena } from '@/types/educacao';

/**
 * Ciclo menstrual em 28 dias — linha do tempo com camadas opcionais, para
 * ajustar a profundidade da explicação ao interesse de cada paciente.
 */
export const cenaCiclo: Cena = {
  id: 'ciclo',
  titulo: 'Ciclo menstrual e fluxo',
  subtitulo: 'O que acontece a cada dia, e o que é sangramento aumentado',
  icone: '◑',
  modo: 'timeline',
  renderer: 'svg',
  etapas: [
    {
      id: 'menstruacao',
      titulo: 'Menstruação',
      progresso: 0,
      narrativa:
        'Do dia 1 ao 5. A camada interna do útero, que tinha sido preparada para receber uma gravidez, descama e sai. É a menstruação.',
    },
    {
      id: 'folicular',
      titulo: 'Fase folicular',
      progresso: 0.18,
      narrativa:
        'Do dia 6 ao 13. Um folículo no ovário amadurece e o útero começa a reconstruir a camada interna, que vai engrossando dia após dia.',
    },
    {
      id: 'ovulacao',
      titulo: 'Ovulação',
      progresso: 0.5,
      narrativa:
        'Por volta do dia 14. O folículo se rompe e libera o óvulo. É o período mais fértil do ciclo. Algumas mulheres sentem uma fisgada de um lado só.',
    },
    {
      id: 'lutea',
      titulo: 'Fase lútea',
      progresso: 0.6,
      narrativa:
        'Do dia 15 ao 28. O que sobrou do folículo vira o corpo lúteo e produz progesterona, deixando o útero pronto para uma gravidez.',
    },
    {
      id: 'reinicio',
      titulo: 'Recomeço',
      progresso: 0.93,
      narrativa:
        'Se não houve gravidez, a progesterona cai, a camada interna não se sustenta mais e descama. O ciclo recomeça no dia 1.',
    },
  ],
  camadas: [
    {
      id: 'hormonios',
      titulo: 'Curvas hormonais',
      cor: '#2c5282',
      ativaPorPadrao: false,
      sintomas: [
        'Estrogênio sobe até a ovulação e prepara o endométrio',
        'O pico de LH é o gatilho que rompe o folículo',
        'A progesterona sobe depois da ovulação e cai no fim do ciclo',
      ],
    },
    {
      id: 'fluxo',
      titulo: 'Escala de fluxo',
      cor: '#ef4444',
      ativaPorPadrao: false,
      sintomas: [
        'Trocar absorvente a cada 2 horas ou menos indica fluxo aumentado',
        'Coágulos maiores que uma moeda merecem investigação',
        'Sangramento além de 7 dias não é considerado normal',
      ],
    },
  ],
};
