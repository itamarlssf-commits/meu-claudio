'use client';

import { TOKENS } from '@/lib/tokens';

interface FieldProps {
  label?: string;
  children: React.ReactNode;
  hint?: string;
}

export default function Field({ label, children, hint }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: TOKENS.ink2,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </label>
      )}
      {children}
      {hint && <div style={{ fontSize: 11, color: TOKENS.muted }}>{hint}</div>}
    </div>
  );
}
