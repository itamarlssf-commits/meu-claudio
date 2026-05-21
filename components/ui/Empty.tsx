'use client';

import { TOKENS } from '@/lib/tokens';

interface EmptyProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export default function Empty({ title, subtitle, icon = '📭' }: EmptyProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        color: TOKENS.muted,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink2, marginBottom: 4 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12 }}>{subtitle}</div>}
    </div>
  );
}
