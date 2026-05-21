'use client';

import { TOKENS } from '@/lib/tokens';

interface MiniProps {
  label: string;
  value: string | number;
  color?: string;
}

export default function Mini({ label, value, color = TOKENS.ink }: MiniProps) {
  return (
    <div
      style={{
        background: TOKENS.line2,
        borderRadius: 8,
        padding: '8px 12px',
        minWidth: 80,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'ui-monospace, monospace',
          color,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 9, color: TOKENS.muted, marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
    </div>
  );
}
