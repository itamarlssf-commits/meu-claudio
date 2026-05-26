'use client';

import { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import MicButton from '@/components/reforma/MicButton';
import { TOKENS } from '@/lib/tokens';
import { CATEGORIAS } from '@/types/reforma';
import type { Gasto, Parcela, CategoriaReforma } from '@/types/reforma';
import { fmtMoney } from '@/lib/business-logic';
import { uploadContrato } from '@/lib/firebase';

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
  comprovanteUrl?: string;
}

export default function GastoModal({ open, onClose, onSave, inicial }: Props) {
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaReforma>('Engenharia');
  const [fornecedor, setFornecedor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [parcelas, setParcelas] = useState<ParcelaForm[]>([
    { id: uid(), numero: 0, valor: '', vencimento: hoje(), pago: false, dataPagamento: '' },
  ]);
  const [contratoFile, setContratoFile] = useState<File | null>(null);
  const [contratoUrlAtual, setContratoUrlAtual] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const contratoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inicial) {
      setDescricao(inicial.descricao);
      setCategoria(inicial.categoria);
      setFornecedor(inicial.fornecedor);
      setObservacoes(inicial.observacoes ?? '');
      setContratoUrlAtual(inicial.contratoUrl);
      setContratoFile(null);
      setParcelas(
        inicial.parcelas.map((p) => ({
          id: p.id,
          numero: p.numero,
          valor: String(p.valor),
          vencimento: p.vencimento,
          pago: p.pago,
          dataPagamento: p.dataPagamento ?? '',
          comprovanteUrl: p.comprovanteUrl,
        })),
      );
    } else {
      setDescricao('');
      setCategoria('Engenharia');
      setFornecedor('');
      setObservacoes('');
      setContratoUrlAtual(undefined);
      setContratoFile(null);
      setParcelas([{ id: uid(), numero: 0, valor: '', vencimento: hoje(), pago: false, dataPagamento: '' }]);
    }
  }, [inicial, open]);

  function addParcela() {
    const next = parcelas.length;
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

  async function handleSave() {
    if (!descricao.trim() || !fornecedor.trim()) return;
    setSaving(true);
    try {
      const gastoId = inicial?.id ?? uid();
      let contratoUrl = contratoUrlAtual;
      if (contratoFile) {
        contratoUrl = await uploadContrato(gastoId, contratoFile);
      }

      const gastoFinal: Gasto = {
        id: gastoId,
        descricao: descricao.trim(),
        categoria,
        fornecedor: fornecedor.trim(),
        observacoes: observacoes.trim() || undefined,
        contratoUrl,
        criadoEm: inicial?.criadoEm ?? hoje(),
        parcelas: parcelas.map((p) => ({
          id: p.id,
          numero: p.numero,
          valor: parseFloat(p.valor.replace(',', '.')) || 0,
          vencimento: p.vencimento || hoje(),
          pago: p.pago,
          dataPagamento: p.pago && p.dataPagamento ? p.dataPagamento : undefined,
          comprovanteUrl: p.comprovanteUrl,
        })),
      };
      onSave(gastoFinal);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const totalGasto = parcelas.reduce((s, p) => s + (parseFloat(p.valor.replace(',', '.')) || 0), 0);
  const podesSalvar = !saving && descricao.trim().length > 0 && fornecedor.trim().length > 0;

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
    <Modal open={open} onClose={onClose} title={inicial ? 'Editar Gasto' : 'Novo Gasto'} width={580}>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Descrição + Mic */}
        <div>
          <label style={labelStyle}>Descrição *</label>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              style={fieldStyle}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Contrato de engenharia civil"
            />
            <MicButton onResult={(t) => setDescricao((v) => v ? v + ' ' + t : t)} />
          </div>
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
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                style={fieldStyle}
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                placeholder="Nome da empresa"
              />
              <MicButton onResult={(t) => setFornecedor((v) => v ? v + ' ' + t : t)} />
            </div>
          </div>
        </div>

        {/* Contrato */}
        <div>
          <label style={labelStyle}>Contrato (PDF ou imagem)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => contratoRef.current?.click()}
              style={{
                padding: '8px 14px', borderRadius: 8, border: `1.5px dashed ${TOKENS.line}`,
                background: TOKENS.line2, color: TOKENS.ink2, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              }}
            >
              📎 {contratoFile ? contratoFile.name : 'Selecionar arquivo'}
            </button>
            {(contratoUrlAtual || contratoFile) && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {contratoUrlAtual && !contratoFile && (
                  <a
                    href={contratoUrlAtual}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: TOKENS.primary, textDecoration: 'underline' }}
                  >
                    Ver contrato atual
                  </a>
                )}
                {contratoFile && (
                  <span style={{ fontSize: 12, color: TOKENS.green }}>✓ Novo arquivo selecionado</span>
                )}
                <button
                  type="button"
                  onClick={() => { setContratoFile(null); setContratoUrlAtual(undefined); if (contratoRef.current) contratoRef.current.value = ''; }}
                  style={{ fontSize: 12, color: TOKENS.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Remover
                </button>
              </div>
            )}
            <input
              ref={contratoRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              style={{ display: 'none' }}
              onChange={(e) => setContratoFile(e.target.files?.[0] ?? null)}
            />
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
                type="button"
                onClick={() => removeParcela(p.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.muted, fontSize: 16, padding: 0 }}
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addParcela}
            style={{
              marginTop: 4, fontSize: 12, fontWeight: 600, color: TOKENS.primary,
              background: `${TOKENS.primary}10`, border: `1px dashed ${TOKENS.primary}40`,
              borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', width: '100%',
            }}
          >
            + Adicionar parcela
          </button>
        </div>

        {/* Observações + Mic */}
        <div>
          <label style={labelStyle}>Observações</label>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <textarea
              style={{ ...fieldStyle, resize: 'vertical', minHeight: 60 }}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas adicionais..."
            />
            <MicButton onResult={(t) => setObservacoes((v) => v ? v + ' ' + t : t)} />
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '9px 20px', borderRadius: 8, border: `1px solid ${TOKENS.line}`,
              background: '#fff', color: TOKENS.ink2, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!podesSalvar}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: podesSalvar ? TOKENS.primary : TOKENS.line,
              color: podesSalvar ? '#fff' : TOKENS.muted,
              cursor: podesSalvar ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
            }}
          >
            {saving ? 'Salvando…' : inicial ? 'Salvar alterações' : 'Cadastrar gasto'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
