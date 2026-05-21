'use client';

import { useState, useCallback } from 'react';
import type { AppData, Paciente } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { fmtMoney, fmtDate, totalPago, saldo, sociosRepasses, todayISO } from '@/lib/business-logic';
import { KPI, Card, SectionHeader, Chip, Empty, Btn } from '@/components/ui';

interface Props {
  data: AppData;
  setData: (d: AppData) => void;
  onOpenPaciente: (id: string) => void;
}

type FinTab = 'multi' | 'socios';

export default function FinanceiroView({ data, setData, onOpenPaciente }: Props) {
  const [tab, setTab] = useState<FinTab>('multi');
  const { pacientes } = data;

  const allMulti = pacientes.flatMap((p) => p.multi.map((m) => ({ ...m, paciente: p })));
  const multiPago = allMulti.filter((m) => m.pago).reduce((s, m) => s + m.valor, 0);
  const multiPendente = allMulti.filter((m) => !m.pago).reduce((s, m) => s + m.valor, 0);

  const allRepasses = pacientes.flatMap((p) =>
    sociosRepasses(p).map((r) => ({ ...r, paciente: p })),
  );
  const repPago = allRepasses.filter((r) => r.pago).reduce((s, r) => s + r.valor, 0);
  const repPendente = allRepasses.filter((r) => !r.pago).reduce((s, r) => s + r.valor, 0);

  const totalContrato = pacientes.reduce((s, p) => s + p.contrato, 0);
  const totalRecebido = pacientes.reduce((s, p) => s + totalPago(p), 0);
  const totalSaldo = pacientes.reduce((s, p) => s + saldo(p), 0);

  const updPaciente = useCallback(
    (next: Paciente) =>
      setData({ ...data, pacientes: data.pacientes.map((p) => (p.id === next.id ? next : p)) }),
    [data, setData],
  );

  const togMulti = useCallback(
    (paciente: Paciente, idx: number) => {
      const multi = [...paciente.multi];
      multi[idx] = { ...multi[idx], pago: !multi[idx].pago };
      updPaciente({ ...paciente, multi });
    },
    [updPaciente],
  );

  const togSocio = useCallback(
    (paciente: Paciente, rIdx: number, isLegacy: boolean) => {
      if (isLegacy) {
        const socios = [...(paciente.socios ?? [])];
        socios[rIdx] = { ...socios[rIdx], pago: !socios[rIdx].pago, dataPgt: !socios[rIdx].pago ? todayISO() : null };
        updPaciente({ ...paciente, socios });
      } else {
        const willPay = !paciente.socioPago;
        updPaciente({ ...paciente, socioPago: willPay, socioDataPgt: willPay ? todayISO() : null });
      }
    },
    [updPaciente],
  );

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '10px 14px',
    fontSize: 10, fontWeight: 700, color: TOKENS.muted,
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: `2px solid ${TOKENS.line}`,
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <SectionHeader title="Financeiro · Repasses" subtitle="Sócios e profissionais multi" />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
        <KPI label="Total Contratos" value={fmtMoney(totalContrato)} accent={TOKENS.primary} />
        <KPI label="Recebido" value={fmtMoney(totalRecebido)} accent={TOKENS.green} />
        <KPI label="A Receber" value={fmtMoney(totalSaldo)} accent={TOKENS.amber} />
        <KPI label="Multi — Pago" value={fmtMoney(multiPago)} accent={TOKENS.purple} />
        <KPI label="Multi — Pendente" value={fmtMoney(multiPendente)} accent={TOKENS.pink} />
        <KPI label="Repasses — Pago" value={fmtMoney(repPago)} accent={TOKENS.blue} />
        <KPI label="Repasses — Pendente" value={fmtMoney(repPendente)} accent={TOKENS.red} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${TOKENS.line}` }}>
        {(['multi', 'socios'] as FinTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '9px 18px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: tab === t ? 700 : 500,
            color: tab === t ? TOKENS.primary : TOKENS.muted,
            borderBottom: tab === t ? `2px solid ${TOKENS.primary}` : '2px solid transparent',
            fontFamily: 'inherit', marginBottom: -1,
          }}>
            {t === 'multi' ? '👥 Profissionais Multi' : '🤝 Sócios (Marcos & Lucas)'}
          </button>
        ))}
      </div>

      {/* Multi tab */}
      {tab === 'multi' && (
        <Card padding={0}>
          {allMulti.length === 0 ? (
            <Empty title="Sem profissionais multi" icon="👥" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
                <thead>
                  <tr>
                    {['Paciente', 'Profissional', 'Data', 'Valor', 'Status', 'Ação'].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allMulti.map((m, i) => {
                    const mIdx = m.paciente.multi.findIndex(
                      (x) => x.profissional === m.profissional && x.valor === m.valor && x.data === m.data,
                    );
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${TOKENS.line2}`, background: m.pago ? '#f0fdf4' : '#fffbeb' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: TOKENS.primary, cursor: 'pointer' }}
                          onClick={() => onOpenPaciente(m.paciente.id)}>
                          {m.paciente.nome.split(' ').slice(0, 2).join(' ')}
                        </td>
                        <td style={{ padding: '10px 14px', color: TOKENS.ink2 }}>{m.profissional}</td>
                        <td style={{ padding: '10px 14px', color: TOKENS.muted, fontSize: 12 }}>{m.data ? fmtDate(m.data) : '—'}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: TOKENS.ink }}>
                          {m.valor > 0 ? fmtMoney(m.valor) : '—'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <Chip color={m.pago ? 'green' : 'amber'} size="xs">{m.pago ? '✓ Repassado' : 'Pendente'}</Chip>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <Btn variant={m.pago ? 'outline' : 'success'} size="sm"
                            onClick={() => togMulti(m.paciente, mIdx >= 0 ? mIdx : i)}>
                            {m.pago ? 'Reverter' : '✓ Repassar'}
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Sócios tab */}
      {tab === 'socios' && (
        <Card padding={0}>
          {allRepasses.length === 0 ? (
            <Empty title="Sem repasses registrados" icon="🤝" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 760 }}>
                <thead>
                  <tr>
                    {['Sócio', 'Paciente', 'Papel', 'Valor bruto', 'Impostos', 'Líquido', 'Status', 'Data Pgt', 'Ação'].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allRepasses.map((r, i) => {
                    const liquido = r.valor - r.impostos;
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${TOKENS.line2}`, background: r.pago ? '#f0fdf4' : '#fff7ed' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: TOKENS.ink }}>{r.nome || '—'}</td>
                        <td style={{ padding: '10px 14px', color: TOKENS.primary, cursor: 'pointer' }}
                          onClick={() => onOpenPaciente(r.paciente.id)}>
                          {r.paciente.nome.split(' ').slice(0, 2).join(' ')}
                        </td>
                        <td style={{ padding: '10px 14px', color: TOKENS.muted, fontSize: 12 }}>{r.papel}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>{fmtMoney(r.valor)}</td>
                        <td style={{ padding: '10px 14px', color: TOKENS.red, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                          {r.impostos > 0 ? `−${fmtMoney(r.impostos)}` : '—'}
                        </td>
                        <td style={{ padding: '10px 14px', fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: TOKENS.green }}>
                          {fmtMoney(liquido)}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <Chip color={r.pago ? 'green' : 'red'} size="xs">{r.pago ? '✓ Pago' : 'Pendente'}</Chip>
                        </td>
                        <td style={{ padding: '10px 14px', color: TOKENS.muted, fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>
                          {r.dataPgt ? fmtDate(r.dataPgt) : '—'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <Btn variant={r.pago ? 'outline' : 'success'} size="sm"
                            onClick={() => togSocio(r.paciente, r._idx, r._legacy)}>
                            {r.pago ? 'Reverter' : '✓ Marcar pago'}
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
