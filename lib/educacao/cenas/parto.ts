import type { Cena } from '@/types/educacao';

/**
 * Mecanismo do parto — os movimentos cardinais que o feto executa para
 * atravessar o canal de parto.
 *
 * Referência anatômica: Williams Obstetrics (mecanismo do trabalho de parto
 * em apresentação cefálica, variedade occipito-anterior). Todo o desenho é
 * original, construído a partir da descrição textual.
 */
export const cenaParto: Cena = {
  id: 'parto',
  titulo: 'Mecanismo do parto',
  subtitulo: 'Os sete movimentos que o bebê faz para nascer',
  icone: '◐',
  modo: 'timeline',
  renderer: 'svg',
  etapas: [
    {
      id: 'insinuacao',
      titulo: 'Insinuação',
      progresso: 0,
      narrativa:
        'A cabeça do bebê encaixa na entrada da bacia. É o momento em que ele se posiciona para começar a descida. Muitas mulheres sentem que a barriga baixou e que respirar ficou mais fácil.',
    },
    {
      id: 'descida',
      titulo: 'Descida',
      progresso: 0.18,
      narrativa:
        'O bebê desce pelo canal de parto, empurrado pelas contrações. Essa descida não é em linha reta: ela acompanha uma curva, porque a bacia da mulher é curva por dentro.',
    },
    {
      id: 'flexao',
      titulo: 'Flexão',
      progresso: 0.34,
      narrativa:
        'O bebê encosta o queixo no peito. Isso faz toda a diferença: com o queixo flexionado, ele apresenta a menor parte possível da cabeça, o que facilita muito a passagem.',
    },
    {
      id: 'rotacao-interna',
      titulo: 'Rotação interna',
      progresso: 0.52,
      narrativa:
        'Aqui o bebê gira dentro da bacia. Ele entra olhando para o lado e vai girando até ficar de costas para a barriga da mãe. Ele faz isso sozinho, para se encaixar no formato da saída.',
    },
    {
      id: 'extensao',
      titulo: 'Extensão',
      progresso: 0.7,
      narrativa:
        'A cabeça passa por baixo do osso púbico e o bebê estende o pescoço, levantando o rosto. É neste momento que a cabeça nasce.',
    },
    {
      id: 'rotacao-externa',
      titulo: 'Rotação externa',
      progresso: 0.86,
      narrativa:
        'Com a cabeça já fora, o bebê gira de novo para alinhar os ombros com a saída da bacia. É um movimento natural, que acontece sem que ninguém precise puxar.',
    },
    {
      id: 'expulsao',
      titulo: 'Desprendimento',
      progresso: 1,
      narrativa:
        'Sai primeiro o ombro de cima, depois o de baixo, e o resto do corpo vem em seguida com facilidade. O bebê nasceu.',
    },
  ],
};
