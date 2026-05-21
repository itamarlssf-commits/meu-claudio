'use client';

import { TOKENS } from '@/lib/tokens';

interface ProgressProps {
  value: number;
  color?: string;
}

export default function Progress({ value, color = TOKENS.green }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      style={{
        width: '100%',
        height: 6,
        borderRadius: 3,
        background: TOKENS.line2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: 3,
          background: color,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}
