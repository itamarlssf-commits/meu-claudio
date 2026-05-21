'use client';

import { TOKENS } from '@/lib/tokens';

interface ProgressProps {
  value: number;
  color?: string;
  height?: number;
}

export default function Progress({ value, color = TOKENS.green, height = 7 }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: height / 2,
        background: TOKENS.line2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: height / 2,
          background: color,
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}
