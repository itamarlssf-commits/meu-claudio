'use client';

import { useState } from 'react';
import { OBJECOES } from '@/lib/leads-logic';
import { TOKENS } from '@/lib/tokens';

interface Props {
  onObjecaoClick: (codigo: string) => void;
  selectedCodigo?: string;
}

export default function ObjecaoPanel({ onObjecaoClick, selectedCodigo }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div
      style={{
        background: '#fffbeb',
        border: `1px solid ${TOKENS.amber}50`,
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          padding: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontWeight: 700, color: '#92400e', fontSize: 13 }}>
          ⚠️ Paciente apresentou objeção?
          {selectedCodigo && (
            <span
              style={{
                marginLeft: 8,
                background: TOKENS.amberSoft,
                color: TOKENS.amber,
                borderRadius: 20,
                padding: '1px 8px',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              registrada
            </span>
          )}
        </span>
        <span style={{ color: TOKENS.muted, fontSize: 14 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {OBJECOES.map((ob) => (
            <div key={ob.codigo}>
              <button
                onClick={() => {
                  onObjecaoClick(ob.codigo);
                  setExpanded(expanded === ob.codigo ? null : ob.codigo);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: expanded === ob.codigo ? '#fef3c7' : '#fff',
                  border: `1px solid ${selectedCodigo === ob.codigo ? TOKENS.amber : '#fcd34d'}`,
                  borderRadius: expanded === ob.codigo ? '8px 8px 0 0' : 8,
                  padding: '9px 14px',
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#92400e',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {ob.titulo}
                {selectedCodigo === ob.codigo && (
                  <span style={{ fontSize: 10, color: TOKENS.amber }}>✓ selecionada</span>
                )}
              </button>
              {expanded === ob.codigo && (
                <div
                  style={{
                    background: '#fffde7',
                    border: `1px solid ${TOKENS.amber}50`,
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    padding: '12px 14px',
                    fontSize: 13,
                    color: '#78350f',
                    fontStyle: 'italic',
                    lineHeight: 1.75,
                  }}
                >
                  {ob.resposta}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
