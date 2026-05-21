'use client';

import { useState } from 'react';
import type { AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import {
  fmtMoney,
  fmtDate,
  totalPago,
  saldo,
  sociosRepasses,
} from '@/lib/business-logic';
import { KPI, Card, SectionHeader, Chip, Empty } from '@/components/ui';

interface Props {
  data: AppData;
  onOpenPaciente: (id: string) => void;
}

type FinTab = 'multi' | 'socios';

export default function FinanceiroView({ data, onOpenPaciente }: Props) {
  const [tab, setTab] = useState<FinTab>('multi');
  const { pacientes } = data;

  // Multi summary
  const allMulti = pacientes.flatMap((p) =>
    p.multi.map((m) => ({ ...m, paciente: p }))
  );
  const multiPago = allMulti.filter((m) => m.pago).reduce((s, m) => s + m.valor, 0);
  const multiPendente = allMulti.filter((m) => !m.pago).reduce((s, m) => s + m.valor, 0);

  // Socios summary
  const allRepasses = pacientes.flatMap((p) =>
    sociosRepasses(p).map((s) => ({ ...s, paciente: p }))
  );
  const repPago = allRepasses.filter((r) => r.pago).reduce((s, r) => s + r.valor, 0);
  const repPendente = allRepasses.filter((r) => !r.pago).reduce((s, r) => s + r.valor, 0);

  // Overall
  const totalContrato = pacientes.reduce((s, p) => s + p.contrato, 0);
  const totalRecebido = pacientes.reduce((s, p) => s + totalPago(p), 0);
  const totalSaldo = pacientes.reduce((s, p) => s + saldo(p), 0);

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <SectionHeader title="Financeiro" subtitle="Visão consolidada de pagamentos e repasses" />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        <KPI label="Total Contratos" value={fmtMoney(totalContrato)} accent={TOKENS.primary} />
        <KPI label="Recebido" value={fmtMoney(totalRecebido)} accent={TOKENS.green} />
        <KPI label="A Receber" value={fmtMoney(totalSaldo)} accent={TOKENS.amber} />
        <KPI label="Multi — Pago" value={fmtMoney(multiPago)} accent={TOKENS.purple} />
        <KPI label="Multi — Pendente" value={fmtMoney(multiPendente)} accent={TOKENS.pink} />
        <KPI label="Repasses — Pago" value={fmtMoney(repPago)} accent={TOKENS.blue} />
        <KPI label="Repasses — Pendente" value={fmtMoney(repPendente)} accent={TOKENS.red} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${TOKENS.line}` }}>
        {(['multi', 'socios'] as FinTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '9px 18px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? TOKENS.primary : TOKENS.muted,
              borderBottom: tab === t ? `2px solid ${TOKENS.primary}` : '2px solid transparent',
              fontFamily: 'inherit',
              marginBottom: -1,
            }}
          >
            {t === 'multi' ? '👩‍⚕️ Profissionais Multi' : '🤝 Sócios / Repasses'}
          </button>
        ))}
      </div>

      {/* Multi tab */}
      {tab === 'multi' && (
        <Card padding={0}>
          {allMulti.length === 0 ? (
            <Empty title="Sem profissionais multi" icon="👩‍⚕️" />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${TOKENS.line}` }}>
                  {['Paciente', 'Profissional', 'Valor', 'Status', 'Data'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: TOKENS.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allMulti.map((m, i) => (
                  <tr
                    key={i}
                    onClick={() => onOpenPaciente(m.paciente.id)}
                    style={{
                      borderBottom: `1px solid ${TOKENS.line2}`,
                      cursor: 'pointer',
                      background: m.pago ? '#f0fdf4' : '#fffbeb',
                    }}
                  >
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: TOKENS.ink }}>
                      {m.paciente.nome.split(' ')[0]} {m.paciente.nome.split(' ')[1]}
                    </td>
                    <td style={{ padding: '10px 14px', color: TOKENS.ink2 }}>{m.profissional}</td>
                    <td
                      style={{
                        padding: '10px 14px',
                        fontFamily: 'ui-monospace, monospace',
                        fontWeight: 700,
                        color: TOKENS.ink,
                      }}
                    >
                      {m.valor > 0 ? fmtMoney(m.valor) : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Chip color={m.pago ? 'green' : 'amber'} size="xs">
                        {m.pago ? '✓ Pago' : 'Pendente'}
                      </Chip>
                    </td>
                    <td style={{ padding: '10px 14px', color: TOKENS.muted, fontSize: 12 }}>
                      {m.data ? fmtDate(m.data) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Socios tab */}
      {tab === 'socios' && (
        <Card padding={0}>
          {allRepasses.length === 0 ? (
            <Empty title="Sem repasses registrados" icon="🤝" />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${TOKENS.line}` }}>
                  {['Paciente', 'Sócio', 'Papel', 'Valor', 'Impostos', 'Líquido', 'Status', 'Data Pgt'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: TOKENS.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allRepasses.map((r, i) => {
                  const liquido = r.valor - r.impostos;
                  return (
                    <tr
                      key={i}
                      onClick={() => onOpenPaciente(r.paciente.id)}
                      style={{
                        borderBottom: `1px solid ${TOKENS.line2}`,
                        cursor: 'pointer',
                        background: r.pago ? '#f0fdf4' : '#fff7ed',
                      }}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: TOKENS.ink }}>
                        {r.paciente.nome.split(' ')[0]} {r.paciente.nome.split(' ')[1]}
                      </td>
                      <td style={{ padding: '10px 14px', color: TOKENS.ink2 }}>{r.nome}</td>
                      <td style={{ padding: '10px 14px', color: TOKENS.muted, fontSize: 12 }}>{r.papel}</td>
                      <td
                        style={{
                          padding: '10px 14px',
                          fontFamily: 'ui-monospace, monospace',
                          fontWeight: 700,
                          color: TOKENS.ink,
                        }}
                      >
                        {fmtMoney(r.valor)}
                      </td>
                      <td style={{ padding: '10px 14px', color: TOKENS.red, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                        {r.impostos > 0 ? fmtMoney(r.impostos) : '—'}
                      </td>
                      <td
                        style={{
                          padding: '10px 14px',
                          fontFamily: 'ui-monospace, monospace',
                          fontWeight: 700,
                          color: TOKENS.green,
                        }}
                      >
                        {fmtMoney(liquido)}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <Chip color={r.pago ? 'green' : 'red'} size="xs">
                          {r.pago ? '✓ Pago' : 'Pendente'}
                        </Chip>
                      </td>
                      <td style={{ padding: '10px 14px', color: TOKENS.muted, fontSize: 12 }}>
                        {r.dataPgt ? fmtDate(r.dataPgt) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}
