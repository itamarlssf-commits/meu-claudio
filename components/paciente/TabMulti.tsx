'use client';

import { useState } from 'react';
import type { Paciente, MultiItem, AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { fmtMoney, fmtDate, todayISO } from '@/lib/business-logic';
import { inputBase } from '@/lib/input-styles';
import { Btn, Empty } from '@/components/ui';

const PROF_LIST = ['Nutricionista', 'Psicóloga', 'Personal', 'Doula', 'Fisio Pélvica'];

interface Props {
  paciente: Paciente;
  data: AppData;
  setData: (d: AppData) => void;
}

export default function TabMulti({ paciente, data, setData }: Props) {
  const [addMode, setAddMode] = useState(false);
  const [form, setForm] = useState<Omit<MultiItem, 'pago'> & { pago: boolean }>({
    profissional: PROF_LIST[0],
    valor: 0,
    pago: false,
    data: todayISO(),
  });

  function upd(list: MultiItem[]) {
    const next: AppData = {
      ...data,
      pacientes: data.pacientes.map((p) =>
        p.id === paciente.id ? { ...p, multi: list } : p
      ),
    };
    setData(next);
  }

  function togglePago(i: number) {
    const list = [...paciente.multi];
    list[i] = { ...list[i], pago: !list[i].pago };
    upd(list);
  }

  function remove(i: number) {
    if (!confirm('Remover profissional?')) return;
    upd(paciente.multi.filter((_, idx) => idx !== i));
  }

  function add() {
    upd([...paciente.multi, { ...form }]);
    setAddMode(false);
    setForm({ profissional: PROF_LIST[0], valor: 0, pago: false, data: todayISO() });
  }

  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink2 }}>Profissionais Multi</div>
        <Btn variant="primary" size="sm" onClick={() => setAddMode(true)}>
          + Adicionar
        </Btn>
      </div>

      {paciente.multi.length === 0 && !addMode ? (
        <Empty title="Sem profissionais" subtitle="Nenhum profissional multi-disciplinar registrado." icon="👩‍⚕️" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {paciente.multi.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: item.pago ? '#f0fdf4' : '#fffbeb',
                borderRadius: 10,
                border: `1px solid ${item.pago ? '#d1fae5' : '#fef3c7'}`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>{item.profissional}</div>
                {item.data && (
                  <div style={{ fontSize: 11, color: TOKENS.muted }}>{fmtDate(item.data)}</div>
                )}
              </div>
              <div
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontWeight: 700,
                  fontSize: 14,
                  color: TOKENS.ink2,
                }}
              >
                {item.valor > 0 ? fmtMoney(item.valor) : '—'}
              </div>
              <button
                onClick={() => togglePago(i)}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: item.pago ? TOKENS.green : TOKENS.amber,
                  color: '#fff',
                  fontFamily: 'inherit',
                }}
              >
                {item.pago ? '✓ Pago' : 'Pendente'}
              </button>
              <button
                onClick={() => remove(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: TOKENS.muted,
                  fontSize: 16,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {addMode && (
        <div
          style={{
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
                Profissional
              </label>
              <select
                style={inputBase}
                value={form.profissional}
                onChange={(e) => setForm((f) => ({ ...f, profissional: e.target.value }))}
              >
                {PROF_LIST.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Valor (R$)
              </label>
              <input
                style={inputBase}
                type="number"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Data
              </label>
              <input
                style={inputBase}
                type="date"
                value={form.data || ''}
                onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.pago}
                  onChange={(e) => setForm((f) => ({ ...f, pago: e.target.checked }))}
                />
                Já pago
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="primary" size="sm" onClick={add}>Salvar</Btn>
            <Btn variant="ghost" size="sm" onClick={() => setAddMode(false)}>Cancelar</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
