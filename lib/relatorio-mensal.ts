// Geração do relatório mensal (Fase 2): detalhamento diário por funcionária,
// com horas extras/faltantes vs. jornada contratual, exportado em CSV e PDF
// para envio por e-mail no fim do mês.

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { JornadaPorDia, RegistroPonto } from '@/types/ponto';
import {
  agruparPorDia,
  parearRegistros,
  formatDuracao,
  formatDataBR,
  diaDaSemana,
  descreverJornada,
  somaSemanal,
  JORNADA_PADRAO,
} from '@/lib/ponto-logic';

export interface DiaDetalhe {
  data: string; // 'YYYY-MM-DD'
  totalMs: number;
  esperadoMs: number;
  extraMs: number;
  faltaMs: number;
}

/**
 * Detalhamento dia a dia de uma funcionária no mês informado (1-12), com
 * horas extras (trabalhado acima do esperado) e faltantes (abaixo do
 * esperado) por dia, comparado ao horário contratual de cada dia da semana
 * (`jornadaPorDia`, índice 0 = domingo … 6 = sábado).
 *
 * `admitidaEm` (data de admissão) e `ateData` (normalmente "hoje") limitam
 * quais dias entram como "esperado" — evita contar como falta dias antes da
 * funcionária ser contratada ou dias futuros do mês em curso.
 */
export function detalheDiarioFuncionaria(
  registros: RegistroPonto[],
  funcionariaId: string,
  ano: number,
  mes: number,
  jornadaPorDia: JornadaPorDia = JORNADA_PADRAO,
  admitidaEm?: string, // 'YYYY-MM-DD'
  ateData?: string, // 'YYYY-MM-DD', default: hoje
): ResumoMensal {
  const prefixo = `${ano}-${String(mes).padStart(2, '0')}`;
  const doMes = registros.filter(
    (r) => r.funcionariaId === funcionariaId && r.data.startsWith(prefixo),
  );
  const porDia = agruparPorDia(doMes);

  const limiteInferior = admitidaEm && admitidaEm > `${prefixo}-01` ? admitidaEm : `${prefixo}-01`;
  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  const limiteSuperior = ateData ?? hojeStr;

  // Garante uma linha para cada dia útil do mês dentro da janela admissão↔hoje,
  // mesmo sem nenhum registro (isso é o que aparece como falta integral do dia).
  const datasDoMes = new Set<string>();
  const ultimoDia = new Date(ano, mes, 0).getDate();
  for (let dia = 1; dia <= ultimoDia; dia++) {
    const data = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    if (data >= limiteInferior && data <= limiteSuperior) datasDoMes.add(data);
  }
  porDia.forEach((_, data) => datasDoMes.add(data));

  const dias: DiaDetalhe[] = [];
  let totalMs = 0;
  let esperadoMs = 0;
  let extraMs = 0;
  let faltaMs = 0;

  Array.from(datasDoMes)
    .sort((a, b) => a.localeCompare(b))
    .forEach((data) => {
      const regsDoDia = porDia.get(data) ?? [];
      const { totalMs: t } = parearRegistros(regsDoDia);
      const esperado = jornadaPorDia[diaDaSemana(data)] * 3600000;
      const extra = Math.max(0, t - esperado);
      const falta = Math.max(0, esperado - t);

      // Só entra na lista detalhada se houve trabalho ou era dia útil esperado
      // (evita listar fins de semana vazios sem nenhum sentido no relatório).
      if (t > 0 || esperado > 0) {
        dias.push({ data, totalMs: t, esperadoMs: esperado, extraMs: extra, faltaMs: falta });
      }

      totalMs += t;
      esperadoMs += esperado;
      extraMs += extra;
      faltaMs += falta;
    });

  return { dias, totalMs, esperadoMs, extraMs, faltaMs, jornadaPorDia };
}

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function nomeMes(mes: number): string {
  return MESES_PT[mes - 1] ?? String(mes);
}

export interface ResumoMensal {
  dias: DiaDetalhe[];
  totalMs: number;
  esperadoMs: number;
  extraMs: number;
  faltaMs: number;
  jornadaPorDia: JornadaPorDia;
}

/** CSV simples (separador ';' para abrir bem no Excel PT-BR). */
export function gerarCsvFuncionaria(
  funcionariaNome: string,
  ano: number,
  mes: number,
  resumo: ResumoMensal,
): string {
  const linhas = [
    `Funcionária;${funcionariaNome}`,
    `Mês de referência;${nomeMes(mes)}/${ano}`,
    `Jornada contratual;${somaSemanal(resumo.jornadaPorDia)}h/semana (${descreverJornada(resumo.jornadaPorDia)})`,
    '',
    'Data;Horas trabalhadas;Esperado;Hora extra;Horas faltantes',
    ...resumo.dias.map(
      (d) =>
        `${formatDataBR(d.data)};${formatDuracao(d.totalMs)};${formatDuracao(d.esperadoMs)};${formatDuracao(d.extraMs)};${formatDuracao(d.faltaMs)}`,
    ),
    '',
    `Total trabalhado no mês;${formatDuracao(resumo.totalMs)}`,
    `Total esperado no mês;${formatDuracao(resumo.esperadoMs)}`,
    `Total de horas extras;${formatDuracao(resumo.extraMs)}`,
    `Total de horas faltantes;${formatDuracao(resumo.faltaMs)}`,
  ];
  return linhas.join('\r\n');
}

/** PDF com tabela dia/horas (trabalhado, esperado, extra, falta) + resumo do mês. */
export async function gerarPdfFuncionaria(
  funcionariaNome: string,
  ano: number,
  mes: number,
  resumo: ResumoMensal,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fonte = await pdf.embedFont(StandardFonts.Helvetica);
  const fonteNegrito = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margem = 50;
  const alturaPagina = 792; // Letter
  const larguraPagina = 612;
  const colunas = [margem, margem + 110, margem + 230, margem + 340, margem + 440];
  let pagina = pdf.addPage([larguraPagina, alturaPagina]);
  let y = alturaPagina - margem;

  const escrever = (texto: string, tamanho: number, negrito = false, cor = rgb(0.05, 0.05, 0.05)) => {
    pagina.drawText(texto, {
      x: margem,
      y,
      size: tamanho,
      font: negrito ? fonteNegrito : fonte,
      color: cor,
    });
    y -= tamanho + 8;
  };

  const linhaColunas = (valores: string[], negrito = false, tamanho = 10) => {
    valores.forEach((v, i) => {
      pagina.drawText(v, { x: colunas[i], y, size: tamanho, font: negrito ? fonteNegrito : fonte });
    });
    y -= tamanho + 8;
  };

  escrever('Relatório de Ponto Eletrônico', 18, true);
  escrever(`Funcionária: ${funcionariaNome}`, 12, true);
  escrever(`Mês de referência: ${nomeMes(mes)}/${ano}`, 12);
  escrever(
    `Jornada contratual: ${somaSemanal(resumo.jornadaPorDia)}h/semana (${descreverJornada(resumo.jornadaPorDia)})`,
    11,
  );
  y -= 6;

  linhaColunas(['Data', 'Trabalhado', 'Esperado', 'Hora extra', 'Falta'], true, 10);
  pagina.drawLine({
    start: { x: margem, y: y + 6 },
    end: { x: larguraPagina - margem, y: y + 6 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 6;

  for (const dia of resumo.dias) {
    if (y < margem + 90) {
      pagina = pdf.addPage([larguraPagina, alturaPagina]);
      y = alturaPagina - margem;
    }
    linhaColunas([
      formatDataBR(dia.data),
      formatDuracao(dia.totalMs),
      formatDuracao(dia.esperadoMs),
      dia.extraMs > 0 ? formatDuracao(dia.extraMs) : '—',
      dia.faltaMs > 0 ? formatDuracao(dia.faltaMs) : '—',
    ]);
  }

  if (y < margem + 90) {
    pagina = pdf.addPage([larguraPagina, alturaPagina]);
    y = alturaPagina - margem;
  }
  y -= 6;
  pagina.drawLine({
    start: { x: margem, y: y + 14 },
    end: { x: larguraPagina - margem, y: y + 14 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  escrever(`Total trabalhado no mês: ${formatDuracao(resumo.totalMs)}`, 12, true);
  escrever(`Total esperado no mês: ${formatDuracao(resumo.esperadoMs)}`, 11);
  escrever(`Total de horas extras: ${formatDuracao(resumo.extraMs)}`, 11, true, rgb(0.02, 0.4, 0.15));
  escrever(`Total de horas faltantes: ${formatDuracao(resumo.faltaMs)}`, 11, true, rgb(0.6, 0.1, 0.1));

  return pdf.save();
}
