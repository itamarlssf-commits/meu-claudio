'use client';

import type { AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import {
  fmtDate,
  idadeGestacional,
  proximasConsultas,
  whatsAppLembreteConsulta,
  gcalLink,
} from '@/lib/business-logic';
import { KPI, Card, SectionHeader, Chip, Empty } from '@/components/ui';

interface Props {
  data: AppData;
  onOpenPaciente: (id: string) => void;
}

export default function AgendaView({ data, onOpenPaciente }: Props) {
  const { pacientes } = data;
  const hoje = new Date();
  const todayStr = hoje.toISOString().split('T')[0];

  // Build upcoming consultations for next 30 days
  type ConsultaItem = {
    pacienteId: string;
    nome: string;
    semana: number;
    data: string;
    especial: string | null;
    realizada: boolean;
  };

  const proximas: ConsultaItem[] = [];
  pacientes.forEach((p) => {
    if (p.partoRealizado) return;
    const sugeridas = proximasConsultas(p.dum);
    sugeridas.forEach((s) => {
      if (s.data < todayStr) return;
      const diff = Math.round((new Date(s.data).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 30) return;
      const realizada = p.consultas.find((c) => c.semana === s.semana)?.realizada || false;
      proximas.push({
        pacienteId: p.id,
        nome: p.nome,
        semana: s.semana,
        data: s.data,
        especial: s.especial,
        realizada,
      });
    });
  });
  proximas.sort((a, b) => a.data.localeCompare(b.data));

  // Partos próximos (DPP 60 dias)
  const partosProximos = pacientes
    .filter((p) => {
      if (p.partoRealizado || !p.dpp) return false;
      const dias = Math.round((new Date(p.dpp).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return dias >= 0 && dias <= 60;
    })
    .sort((a, b) => (a.dpp || '').localeCompare(b.dpp || ''));

  const consultasHoje = proximas.filter((c) => c.data === todayStr);

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <SectionHeader title="Agenda" subtitle="Consultas e partos programados" />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        <KPI label="Consultas Hoje" value={consultasHoje.length} accent={TOKENS.blue} icon="📅" />
        <KPI label="Próximos 30 dias" value={proximas.length} accent={TOKENS.primary} icon="📋" />
        <KPI label="Partos próximos" value={partosProximos.length} sub="Próximos 60 dias" accent={TOKENS.pink} icon="🤱" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Próximas consultas */}
        <Card>
          <SectionHeader title="📅 Próximas Consultas" subtitle="Próximos 30 dias" />
          {proximas.length === 0 ? (
            <Empty title="Sem consultas nos próximos 30 dias" icon="📅" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {proximas.map((c, i) => {
                const paciente = pacientes.find((p) => p.id === c.pacienteId)!;
                const waLink = whatsAppLembreteConsulta(paciente, c.data);
                const calLink = gcalLink(
                  `Consulta ${c.nome.split(' ')[0]} — ${c.semana}s`,
                  c.data,
                  '09:00',
                  `Consulta obstétrica ${c.semana} semanas${c.especial ? ` (${c.especial})` : ''}`
                );
                const isHoje = c.data === todayStr;

                return (
                  <div
                    key={i}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: isHoje ? TOKENS.blueSoft : c.realizada ? '#f0fdf4' : TOKENS.line2,
                      border: isHoje ? `1px solid ${TOKENS.blue}` : 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => onOpenPaciente(c.pacienteId)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>
                          {c.nome.split(' ')[0]} {c.nome.split(' ')[1]}
                        </span>
                        {' · '}
                        <span style={{ fontSize: 12, color: TOKENS.muted }}>{c.semana}s</span>
                        {c.especial && <Chip color="purple" size="xs" >{c.especial}</Chip>}
                      </div>
                      <div style={{ fontSize: 12, color: isHoje ? TOKENS.blue : TOKENS.muted, fontWeight: isHoje ? 700 : 400 }}>
                        {isHoje ? 'HOJE' : fmtDate(c.data)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 7px',
                          borderRadius: 4,
                          background: '#25d366',
                          color: '#fff',
                          textDecoration: 'none',
                        }}
                      >
                        WA Lembrete
                      </a>
                      <a
                        href={calLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 7px',
                          borderRadius: 4,
                          background: TOKENS.blueSoft,
                          color: TOKENS.blue,
                          textDecoration: 'none',
                        }}
                      >
                        📅 Agendar
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Partos próximos */}
        <Card>
          <SectionHeader title="🤱 Partos Próximos" subtitle="DPP nos próximos 60 dias" />
          {partosProximos.length === 0 ? (
            <Empty title="Sem partos nos próximos 60 dias" icon="🤱" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {partosProximos.map((p) => {
                const diasRestantes = Math.round(
                  (new Date(p.dpp).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
                );
                const ig = idadeGestacional(p.dum);
                const urgente = diasRestantes <= 14;

                return (
                  <div
                    key={p.id}
                    onClick={() => onOpenPaciente(p.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: urgente ? '#fff7ed' : TOKENS.line2,
                      border: urgente ? '1px solid #fef3c7' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>{p.nome}</div>
                        <div style={{ fontSize: 12, color: TOKENS.muted }}>
                          DPP: {fmtDate(p.dpp)}
                          {ig && ` · IG: ${ig.semanas}s ${ig.dias}d`}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: urgente ? TOKENS.amber : TOKENS.muted,
                          textAlign: 'right',
                        }}
                      >
                        {diasRestantes}d
                      </div>
                    </div>
                    <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                      <Chip color={urgente ? 'amber' : 'blue'} size="xs">{p.via}</Chip>
                      {urgente && <Chip color="red" size="xs">Urgente</Chip>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
