'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { TOKENS } from '@/lib/tokens';
import { CATEGORIAS } from '@/types/reforma';
import type { Gasto, Parcela, CategoriaReforma } from '@/types/reforma';
import { fmtMoney } from '@/lib/business-logic';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (gasto: Gasto) => void;
  inicial?: Gasto | null;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function hoje() {
  return new Date().toISOString().split('T')[0];
}

interface ParcelaForm {
  id: string;
  numero: number;
  valor: string;
  vencimento: string;
  pago: boolean;
  dataPagamento: string;
}

export default function GastoModal({ open, onClose, onSave, inicial }: Props) {
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaReforma>('Engenharia');
  const [fornecedor, setFornecedor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [parcelas, setParcelas] = useState<ParcelaForm[]>([
    { id: uid(), numero: 0, valor: '', vencimento: hoje(), pago: false, dataPagamento: '' },
  ]);

  useEffect(() => {
    if (inicial) {
      setDescricao(inicial.descricao);
      setCategoria(inicial.categoria);
      setFornecedor(inicial.fornecedor);
      setObservacoes(inicial.observacoes ?? '');
      setParcelas(
        inicial.parcelas.map((p) => ({
          id: p.id,
          numero: p.numero,
          valor: String(p.valor),
          vencimento: p.vencimento,
          pago: p.pago,
          dataPagamento: p.dataPagamento ?? '',
        })),
      );
    } else {
      setDescricao('');
      setCategoria('Engenharia');
      setFornecedor('');
      setObservacoes('');
      setParcelas([{ id: uid(), numero: 0, valor: '', vencimento: hoje(), pago: false, dataPagamento: '' }]);
    }
  }, [inicial, open]);

  function addParcela() {
    const next = parcelas.length; // 0 = entrada, 1,2... = parcelas
    setParcelas((prev) => [...prev, { id: uid(), numero: next, valor: '', vencimento: '', pago: false, dataPagamento: '' }]);
  }

  function removeParcela(id: string) {
    if (parcelas.length === 1) return;
    setParcelas((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, i) => ({ ...p, numero: i }));
    });
  }

  function updParcela(id: string, field: keyof ParcelaForm, value: string | boolean) {
    setParcelas((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  function handleSave() {
    if (!descricao.trim() || !fornecedor.trim()) return;
    const gastoFinal: Gasto = {
      id: inicial?.id ?? uid(),
      descricao: descricao.trim(),
      categoria,
      fornecedor: fornecedor.trim(),
      observacoes: observacoes.trim() || undefined,
      criadoEm: inicial?.criadoEm ?? hoje(),
      parcelas: parcelas.map((p) => ({
        id: p.id,
        numero: p.numero,
        valor: parseFloat(p.valor.replace(',', '.')) || 0,
        vencimento: p.vencimento || hoje(),
        pago: p.pago,
        dataPagamento: p.pago && p.dataPagamento ? p.dataPagamento : undefined,
      })),
    };
    onSave(gastoFinal);
    onClose();
  }

  const totalGasto = parcelas.reduce((s, p) => s + (parseFloat(p.valor.replace(',', '.')) || 0), 0);

  const fieldStyle = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 8,
    border: `1.5px solid ${TOKENS.line}`,
    fontSize: 13,
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
    marginBottom: 4,
    display: 'block',
  };

  return (
    <Modal open={open} onClose={onClose} title={inicial ? 'Editar Gasto' : 'Novo Gasto'} width={560}>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Descrição */}
        <div>
          <label style={labelStyle}>Descrição *</label>
          <input style={fieldStyle} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Contrato de engenharia civil" />
        </div>

        {/* Categoria + Fornecedor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Categoria *</label>
            <select style={fieldStyle} value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaReforma)}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Fornecedor *</label>
            <input style={fieldStyle} value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} placeholder="Nome da empresa" />
          </div>
        </div>

        {/* Parcelas */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Parcelas / Entrada</label>
            <span style={{ fontSize: 12, fontWeight: 600, color: TOKENS.primary }}>
              Total: {fmtMoney(totalGasto)}
            </span>
          </div>

          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 60px 24px', gap: 6, marginBottom: 4 }}>
            {['#', 'Valor (R$)', 'Vencimento', 'Pago?', ''].map((h) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: TOKENS.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>

          {parcelas.map((p) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 60px 24px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink2 }}>
                {p.numero === 0 ? 'Entrada' : `${p.numero}ª parc.`}
              </span>
              <input
                style={fieldStyle}
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={p.valor}
                onChange={(e) => updParcela(p.id, 'valor', e.target.value)}
              />
              <input
                style={fieldStyle}
                type="date"
                value={p.vencimento}
                onChange={(e) => updParcela(p.id, 'vencimento', e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={p.pago}
                  onChange={(e) => updParcela(p.id, 'pago', e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: TOKENS.green }}
                />
              </div>
              <button
                onClick={() => removeParcela(p.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.muted, fontSize: 16, padding: 0 }}
              >
                ×
              </button>
            </div>
          ))}

          <button
            onClick={addParcela}
            style={{
              marginTop: 4,
              fontSize: 12,
              fontWeight: 600,
              color: TOKENS.primary,
              background: `${TOKENS.primary}10`,
              border: `1px dashed ${TOKENS.primary}40`,
              borderRadius: 8,
              padding: '7px 14px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              width: '100%',
            }}
          >
            + Adicionar parcela
          </button>
        </div>

        {/* Observações */}
        <div>
          <label style={labelStyle}>Observações</label>
          <textarea
            style={{ ...fieldStyle, resize: 'vertical', minHeight: 60 }}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Notas adicionais..."
          />
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 8, border: `1px solid ${TOKENS.line}`,
              background: '#fff', color: TOKENS.ink2, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!descricao.trim() || !fornecedor.trim()}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: !descricao.trim() || !fornecedor.trim() ? TOKENS.line : TOKENS.primary,
              color: !descricao.trim() || !fornecedor.trim() ? TOKENS.muted : '#fff',
              cursor: !descricao.trim() || !fornecedor.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
            }}
          >
            {inicial ? 'Salvar alterações' : 'Cadastrar gasto'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
