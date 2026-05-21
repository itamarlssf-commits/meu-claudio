'use client';

import type { AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import {
  fmtMoney,
  fmtDate,
  totalPago,
  saldo,
  alertasCobrancaDPP,
  idadeGestacional,
  whatsAppCobranca,
} from '@/lib/business-logic';
import { KPI, Card, Chip, SectionHeader, MiniBar, Donut, Progress } from '@/components/ui';

interface Props {
  data: AppData;
  onOpenPaciente: (id: string) => void;
}

export default function Dashboard({ data, onOpenPaciente }: Props) {
  const { pacientes } = data;

  // KPIs
  const totalContrato = pacientes.reduce((s, p) => s + p.contrato, 0);
  const totalRecebido = pacientes.reduce((s, p) => s + totalPago(p), 0);
  const totalSaldo = pacientes.reduce((s, p) => s + saldo(p), 0);
  const pagasCount = pacientes.filter((p) => p.status === 'pago').length;
  const parciaisCount = pacientes.filter((p) => p.status === 'parcial').length;
  const pendentesCount = pacientes.filter((p) => p.status === 'pendente').length;

  // Alertas urgentes
  const urgentes = pacientes
    .map((p) => ({ p, alertas: alertasCobrancaDPP(p) }))
    .filter((x) => x.alertas.length > 0)
    .sort((a, b) => (a.alertas[0]?.diasRestantes ?? 999) - (b.alertas[0]?.diasRestantes ?? 999));

  // Partos próximos (DPP nos próximos 90 dias, não realizado)
  const hoje = new Date();
  const proximosPartos = pacientes
    .filter((p) => {
      if (p.partoRealizado) return false;
      if (!p.dpp) return false;
      const dias = Math.round((new Date(p.dpp).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return dias >= 0 && dias <= 90;
    })
    .sort((a, b) => (a.dpp || '').localeCompare(b.dpp || ''));

  // Origem distribution
  const origensMap: Record<string, number> = {};
  pacientes.forEach((p) => {
    origensMap[p.origem] = (origensMap[p.origem] || 0) + 1;
  });
  const origensData = Object.entries(origensMap).map(([label, value]) => ({ label, value, short: label.slice(0, 4) }));

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 22,
            fontWeight: 700,
            color: TOKENS.primary,
            margin: 0,
          }}
        >
          Visão Geral
        </h1>
        <p style={{ fontSize: 13, color: TOKENS.muted, marginTop: 4, marginBottom: 0 }}>
          {pacientes.length} pacientes · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        <KPI
          label="Total Contratos"
          value={fmtMoney(totalContrato)}
          accent={TOKENS.primary}
          icon="📋"
        />
        <KPI
          label="Recebido"
          value={fmtMoney(totalRecebido)}
          sub={`${Math.round((totalRecebido / totalContrato) * 100) || 0}% do total`}
          accent={TOKENS.green}
          icon="✓"
        />
        <KPI
          label="A Receber"
          value={fmtMoney(totalSaldo)}
          accent={TOKENS.amber}
          icon="⏳"
        />
        <KPI
          label="Pacientes"
          value={pacientes.length}
          sub={`${pagasCount} pagas · ${parciaisCount} parciais · ${pendentesCount} pendentes`}
          accent={TOKENS.blue}
          icon="👤"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Status breakdown */}
        <Card>
          <SectionHeader title="Status Financeiro" />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Donut
              slices={[
                { value: pagasCount, color: TOKENS.green, label: 'Pagas' },
                { value: parciaisCount, color: TOKENS.amber, label: 'Parciais' },
                { value: pendentesCount, color: TOKENS.red, label: 'Pendentes' },
              ]}
              size={110}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Pagas', count: pagasCount, color: TOKENS.green },
              { label: 'Parciais', count: parciaisCount, color: TOKENS.amber },
              { label: 'Pendentes', count: pendentesCount, color: TOKENS.red },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, flex: 1, color: TOKENS.ink2 }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.ink }}>{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Origem */}
        <Card>
          <SectionHeader title="Captação" subtitle="Por origem" />
          <MiniBar data={origensData} color={TOKENS.primary2} height={80} />
        </Card>

        {/* Faturamento por status */}
        <Card>
          <SectionHeader title="Faturamento" subtitle="Contratado vs recebido" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: TOKENS.muted }}>
                <span>Recebido</span>
                <span style={{ fontWeight: 700, color: TOKENS.green }}>{fmtMoney(totalRecebido)}</span>
              </div>
              <Progress value={Math.round((totalRecebido / Math.max(totalContrato, 1)) * 100)} color={TOKENS.green} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: TOKENS.muted }}>
                <span>Pendente</span>
                <span style={{ fontWeight: 700, color: TOKENS.amber }}>{fmtMoney(totalSaldo)}</span>
              </div>
              <Progress value={Math.round((totalSaldo / Math.max(totalContrato, 1)) * 100)} color={TOKENS.amber} />
            </div>
          </div>
        </Card>
      </div>

      {/* Alertas urgentes */}
      {urgentes.length > 0 && (
        <Card>
          <SectionHeader
            title="⚡ Cobranças Urgentes"
            subtitle="Pacientes com saldo pendente próximas da DPP"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {urgentes.slice(0, 5).map(({ p, alertas }) => (
              <div
                key={p.id}
                onClick={() => onOpenPaciente(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#fff7ed',
                  border: '1px solid #fef3c7',
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: TOKENS.muted }}>
                    DPP: {fmtDate(p.dpp)} · {alertas[0].diasRestantes} dias · Saldo: {fmtMoney(saldo(p))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {alertas.map((a) => (
                    <Chip key={a.label} color="red" size="xs">{a.label}</Chip>
                  ))}
                </div>
                <a
                  href={whatsAppCobranca(p)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '5px 10px',
                    borderRadius: 7,
                    background: '#25d366',
                    color: '#fff',
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  📱 WA
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Próximos partos */}
      {proximosPartos.length > 0 && (
        <Card>
          <SectionHeader title="🤱 Partos Próximos" subtitle="Próximos 90 dias" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 10,
            }}
          >
            {proximosPartos.map((p) => {
              const diasRestantes = Math.round(
                (new Date(p.dpp).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
              );
              const ig = idadeGestacional(p.dum);
              const urgente = diasRestantes <= 30;
              return (
                <div
                  key={p.id}
                  onClick={() => onOpenPaciente(p.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: urgente ? '#fff7ed' : '#f9fafb',
                    border: `1px solid ${urgente ? '#fef3c7' : TOKENS.line2}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink, marginBottom: 4 }}>
                    {p.nome.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 12, color: TOKENS.muted }}>DPP: {fmtDate(p.dpp)}</div>
                  {ig && (
                    <div style={{ fontSize: 12, color: TOKENS.blue }}>
                      IG: {ig.semanas}s {ig.dias}d
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      color: urgente ? TOKENS.amber : TOKENS.muted,
                    }}
                  >
                    {diasRestantes} dias restantes
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
