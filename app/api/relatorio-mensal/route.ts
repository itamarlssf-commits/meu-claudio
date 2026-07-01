// Cron mensal: no último dia do mês, gera um PDF + CSV por funcionária ativa
// com o detalhamento diário de horas trabalhadas, e envia tudo por e-mail
// (Resend) para o empregador. Ver HANDOFF.md seção "Fase 2" para o setup.
//
// Disparo: vercel.json → crons roda este endpoint todo dia às 9h entre os
// dias 28 e 31; aqui verificamos se HOJE é de fato o último dia do mês antes
// de gerar/enviar qualquer coisa (evita disparo duplicado nos outros dias).

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getPontoAdminDb } from '@/lib/firebase-admin';
import { detalheDiarioFuncionaria, gerarCsvFuncionaria, gerarPdfFuncionaria, nomeMes } from '@/lib/relatorio-mensal';
import { formatDuracao } from '@/lib/ponto-logic';
import type { Funcionaria, RegistroPonto } from '@/types/ponto';

export const dynamic = 'force-dynamic';

const EMAIL_DESTINO = process.env.PONTO_RELATORIO_EMAIL_DESTINO || 'itamarlssf@gmail.com';

function ehUltimoDiaDoMes(hoje: Date): boolean {
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  return amanha.getMonth() !== hoje.getMonth();
}

function autorizado(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 });
  }

  const hoje = new Date();
  const params = new URL(request.url).searchParams;
  const forcar = params.get('forcar') === '1';
  const mesParam = params.get('mes'); // 'YYYY-MM' — reenvio manual de um mês específico
  const ateParam = params.get('ate') ?? undefined; // 'YYYY-MM-DD' — limita o período considerado

  if (!mesParam && !forcar && !ehUltimoDiaDoMes(hoje)) {
    return NextResponse.json({ ok: true, mensagem: 'Hoje não é o último dia do mês; nada a fazer.' });
  }

  const ano = mesParam ? Number(mesParam.slice(0, 4)) : hoje.getFullYear();
  const mes = mesParam ? Number(mesParam.slice(5, 7)) : hoje.getMonth() + 1;

  const db = getPontoAdminDb();
  const [funcionariasSnap, registrosSnap] = await Promise.all([
    db.collection('ponto_funcionarias').where('ativo', '==', true).get(),
    db
      .collection('ponto_registros')
      .where('data', '>=', `${ano}-${String(mes).padStart(2, '0')}-01`)
      .where('data', '<=', `${ano}-${String(mes).padStart(2, '0')}-31`)
      .get(),
  ]);

  const funcionarias = funcionariasSnap.docs.map((d) => ({ ...d.data(), id: d.id }) as Funcionaria);
  const registros = registrosSnap.docs.map((d) => ({ ...d.data(), id: d.id }) as RegistroPonto);

  if (funcionarias.length === 0) {
    return NextResponse.json({ ok: true, mensagem: 'Nenhuma funcionária ativa cadastrada.' });
  }

  const anexos: { filename: string; content: Buffer }[] = [];
  const resumoLinhas: string[] = [];
  const resumoPorFuncionaria: {
    nome: string;
    totalMs: number;
    esperadoMs: number;
    extraMs: number;
    faltaMs: number;
  }[] = [];

  for (const func of funcionarias) {
    const admitidaEm = new Date(func.criadoEm).toISOString().slice(0, 10);
    const resumo = detalheDiarioFuncionaria(
      registros,
      func.id,
      ano,
      mes,
      func.jornadaPorDia,
      admitidaEm,
      ateParam,
    );
    const csv = gerarCsvFuncionaria(func.nome, ano, mes, resumo);
    const pdf = await gerarPdfFuncionaria(func.nome, ano, mes, resumo);

    const nomeArquivo = func.nome
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-');
    anexos.push({ filename: `${nomeArquivo}-${ano}-${String(mes).padStart(2, '0')}.csv`, content: Buffer.from(csv, 'utf-8') });
    anexos.push({ filename: `${nomeArquivo}-${ano}-${String(mes).padStart(2, '0')}.pdf`, content: Buffer.from(pdf) });
    resumoLinhas.push(
      `<li><strong>${func.nome}</strong>: ${formatDuracao(resumo.totalMs)} trabalhadas` +
        (resumo.extraMs > 0 ? `, ${formatDuracao(resumo.extraMs)} de hora extra` : '') +
        (resumo.faltaMs > 0 ? `, ${formatDuracao(resumo.faltaMs)} faltantes` : '') +
        `</li>`,
    );
    resumoPorFuncionaria.push({
      nome: func.nome,
      totalMs: resumo.totalMs,
      esperadoMs: resumo.esperadoMs,
      extraMs: resumo.extraMs,
      faltaMs: resumo.faltaMs,
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.PONTO_RELATORIO_EMAIL_ORIGEM || 'Ponto Eletrônico <onboarding@resend.dev>',
    to: EMAIL_DESTINO,
    subject: `Relatório de ponto — ${nomeMes(mes)}/${ano}`,
    html: `
      <p>Relatório mensal de ponto eletrônico (${nomeMes(mes)}/${ano}):</p>
      <ul>${resumoLinhas.join('')}</ul>
      <p>Em anexo: PDF e CSV individuais de cada funcionária.</p>
    `,
    attachments: anexos,
  });

  if (error) {
    return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    funcionarias: funcionarias.length,
    anexos: anexos.length,
    resumo: resumoPorFuncionaria,
  });
}
