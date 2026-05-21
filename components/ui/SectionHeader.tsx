'use client';

import { TOKENS } from '@/lib/tokens';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
      <div>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: TOKENS.primary,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 3, fontWeight: 400 }}>{subtitle}</div>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
