'use client';

import { useState } from 'react';
import { TOKENS } from '@/lib/tokens';
import type { LeadMotivo } from '@/types/lead';
import { ARVORES } from '@/lib/decision-trees';

interface HistoricoItem {
  nodeId: string;
  opcaoLabel: string;
}

interface Props {
  motivo: LeadMotivo;
  nome?: string;
}

export default function DecisionTreeFlow({ motivo, nome }: Props) {
  const arvore = ARVORES[motivo];
  const [currentId, setCurrentId] = useState(arvore.raiz);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [copied, setCopied] = useState(false);

  const no = arvore.nos[currentId];
  const isTerminal = !no.opcoes || no.opcoes.length === 0;
  const isRaiz = historico.length === 0;

  const textoFinal = no.texto.replace(/\[nome\]/gi, nome || '[nome]');

  function navegar(nextId: string, opcaoLabel: string) {
    setHistorico((h) => [...h, { nodeId: currentId, opcaoLabel }]);
    setCurrentId(nextId);
    setCopied(false);
  }

  function voltar() {
    if (!historico.length) return;
    setCurrentId(historico[historico.length - 1].nodeId);
    setHistorico((h) => h.slice(0, -1));
    setCopied(false);
  }

  function resetar() {
    setHistorico([]);
    setCurrentId(arvore.raiz);
    setCopied(false);
  }

  function copiar() {
    navigator.clipboard.writeText(textoFinal).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Trilha de decisões */}
      {historico.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexWrap: 'wrap',
            padding: '6px 10px',
            background: TOKENS.line2,
            borderRadius: 8,
            border: `1px solid ${TOKENS.line}`,
          }}
        >
          <button
            onClick={resetar}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 11,
              color: TOKENS.primary,
              cursor: 'pointer',
              fontWeight: 700,
              fontFamily: 'inherit',
            }}
          >
            Início
          </button>
          {historico.map((h, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: TOKENS.muted, fontSize: 10 }}>›</span>
              <span style={{ fontSize: 11, color: TOKENS.ink2 }}>{h.opcaoLabel}</span>
            </span>
          ))}
        </div>
      )}

      {/* Script box */}
      <div
        style={{
          background: '#f0fdf4',
          border: `1px solid ${TOKENS.green}40`,
          borderRadius: 12,
          padding: '14px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: TOKENS.green,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            📞 Fala assim:
          </span>
          <button
            onClick={copiar}
            style={{
              background: 'none',
              border: `1px solid ${TOKENS.green}50`,
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 600,
              color: TOKENS.green,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {copied ? '✓ Copiado' : '📋 Copiar'}
          </button>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: '#166534',
            fontStyle: 'italic',
            lineHeight: 1.75,
          }}
        >
          {textoFinal}
        </p>
      </div>

      {/* Dica */}
      {no.dica && (
        <div
          style={{
            background: TOKENS.blueSoft,
            border: `1px solid ${TOKENS.blue}30`,
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
          <p style={{ margin: 0, fontSize: 12, color: '#1e3a8a', lineHeight: 1.6 }}>
            {no.dica}
          </p>
        </div>
      )}

      {/* Pergunta + Opções */}
      {!isTerminal && (
        <div>
          {no.pergunta && (
            <p
              style={{
                margin: '4px 0 8px',
                fontSize: 11,
                fontWeight: 800,
                color: TOKENS.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              🔀 {no.pergunta}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {no.opcoes!.map((op) => (
              <button
                key={op.nextId}
                onClick={() => navegar(op.nextId, op.label)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${TOKENS.amber}60`,
                  background: '#fffbeb',
                  color: '#92400e',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#fef3c7';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#fffbeb';
                }}
              >
                <span>{op.label}</span>
                <span style={{ color: TOKENS.amber, fontSize: 12, fontWeight: 700 }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navegação inferior */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!isRaiz && (
          <>
            <button
              onClick={voltar}
              style={{
                padding: '6px 13px',
                borderRadius: 8,
                border: `1px solid ${TOKENS.line}`,
                background: '#fff',
                color: TOKENS.muted,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ← Voltar
            </button>
            <button
              onClick={resetar}
              style={{
                padding: '6px 13px',
                borderRadius: 8,
                border: `1px solid ${TOKENS.line}`,
                background: '#fff',
                color: TOKENS.muted,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ↺ Reiniciar
            </button>
          </>
        )}
        {isTerminal && (
          <div
            style={{
              padding: '6px 13px',
              borderRadius: 8,
              background: `${TOKENS.green}15`,
              border: `1px solid ${TOKENS.green}40`,
              color: TOKENS.green,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            ✓ Script completo — prossiga para agendamento
          </div>
        )}
      </div>
    </div>
  );
}
