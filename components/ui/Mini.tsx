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
        border: `1px solid ${TOKENS.line}`,
        borderRadius: 10,
        padding: '8px 14px',
        minWidth: 84,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color,
          letterSpacing: '-0.01em',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 9, color: TOKENS.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}
