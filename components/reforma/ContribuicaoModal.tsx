'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { TOKENS } from '@/lib/tokens';
import { SOCIOS_REFORMA } from '@/types/reforma';
import type { Contribuicao, SocioReforma } from '@/types/reforma';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (contribuicao: Contribuicao) => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function hoje() {
  return new Date().toISOString().split('T')[0];
}

export default function ContribuicaoModal({ open, onClose, onSave }: Props) {
  const [socio, setSocio] = useState<SocioReforma>('Adriana');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(hoje());
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (open) {
      setSocio('Adriana');
      setValor('');
      setData(hoje());
      setDescricao('');
    }
  }, [open]);

  function handleSave() {
    const v = parseFloat(valor.replace(',', '.'));
    if (!v || v <= 0 || !descricao.trim()) return;
    onSave({
      id: uid(),
      socio,
      valor: v,
      data,
      descricao: descricao.trim(),
    });
    onClose();
  }

  const valido = parseFloat(valor.replace(',', '.')) > 0 && descricao.trim().length > 0;

  const fieldStyle = {
    width: '100%',
    padding: '10px 13px',
    borderRadius: 9,
    border: `1.5px solid ${TOKENS.line}`,
    fontSize: 14,
    fontFamily: 'inherit',
    color: TOKENS.ink,
    background: '#fff',
    boxSizing: 'border-box' as const,
    outline: 'none',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 600,
    color: TOKENS.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 5,
    display: 'block',
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar Contribuição" width={440}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Sócio */}
        <div>
          <label style={labelStyle}>Sócio(a) *</label>
          <select style={{ ...fieldStyle, fontSize: 14 }} value={socio} onChange={(e) => setSocio(e.target.value as SocioReforma)}>
            {SOCIOS_REFORMA.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Valor */}
        <div>
          <label style={labelStyle}>Valor (R$) *</label>
          <input
            style={fieldStyle}
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>

        {/* Data */}
        <div>
          <label style={labelStyle}>Data do Pagamento *</label>
          <input style={fieldStyle} type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>

        {/* Descrição */}
        <div>
          <label style={labelStyle}>Descrição *</label>
          <input
            style={fieldStyle}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Pagamento parcela 1 – Engenharia"
          />
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 22px', borderRadius: 8, border: `1px solid ${TOKENS.line}`,
              background: '#fff', color: TOKENS.ink2, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!valido}
            style={{
              padding: '10px 22px', borderRadius: 8, border: 'none',
              background: valido ? TOKENS.green : TOKENS.line,
              color: valido ? '#fff' : TOKENS.muted,
              cursor: valido ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
            }}
          >
            Registrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
