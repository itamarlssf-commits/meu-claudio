'use client';

import { useState } from 'react';
import { TOKENS } from '@/lib/tokens';

interface Props {
  script: string;
  label?: string;
}

export default function ScriptBox({ script, label = '📞 Fala assim:' }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div
      style={{
        background: '#f0fdf4',
        border: `1px solid ${TOKENS.green}40`,
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 16,
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
          {label}
        </span>
        <button
          onClick={handleCopy}
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
        {script}
      </p>
    </div>
  );
}
