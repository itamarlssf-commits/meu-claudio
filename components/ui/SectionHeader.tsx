'use client';

import { TOKENS } from '@/lib/tokens';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <h2
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 18,
            fontWeight: 700,
            color: TOKENS.primary,
            margin: 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
