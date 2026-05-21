'use client';

import { useState } from 'react';
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

const MESES_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function Dashboard({ data, onOpenPaciente }: Props) {
  const { pacientes } = data;
  const anoAtual = new Date().getFullYear();
  const [statsAno, setStatsAno] = useState(anoAtual);

  // KPIs financeiros
  const totalContrato  = pacientes.reduce((s, p) => s + p.contrato, 0);
  const totalRecebido  = pacientes.reduce((s, p) => s + totalPago(p), 0);
  const totalSaldo     = pacientes.reduce((s, p) => s + saldo(p), 0);
  const pagasCount     = pacientes.filter((p) => p.status === 'pago').length;
  const parciaisCount  = pacientes.filter((p) => p.status === 'parcial').length;
  const pendentesCount = pacientes.filter((p) => p.status === 'pendente').length;

  // Alertas urgentes
  const urgentes = pacientes
    .map((p) => ({ p, alertas: alertasCobrancaDPP(p) }))
    .filter((x) => x.alertas.length > 0)
    .sort((a, b) => (a.alertas[0]?.diasRestantes ?? 999) - (b.alertas[0]?.diasRestantes ?? 999));

  // Partos próximos
  const hoje = new Date();
  const proximosPartos = pacientes
    .filter((p) => {
      if (p.partoRealizado || !p.dpp) return false;
      const dias = Math.round((new Date(p.dpp).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return dias >= 0 && dias <= 90;
    })
    .sort((a, b) => (a.dpp || '').localeCompare(b.dpp || ''));

  // Captação por origem
  const origensMap: Record<string, number> = {};
  pacientes.forEach((p) => { origensMap[p.origem] = (origensMap[p.origem] || 0) + 1; });
  const origensData = Object.entries(origensMap).map(([label, value]) => ({
    label, value, short: label.slice(0, 5),
  }));

  // ── Estatísticas de Partos ──
  const partosRealizados = pacientes.filter((p) => p.partoRealizado && p.dataPartoReal);
  const anosSet = new Set([anoAtual, ...partosRealizados.map((p) => new Date(p.dataPartoReal!).getFullYear())]);
  const anosDisponiveis = Array.from(anosSet).sort();

  const partosAno    = partosRealizados.filter((p) => new Date(p.dataPartoReal!).getFullYear() === statsAno);
  const normalAno    = partosAno.filter((p) => p.via === 'Normal').length;
  const cesariaAno   = partosAno.filter((p) => p.via === 'Cesária').length;
  const normalTotal  = partosRealizados.filter((p) => p.via === 'Normal').length;
  const cesariaTotal = partosRealizados.filter((p) => p.via === 'Cesária').length;

  const barMeses = MESES_PT.map((m, i) => ({
    label: m, short: m,
    value: partosAno.filter((p) => new Date(p.dataPartoReal!).getMonth() === i).length,
  })).filter((_, i) => {
    // mostra apenas meses até o mês atual (no ano atual) ou todos (anos anteriores)
    if (statsAno < anoAtual) return true;
    return i <= hoje.getMonth();
  });

  const thStyle = {
    textAlign: 'left' as const,
    padding: '9px 12px',
    fontSize: 11,
    fontWeight: 700 as const,
    color: TOKENS.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: `2px solid ${TOKENS.line}`,
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1140, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Título */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: TOKENS.primary, margin: 0, letterSpacing: '-0.02em' }}>
            Visão Geral
          </h1>
          <p style={{ fontSize: 13, color: TOKENS.muted, marginTop: 3, marginBottom: 0 }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: `${TOKENS.primary}0d`, border: `1px solid ${TOKENS.primary}25`,
          borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600, color: TOKENS.primary,
        }}>
          {pacientes.length} pacientes
        </div>
      </div>

      {/* KPIs — linha completa */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KPI label="Total Contratos" value={fmtMoney(totalContrato)} accent={TOKENS.primary} icon="📋" />
        <KPI label="Recebido"        value={fmtMoney(totalRecebido)}
          sub={`${Math.round((totalRecebido / Math.max(totalContrato,1)) * 100)}% do total`}
          accent={TOKENS.green} icon="✓" />
        <KPI label="A Receber"       value={fmtMoney(totalSaldo)} accent={TOKENS.amber} icon="⏳" />
        <KPI label="Pacientes"       value={pacientes.length}
          sub={`${pagasCount} pagas · ${parciaisCount} parciais · ${pendentesCount} pendentes`}
          accent={TOKENS.blue} icon="👤" />
      </div>

      {/* Linha de cards analíticos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 16 }}>

        {/* Status financeiro */}
        <Card>
          <SectionHeader title="Status Financeiro" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Donut
              slices={[
                { value: pagasCount,     color: TOKENS.green, label: 'Pagas' },
                { value: parciaisCount,  color: TOKENS.amber, label: 'Parciais' },
                { value: pendentesCount, color: TOKENS.red,   label: 'Pendentes' },
              ]}
              size={96}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Pagas',     count: pagasCount,     color: TOKENS.green },
                { label: 'Parciais',  count: parciaisCount,  color: TOKENS.amber },
                { label: 'Pendentes', count: pendentesCount, color: TOKENS.red },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, flex: 1, color: TOKENS.ink2 }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TOKENS.ink }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Faturamento inline */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Recebido', value: totalRecebido, color: TOKENS.green },
              { label: 'Pendente', value: totalSaldo,    color: TOKENS.amber },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3, color: TOKENS.muted }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color, fontFeatureSettings: '"tnum"' }}>{fmtMoney(item.value)}</span>
                </div>
                <Progress value={Math.round((item.value / Math.max(totalContrato, 1)) * 100)} color={item.color} />
              </div>
            ))}
          </div>
        </Card>

        {/* Captação */}
        <Card>
          <SectionHeader title="Captação" subtitle="Por origem" />
          <MiniBar data={origensData} color={TOKENS.primary2} height={90} />
        </Card>

        {/* ── Estatísticas de Partos ── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TOKENS.primary, letterSpacing: '-0.01em' }}>
                Partos Realizados
              </div>
              <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 2 }}>
                Normal vs Cesária · total: {normalTotal + cesariaTotal}
              </div>
            </div>
            <select
              value={statsAno}
              onChange={(e) => setStatsAno(parseInt(e.target.value))}
              style={{
                fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 7,
                border: `1.5px solid ${TOKENS.line}`, background: '#fff',
                color: TOKENS.primary, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {anosDisponiveis.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <Donut
              slices={[
                { value: normalAno,   color: TOKENS.blue,   label: 'Normal' },
                { value: cesariaAno,  color: TOKENS.purple, label: 'Cesária' },
              ]}
              size={84}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Normal',  value: normalAno,  total: normalTotal,  color: TOKENS.blue },
                { label: 'Cesária', value: cesariaAno, total: cesariaTotal, color: TOKENS.purple },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: TOKENS.ink2, minWidth: 56 }}>{item.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: TOKENS.ink }}>{item.value}</span>
                  <span style={{ fontSize: 11, color: TOKENS.muted }}>/ {item.total} total</span>
                </div>
              ))}
              {normalAno + cesariaAno === 0 && (
                <div style={{ fontSize: 12, color: TOKENS.muted }}>Nenhum parto em {statsAno}</div>
              )}
            </div>
          </div>

          {/* Barra mensal */}
          {barMeses.some((m) => m.value > 0) && (
            <MiniBar
              data={barMeses}
              color={TOKENS.blue}
              height={48}
              showValues={false}
            />
          )}
        </Card>
      </div>

      {/* Cobranças urgentes */}
      {urgentes.length > 0 && (
        <Card>
          <SectionHeader
            title="⚡ Cobranças Urgentes"
            subtitle="Pacientes com saldo pendente próximas da DPP"
          />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {['Paciente', 'DPP', 'Dias', 'Saldo', 'Alertas', ''].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {urgentes.slice(0, 6).map(({ p, alertas }) => (
                <tr
                  key={p.id}
                  className="data-row"
                  onClick={() => onOpenPaciente(p.id)}
                  style={{ borderBottom: `1px solid ${TOKENS.line2}`, cursor: 'pointer' }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: TOKENS.ink }}>{p.nome}</td>
                  <td style={{ padding: '10px 12px', color: TOKENS.muted, fontSize: 13 }}>{fmtDate(p.dpp)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: (alertas[0]?.diasRestantes ?? 99) <= 30 ? TOKENS.red : TOKENS.amber,
                      fontFeatureSettings: '"tnum"',
                    }}>
                      {alertas[0]?.diasRestantes}d
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: TOKENS.amber, fontSize: 13 }}>
                    {fmtMoney(saldo(p))}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {alertas.map((a) => <Chip key={a.label} color="red" size="xs">{a.label}</Chip>)}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <a
                      href={whatsAppCobranca(p)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: 11, fontWeight: 700, padding: '5px 10px',
                        borderRadius: 7, background: '#25d366', color: '#fff', textDecoration: 'none',
                      }}
                    >
                      📱 WA
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Partos próximos — lista compacta */}
      {proximosPartos.length > 0 && (
        <Card>
          <SectionHeader title="🤱 Partos Próximos" subtitle={`${proximosPartos.length} pacientes nos próximos 90 dias`} />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {['Paciente', 'DPP', 'IG', 'Via', 'Dias'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proximosPartos.map((p) => {
                const dias    = Math.round((new Date(p.dpp).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
                const ig      = idadeGestacional(p.dum);
                const urgente = dias <= 30;
                return (
                  <tr
                    key={p.id}
                    className="data-row"
                    onClick={() => onOpenPaciente(p.id)}
                    style={{
                      borderBottom: `1px solid ${TOKENS.line2}`,
                      cursor: 'pointer',
                      background: urgente ? '#fffbeb' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: TOKENS.ink }}>{p.nome}</td>
                    <td style={{ padding: '10px 12px', color: TOKENS.ink2, fontSize: 13 }}>{fmtDate(p.dpp)}</td>
                    <td style={{ padding: '10px 12px', color: TOKENS.blue, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                      {ig ? `${ig.semanas}s ${ig.dias}d` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Chip color={p.via === 'Cesária' ? 'purple' : 'blue'} size="xs">{p.via}</Chip>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700,
                        color: urgente ? TOKENS.red : TOKENS.muted,
                        fontFeatureSettings: '"tnum"',
                      }}>
                        {dias}d
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
