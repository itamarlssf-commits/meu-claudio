'use client';

import { TOKENS } from '@/lib/tokens';

interface BarItem {
  label: string;
  value: number;
  color?: string;
  short?: string;
}

interface MiniBarProps {
  data: BarItem[];
  color?: string;
  max?: number;
  height?: number;
  showValues?: boolean;
}

export default function MiniBar({
  data,
  color = TOKENS.primary,
  max,
  height = 80,
  showValues = true,
}: MiniBarProps) {
  const maxVal = max ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: height + 28 }}>
      {data.map((item) => {
        const pct = Math.max(0, (item.value / maxVal) * height);
        return (
          <div
            key={item.label}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
          >
            {showValues && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: TOKENS.ink2,
                  marginBottom: 3,
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                {item.value}
              </div>
            )}
            <div
              style={{
                width: '100%',
                height,
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: pct || 3,
                  background: item.color || color,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s ease',
                }}
              />
            </div>
            <div
              style={{
                fontSize: 9,
                color: TOKENS.muted,
                textAlign: 'center',
                marginTop: 3,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.short || item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
