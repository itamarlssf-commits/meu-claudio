'use client';

import { TOKENS } from '@/lib/tokens';

interface KPIProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: string;
}

export default function KPI({ label, value, sub, accent = TOKENS.primary, icon }: KPIProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e8eaed',
        borderRadius: 12,
        borderTop: `3px solid ${accent}`,
        padding: '16px 18px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: TOKENS.muted,
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          fontFamily: 'ui-monospace, monospace',
          color: TOKENS.ink,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: TOKENS.muted, marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}
