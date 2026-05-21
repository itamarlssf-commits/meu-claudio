'use client';

import type { AppData, Paciente } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import {
  fmtDate,
  fmtMoney,
  saldo,
  alertasCobrancaDPP,
  sociosRepasses,
  idadeGestacional,
  whatsAppCobranca,
  todayISO,
} from '@/lib/business-logic';
import { KPI, Card, SectionHeader, Chip, Empty, Btn } from '@/components/ui';

interface Props {
  data: AppData;
  setData: (d: AppData) => void;
  onOpenPaciente: (id: string) => void;
}

export default function AlertasView({ data, setData, onOpenPaciente }: Props) {
  const marcarRepasse = (paciente: Paciente, isLegacy: boolean, idx: number) => {
    let next: Paciente;
    if (isLegacy) {
      const socios = [...(paciente.socios ?? [])];
      socios[idx] = { ...socios[idx], pago: true, dataPgt: todayISO() };
      next = { ...paciente, socios };
    } else {
      next = { ...paciente, socioPago: true, socioDataPgt: todayISO() };
    }
    setData({ ...data, pacientes: data.pacientes.map((p) => (p.id === paciente.id ? next : p)) });
  };
  const { pacientes } = data;
  const hoje = new Date();
  const todayStr = hoje.toISOString().split('T')[0];

  // Cobranças urgentes por DPP
  const cobrancas = pacientes
    .map((p) => ({ p, alertas: alertasCobrancaDPP(p) }))
    .filter((x) => x.alertas.length > 0)
    .sort((a, b) => (a.alertas[0]?.diasRestantes ?? 999) - (b.alertas[0]?.diasRestantes ?? 999));

  // Repasses pendentes de sócios (parto realizado)
  const repasses = pacientes
    .flatMap((p) =>
      sociosRepasses(p, { onlyPostParto: true })
        .filter((r) => !r.pago)
        .map((r) => ({ ...r, paciente: p }))
    );

  // Partos iminentes (DPP próximos 14 dias)
  const iminentes = pacientes
    .filter((p) => {
      if (p.partoRealizado || !p.dpp) return false;
      const dias = Math.round((new Date(p.dpp).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return dias >= 0 && dias <= 14;
    })
    .sort((a, b) => (a.dpp || '').localeCompare(b.dpp || ''));

  // Pacientes inadimplentes totais (pendente, sem nenhum pagamento)
  const inadimplentes = pacientes.filter(
    (p) => p.status === 'pendente' && !p.partoRealizado
  );

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <SectionHeader title="⚡ Alertas" subtitle="Ações que requerem atenção imediata" />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        <KPI label="Cobranças DPP" value={cobrancas.length} accent={TOKENS.red} icon="⚡" />
        <KPI label="Repasses Pendentes" value={repasses.length} accent={TOKENS.amber} icon="💸" />
        <KPI label="Partos Iminentes" value={iminentes.length} sub="Próximos 14 dias" accent={TOKENS.pink} icon="🤱" />
        <KPI label="Inadimplentes" value={inadimplentes.length} accent={TOKENS.red} icon="🚨" />
      </div>

      {/* Cobranças por DPP */}
      <Card>
        <SectionHeader
          title="🔔 Cobranças por DPP"
          subtitle="Pacientes que precisam ser cobradas antes do parto"
        />
        {cobrancas.length === 0 ? (
          <Empty title="Nenhuma cobrança urgente" subtitle="Todas as pacientes estão em dia ou sem alertas ativos." icon="✅" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cobrancas.map(({ p, alertas }) => {
              const sld = saldo(p);
              const waLink = whatsAppCobranca(p);
              return (
                <div
                  key={p.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: '#fff7ed',
                    border: '1px solid #fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => onOpenPaciente(p.id)}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.ink }}>{p.nome}</div>
                    <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 2 }}>
                      DPP: <strong>{fmtDate(p.dpp)}</strong> · Saldo:{' '}
                      <strong style={{ color: TOKENS.amber }}>{fmtMoney(sld)}</strong> ·{' '}
                      {alertas[0].diasRestantes} dias restantes
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {alertas.map((a) => (
                        <Chip key={a.label} color="red" size="xs">
                          {a.label} (meta {a.meta}% · atual {a.pctAtual}%)
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: '#25d366',
                      color: '#fff',
                      textDecoration: 'none',
                      flexShrink: 0,
                    }}
                  >
                    📱 Cobrar via WA
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Repasses pendentes */}
      <Card>
        <SectionHeader
          title="💸 Repasses Pendentes"
          subtitle="Sócios aguardando repasse (parto já realizado)"
        />
        {repasses.length === 0 ? (
          <Empty title="Nenhum repasse pendente" icon="✅" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TOKENS.line}` }}>
                {['Paciente', 'Sócio', 'Valor', 'Data Parto', 'Ação'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 700, color: TOKENS.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repasses.map((r, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: `1px solid ${TOKENS.line2}`, background: '#fff7ed' }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: TOKENS.primary, cursor: 'pointer' }}
                    onClick={() => onOpenPaciente(r.paciente.id)}>{r.paciente.nome.split(' ').slice(0, 2).join(' ')}</td>
                  <td style={{ padding: '10px 12px', color: TOKENS.ink2 }}>{r.nome}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: TOKENS.amber }}>
                    {fmtMoney(r.valor)}
                  </td>
                  <td style={{ padding: '10px 12px', color: TOKENS.muted, fontSize: 12 }}>
                    {r.paciente.dataPartoReal ? fmtDate(r.paciente.dataPartoReal) : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Btn variant="success" size="sm"
                      onClick={() => marcarRepasse(r.paciente, r._legacy, r._idx)}>
                      ✓ Pago
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Partos iminentes */}
      {iminentes.length > 0 && (
        <Card>
          <SectionHeader title="🤱 Partos Iminentes" subtitle="DPP nos próximos 14 dias — prepare-se!" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {iminentes.map((p) => {
              const diasRestantes = Math.round(
                (new Date(p.dpp).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
              );
              const ig = idadeGestacional(p.dum);
              return (
                <div
                  key={p.id}
                  onClick={() => onOpenPaciente(p.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: '#fff1f2',
                    border: '1px solid #fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.ink }}>{p.nome}</div>
                    <div style={{ fontSize: 12, color: TOKENS.muted }}>
                      DPP: {fmtDate(p.dpp)} · {p.via}
                      {ig && ` · IG: ${ig.semanas}s ${ig.dias}d`}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, monospace',
                      color: TOKENS.red,
                    }}
                  >
                    {diasRestantes}d
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Inadimplentes */}
      {inadimplentes.length > 0 && (
        <Card>
          <SectionHeader title="🚨 Pacientes Inadimplentes" subtitle="Sem nenhum pagamento registrado" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inadimplentes.map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenPaciente(p.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: '#fff1f2',
                  border: '1px solid #fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>{p.nome}</div>
                  <div style={{ fontSize: 12, color: TOKENS.muted }}>
                    Contrato: {fmtMoney(p.contrato)} · DPP: {fmtDate(p.dpp)}
                  </div>
                </div>
                <a
                  href={whatsAppCobranca(p)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: 7,
                    background: '#25d366',
                    color: '#fff',
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  📱 Cobrar
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
