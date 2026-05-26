'use client';

import { useState, useRef } from 'react';
import { TOKENS } from '@/lib/tokens';
import { fmtMoney, fmtDate } from '@/lib/business-logic';
import type { Gasto, Parcela } from '@/types/reforma';

const CATEGORIA_CORES: Record<string, string> = {
  Engenharia: TOKENS.primary,
  Marcenaria: '#92400e',
  Marmoraria: '#6b7280',
  Iluminação: TOKENS.amber,
  Elétrica: '#f59e0b',
  Pintura: TOKENS.blue,
  Móveis: '#7c3aed',
  Outros: TOKENS.muted,
};

interface Props {
  gasto: Gasto;
  onEdit: () => void;
  onDelete: () => void;
  onToggleParcela: (parcelaId: string, pago: boolean, comprovanteFile?: File | null) => Promise<void>;
}

function hoje() {
  return new Date().toISOString().split('T')[0];
}

function statusParcela(p: Parcela): 'pago' | 'vencido' | 'proximo' | 'futuro' {
  if (p.pago) return 'pago';
  if (p.vencimento < hoje()) return 'vencido';
  const diff = new Date(p.vencimento + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0);
  if (diff <= 30 * 24 * 60 * 60 * 1000) return 'proximo';
  return 'futuro';
}

const STATUS_CONFIG = {
  pago:    { cor: TOKENS.green,  bg: TOKENS.greenSoft,  icone: '✓' },
  vencido: { cor: TOKENS.red,    bg: TOKENS.redSoft,    icone: '!' },
  proximo: { cor: TOKENS.amber,  bg: TOKENS.amberSoft,  icone: '○' },
  futuro:  { cor: TOKENS.muted,  bg: TOKENS.line2,      icone: '○' },
};

export default function GastoCard({ gasto, onEdit, onDelete, onToggleParcela }: Props) {
  const [expandido, setExpandido] = useState(false);
  const [confirmando, setConfirmando] = useState<string | null>(null); // parcelaId em confirmação
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cor = CATEGORIA_CORES[gasto.categoria] ?? TOKENS.muted;

  const totalPrevisto = gasto.parcelas.reduce((s, p) => s + p.valor, 0);
  const totalPago = gasto.parcelas.filter((p) => p.pago).reduce((s, p) => s + p.valor, 0);
  const pct = totalPrevisto > 0 ? Math.round((totalPago / totalPrevisto) * 100) : 0;
  const temVencido = gasto.parcelas.some((p) => !p.pago && p.vencimento < hoje());

  async function confirmarPagamento(parcelaId: string) {
    setSalvando(true);
    try {
      await onToggleParcela(parcelaId, true, comprovanteFile);
      setConfirmando(null);
      setComprovanteFile(null);
    } finally {
      setSalvando(false);
    }
  }

  function cancelarConfirmacao() {
    setConfirmando(null);
    setComprovanteFile(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        border: `1px solid ${TOKENS.line}`,
        borderLeft: `4px solid ${cor}`,
        boxShadow: TOKENS.shadowSm,
        overflow: 'hidden',
        marginBottom: 10,
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
        onClick={() => setExpandido((v) => !v)}
      >
        <span
          style={{
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
            background: `${cor}18`, color: cor, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
          }}
        >
          {gasto.categoria}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: TOKENS.ink, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {gasto.descricao}
          </div>
          <div style={{ fontSize: 12, color: TOKENS.muted, display: 'flex', gap: 10, alignItems: 'center' }}>
            {gasto.fornecedor}
            {gasto.contratoUrl && (
              <a
                href={gasto.contratoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ fontSize: 11, color: TOKENS.primary, textDecoration: 'none', background: `${TOKENS.primary}10`, borderRadius: 6, padding: '1px 7px' }}
              >
                📄 Contrato
              </a>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: TOKENS.ink }}>{fmtMoney(totalPago)}</div>
          <div style={{ fontSize: 11, color: TOKENS.muted }}>de {fmtMoney(totalPrevisto)}</div>
        </div>

        {temVencido && (
          <span style={{ fontSize: 10, fontWeight: 700, color: TOKENS.red, background: TOKENS.redSoft, borderRadius: 20, padding: '3px 9px', flexShrink: 0 }}>
            Vencido!
          </span>
        )}

        <span style={{ color: TOKENS.muted, fontSize: 16, transition: 'transform 0.2s', transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          ▾
        </span>
      </div>

      {/* Barra de progresso */}
      <div style={{ height: 4, background: TOKENS.line2 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? TOKENS.green : cor, transition: 'width 0.4s', borderRadius: 2 }} />
      </div>

      {/* Detalhes expandidos */}
      {expandido && (
        <div style={{ padding: '14px 18px', borderTop: `1px solid ${TOKENS.line2}` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {gasto.parcelas.map((p) => {
              const st = statusParcela(p);
              const cfg = STATUS_CONFIG[st];
              const estaConfirmando = confirmando === p.id;

              return (
                <div key={p.id}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: estaConfirmando ? '9px 9px 0 0' : 9,
                      background: cfg.bg, border: `1px solid ${cfg.cor}25`,
                      borderBottom: estaConfirmando ? 'none' : undefined,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: cfg.cor, width: 20, textAlign: 'center' }}>{cfg.icone}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink2, width: 72 }}>
                      {p.numero === 0 ? 'Entrada' : `${p.numero}ª parcela`}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink, flex: 1 }}>{fmtMoney(p.valor)}</span>
                    <span style={{ fontSize: 11, color: TOKENS.muted }}>venc. {fmtDate(p.vencimento)}</span>

                    {/* Links de comprovante */}
                    {p.pago && p.comprovanteUrl && (
                      <a
                        href={p.comprovanteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 11, color: TOKENS.green, textDecoration: 'none', background: TOKENS.greenSoft, borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}
                      >
                        🧾 Comprovante
                      </a>
                    )}

                    {!p.pago && !estaConfirmando && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmando(p.id); setComprovanteFile(null); }}
                        style={{
                          fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 6,
                          border: 'none', background: TOKENS.green, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                        }}
                      >
                        Marcar pago
                      </button>
                    )}

                    {p.pago && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleParcela(p.id, false); }}
                        style={{
                          fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 6,
                          border: `1px solid ${TOKENS.line}`, background: '#fff', color: TOKENS.muted, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                        }}
                      >
                        Desfazer
                      </button>
                    )}
                  </div>

                  {/* Painel inline de confirmação de pagamento */}
                  {estaConfirmando && (
                    <div
                      style={{
                        background: TOKENS.greenSoft, border: `1px solid ${TOKENS.green}30`,
                        borderTop: 'none', borderRadius: '0 0 9px 9px',
                        padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: 12, color: TOKENS.ink2, fontWeight: 600 }}>Comprovante (opcional):</span>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        style={{
                          fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 7,
                          border: `1px solid ${TOKENS.green}50`, background: '#fff', color: TOKENS.ink2,
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        📎 {comprovanteFile ? comprovanteFile.name : 'Anexar arquivo'}
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        style={{ display: 'none' }}
                        onChange={(e) => setComprovanteFile(e.target.files?.[0] ?? null)}
                      />
                      <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); cancelarConfirmacao(); }}
                          style={{
                            fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 7,
                            border: `1px solid ${TOKENS.line}`, background: '#fff', color: TOKENS.muted, cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          disabled={salvando}
                          onClick={(e) => { e.stopPropagation(); confirmarPagamento(p.id); }}
                          style={{
                            fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 7,
                            border: 'none', background: salvando ? TOKENS.line : TOKENS.green,
                            color: salvando ? TOKENS.muted : '#fff', cursor: salvando ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          {salvando ? 'Salvando…' : '✓ Confirmar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {gasto.observacoes && (
            <p style={{ fontSize: 12, color: TOKENS.ink2, background: TOKENS.line2, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
              {gasto.observacoes}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              style={{
                fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 7,
                border: `1px solid ${TOKENS.line}`, background: '#fff', color: TOKENS.ink2, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ✎ Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Remover "${gasto.descricao}"?`)) onDelete();
              }}
              style={{
                fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 7,
                border: `1px solid ${TOKENS.redSoft}`, background: TOKENS.redSoft, color: TOKENS.red, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
