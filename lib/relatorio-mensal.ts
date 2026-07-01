// Geração do relatório mensal (Fase 2): detalhamento diário por funcionária,
// exportado em CSV e PDF para envio por e-mail no fim do mês.

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { RegistroPonto } from '@/types/ponto';
import { agruparPorDia, parearRegistros, formatDuracao, formatDataBR } from '@/lib/ponto-logic';

export interface DiaDetalhe {
  data: string; // 'YYYY-MM-DD'
  totalMs: number;
}

/** Detalhamento dia a dia de uma funcionária no mês informado (1-12), ordenado por data. */
export function detalheDiarioFuncionaria(
  registros: RegistroPonto[],
  funcionariaId: string,
  ano: number,
  mes: number,
): { dias: DiaDetalhe[]; totalMs: number } {
  const prefixo = `${ano}-${String(mes).padStart(2, '0')}`;
  const doMes = registros.filter(
    (r) => r.funcionariaId === funcionariaId && r.data.startsWith(prefixo),
  );
  const porDia = agruparPorDia(doMes);
  const dias: DiaDetalhe[] = [];
  let totalMs = 0;
  Array.from(porDia.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([data, regsDoDia]) => {
      const { totalMs: t } = parearRegistros(regsDoDia);
      dias.push({ data, totalMs: t });
      totalMs += t;
    });
  return { dias, totalMs };
}

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function nomeMes(mes: number): string {
  return MESES_PT[mes - 1] ?? String(mes);
}

/** CSV simples (separador ';' para abrir bem no Excel PT-BR). */
export function gerarCsvFuncionaria(
  funcionariaNome: string,
  ano: number,
  mes: number,
  dias: DiaDetalhe[],
  totalMs: number,
): string {
  const linhas = [
    `Funcionária;${funcionariaNome}`,
    `Mês de referência;${nomeMes(mes)}/${ano}`,
    '',
    'Data;Horas trabalhadas',
    ...dias.map((d) => `${formatDataBR(d.data)};${formatDuracao(d.totalMs)}`),
    '',
    `Total do mês;${formatDuracao(totalMs)}`,
  ];
  return linhas.join('\r\n');
}

/** PDF simples de uma página (ou mais, se o mês tiver muitos dias) com tabela dia/horas. */
export async function gerarPdfFuncionaria(
  funcionariaNome: string,
  ano: number,
  mes: number,
  dias: DiaDetalhe[],
  totalMs: number,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fonte = await pdf.embedFont(StandardFonts.Helvetica);
  const fonteNegrito = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margem = 50;
  const alturaPagina = 792; // Letter
  const larguraPagina = 612;
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

  escrever('Relatório de Ponto Eletrônico', 18, true);
  escrever(`Funcionária: ${funcionariaNome}`, 12, true);
  escrever(`Mês de referência: ${nomeMes(mes)}/${ano}`, 12);
  y -= 10;

  escrever('Data', 11, true);
  y += 19; // volta pra desenhar a coluna ao lado do cabeçalho "Data"
  pagina.drawText('Horas trabalhadas', {
    x: margem + 150,
    y,
    size: 11,
    font: fonteNegrito,
  });
  y -= 19;
  pagina.drawLine({
    start: { x: margem, y: y + 6 },
    end: { x: larguraPagina - margem, y: y + 6 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 8;

  for (const dia of dias) {
    if (y < margem + 60) {
      pagina = pdf.addPage([larguraPagina, alturaPagina]);
      y = alturaPagina - margem;
    }
    pagina.drawText(formatDataBR(dia.data), { x: margem, y, size: 11, font: fonte });
    pagina.drawText(formatDuracao(dia.totalMs), { x: margem + 150, y, size: 11, font: fonte });
    y -= 18;
  }

  if (y < margem + 40) {
    pagina = pdf.addPage([larguraPagina, alturaPagina]);
    y = alturaPagina - margem;
  }
  y -= 10;
  pagina.drawLine({
    start: { x: margem, y: y + 14 },
    end: { x: larguraPagina - margem, y: y + 14 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  pagina.drawText(`Total do mês: ${formatDuracao(totalMs)}`, {
    x: margem,
    y,
    size: 13,
    font: fonteNegrito,
  });

  return pdf.save();
}
