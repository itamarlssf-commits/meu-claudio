'use client';

import { useState } from 'react';
import type { Paciente, AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { fmtDate, todayISO } from '@/lib/business-logic';
import { inputBase } from '@/lib/input-styles';
import { Btn, Empty } from '@/components/ui';

interface Props {
  paciente: Paciente;
  data: AppData;
  setData: (d: AppData) => void;
}

export default function TabObs({ paciente, data, setData }: Props) {
  const [addMode, setAddMode] = useState(false);
  const [texto, setTexto] = useState('');

  function add() {
    if (!texto.trim()) return;
    const next: AppData = {
      ...data,
      pacientes: data.pacientes.map((p) =>
        p.id === paciente.id
          ? {
              ...p,
              observacoes: [
                ...p.observacoes,
                { data: todayISO(), texto: texto.trim() },
              ],
            }
          : p
      ),
    };
    setData(next);
    setTexto('');
    setAddMode(false);
  }

  function remove(i: number) {
    if (!confirm('Remover observação?')) return;
    const next: AppData = {
      ...data,
      pacientes: data.pacientes.map((p) =>
        p.id === paciente.id
          ? { ...p, observacoes: p.observacoes.filter((_, idx) => idx !== i) }
          : p
      ),
    };
    setData(next);
  }

  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink2 }}>Observações</div>
        <Btn variant="primary" size="sm" onClick={() => setAddMode(true)}>
          + Adicionar
        </Btn>
      </div>

      {paciente.observacoes.length === 0 && !addMode ? (
        <Empty title="Sem observações" subtitle="Adicione notas e anotações sobre a paciente." icon="📝" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...paciente.observacoes].reverse().map((obs, rIdx) => {
            const i = paciente.observacoes.length - 1 - rIdx;
            return (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  background: '#fffbeb',
                  borderRadius: 10,
                  border: '1px solid #fef3c7',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: 11, color: TOKENS.muted, marginBottom: 4 }}>
                  {fmtDate(obs.data)}
                </div>
                <div style={{ fontSize: 13, color: TOKENS.ink, lineHeight: 1.5 }}>{obs.texto}</div>
                <button
                  onClick={() => remove(i)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 10,
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
            );
          })}
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
          <textarea
            style={{ ...inputBase, height: 80, resize: 'vertical' }}
            placeholder="Digite a observação…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="primary" size="sm" onClick={add}>Salvar</Btn>
            <Btn variant="ghost" size="sm" onClick={() => setAddMode(false)}>Cancelar</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
