'use client';

import { useState } from 'react';
import type { Paciente, Pagamento, FormaPagamento, AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { fmtMoney, fmtDate, totalPago, saldo, pctPago, todayISO } from '@/lib/business-logic';
import { inputBase } from '@/lib/input-styles';
import { Btn, Progress, Empty } from '@/components/ui';

interface Props {
  paciente: Paciente;
  data: AppData;
  setData: (d: AppData) => void;
}

const FORMAS: FormaPagamento[] = ['PIX', 'Cartão', 'Dinheiro', 'Boleto', 'Transferência'];

export default function TabFinanceiro({ paciente, data, setData }: Props) {
  const [addMode, setAddMode] = useState(false);
  const [form, setForm] = useState({
    valor: '',
    data: todayISO(),
    forma: 'PIX' as FormaPagamento,
    tipo: 'Entrada',
  });

  const total = totalPago(paciente);
  const sld = saldo(paciente);
  const pct = pctPago(paciente);

  function save() {
    const valor = parseFloat(form.valor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) return alert('Valor inválido');
    const newPgt: Pagamento = {
      id: 'p' + Date.now(),
      valor,
      data: form.data,
      forma: form.forma,
      tipo: form.tipo,
    };
    const next: AppData = {
      ...data,
      pacientes: data.pacientes.map((p) =>
        p.id === paciente.id ? { ...p, pagamentos: [...p.pagamentos, newPgt] } : p
      ),
    };
    setData(next);
    setAddMode(false);
    setForm({ valor: '', data: todayISO(), forma: 'PIX', tipo: 'Entrada' });
  }

  function remove(id: string) {
    if (!confirm('Remover pagamento?')) return;
    const next: AppData = {
      ...data,
      pacientes: data.pacientes.map((p) =>
        p.id === paciente.id
          ? { ...p, pagamentos: p.pagamentos.filter((x) => x.id !== id) }
          : p
      ),
    };
    setData(next);
  }

  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10,
        }}
      >
        <div style={{ background: TOKENS.line2, borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: TOKENS.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contrato</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'ui-monospace, monospace', color: TOKENS.ink }}>
            {fmtMoney(paciente.contrato)}
          </div>
        </div>
        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: TOKENS.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pago</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'ui-monospace, monospace', color: TOKENS.green }}>
            {fmtMoney(total)}
          </div>
        </div>
        <div style={{ background: sld > 0 ? '#fff7ed' : '#f0fdf4', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: TOKENS.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo</div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: 'ui-monospace, monospace',
              color: sld > 0 ? TOKENS.amber : TOKENS.green,
            }}
          >
            {fmtMoney(sld)}
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: TOKENS.muted }}>
          <span>Progresso</span>
          <span style={{ fontWeight: 700, color: pct >= 100 ? TOKENS.green : TOKENS.amber }}>{pct}%</span>
        </div>
        <Progress value={pct} color={pct >= 100 ? TOKENS.green : TOKENS.amber} />
      </div>

      {/* Payment list */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink2 }}>Pagamentos</div>
          <Btn variant="primary" size="sm" onClick={() => setAddMode(true)}>
            + Adicionar
          </Btn>
        </div>

        {paciente.pagamentos.length === 0 && !addMode ? (
          <Empty title="Sem pagamentos" subtitle="Nenhum pagamento registrado ainda." icon="💳" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TOKENS.line}` }}>
                {['Data', 'Tipo', 'Forma', 'Valor', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '6px 8px',
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
              {paciente.pagamentos.map((pgt) => (
                <tr key={pgt.id} style={{ borderBottom: `1px solid ${TOKENS.line2}` }}>
                  <td style={{ padding: '8px 8px', color: TOKENS.ink2 }}>{fmtDate(pgt.data)}</td>
                  <td style={{ padding: '8px 8px', color: TOKENS.ink2 }}>{pgt.tipo}</td>
                  <td style={{ padding: '8px 8px' }}>
                    <span
                      style={{
                        background: TOKENS.blueSoft,
                        color: TOKENS.blue,
                        borderRadius: 6,
                        padding: '2px 6px',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {pgt.forma}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '8px 8px',
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, monospace',
                      color: TOKENS.ink,
                    }}
                  >
                    {fmtMoney(pgt.valor)}
                  </td>
                  <td style={{ padding: '8px 4px' }}>
                    <button
                      onClick={() => remove(pgt.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: TOKENS.muted,
                        fontSize: 16,
                      }}
                      title="Remover"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {addMode && (
          <div
            style={{
              marginTop: 12,
              background: TOKENS.line2,
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Valor (R$)
                </label>
                <input
                  style={inputBase}
                  placeholder="0,00"
                  value={form.valor}
                  onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Data
                </label>
                <input
                  style={inputBase}
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Forma
                </label>
                <select
                  style={inputBase}
                  value={form.forma}
                  onChange={(e) => setForm((f) => ({ ...f, forma: e.target.value as FormaPagamento }))}
                >
                  {FORMAS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Tipo / Descrição
                </label>
                <input
                  style={inputBase}
                  placeholder="Entrada, 2ª parcela…"
                  value={form.tipo}
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="primary" size="sm" onClick={save}>
                Salvar
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => setAddMode(false)}>
                Cancelar
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
