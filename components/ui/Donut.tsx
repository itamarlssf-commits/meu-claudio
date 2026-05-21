'use client';

import { TOKENS } from '@/lib/tokens';

interface DonutSlice {
  value: number;
  color: string;
  label: string;
}

interface DonutProps {
  slices: DonutSlice[];
  size?: number;
}

export default function Donut({ slices, size = 120 }: DonutProps) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = -circumference / 4; // start at top

  const arcs = slices.map((slice) => {
    const pct = total > 0 ? slice.value / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const arc = (
      <circle
        key={slice.label}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={slice.color}
        strokeWidth={14}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
    );
    offset -= dash;
    return arc;
  });

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={TOKENS.line2} strokeWidth={14} />
        {arcs}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            fontFamily: 'ui-monospace, monospace',
            color: TOKENS.ink,
          }}
        >
          {total}
        </div>
        <div style={{ fontSize: 9, color: TOKENS.muted }}>total</div>
      </div>
    </div>
  );
}
