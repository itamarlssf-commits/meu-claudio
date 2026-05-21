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
        borderRadius: 14,
        borderLeft: `4px solid ${accent}`,
        padding: '16px 18px',
        minWidth: 0,
        boxShadow: TOKENS.shadowSm,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: TOKENS.muted,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        {icon && (
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: `${accent}18`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
            }}
          >
            {icon}
          </span>
        )}
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: TOKENS.ink,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: TOKENS.muted }}>{sub}</div>
      )}
    </div>
  );
}
