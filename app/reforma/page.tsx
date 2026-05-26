'use client';

import { useState } from 'react';
import { useReformaPublic } from '@/hooks/useReformaPublic';
import ReformaView from '@/components/views/ReformaView';
import { TOKENS } from '@/lib/tokens';

const SYNC_COLOR = { live: TOKENS.green, connecting: TOKENS.amber, offline: TOKENS.red };
const SYNC_LABEL = { live: 'Ao vivo', connecting: 'Conectando…', offline: 'Offline' };

export default function ReformaPage() {
  const { reforma, setReforma, loading, syncStatus } = useReformaPublic();
  const [copiado, setCopiado] = useState(false);

  function copiarLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafaf7',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid #e8eaed',
            borderTop: `3px solid ${TOKENS.primary}`,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: TOKENS.muted, fontSize: 13 }}>Carregando reforma…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf7' }}>
      {/* Header */}
      <header
        style={{
          background: `linear-gradient(135deg, ${TOKENS.primary} 0%, #2c4a7c 100%)`,
          borderBottom: '3px solid #b8915a',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(184,145,90,0.25)',
              border: '1.5px solid rgba(184,145,90,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            🏗
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: '#fff',
                fontFamily: "Georgia, 'Times New Roman', serif",
                letterSpacing: '-0.01em',
              }}
            >
              Reforma Ellas
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Controle de gastos · 10 sócios
            </div>
          </div>
        </div>

        {/* Direita: sync + compartilhar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Sync */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: `${SYNC_COLOR[syncStatus]}20`,
              border: `1px solid ${SYNC_COLOR[syncStatus]}50`,
              borderRadius: 20,
              padding: '4px 10px',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: SYNC_COLOR[syncStatus],
                animation: syncStatus === 'live' ? 'none' : 'pulse 1s infinite',
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 600, color: SYNC_COLOR[syncStatus] }}>
              {SYNC_LABEL[syncStatus]}
            </span>
          </div>

          {/* Compartilhar */}
          <button
            onClick={copiarLink}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.25)',
              background: copiado ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.12)',
              color: copiado ? TOKENS.green : '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 12,
              transition: 'all 0.2s',
            }}
          >
            {copiado ? '✓ Link copiado!' : '🔗 Compartilhar'}
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <ReformaView reformaData={reforma} setReformaData={setReforma} />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
