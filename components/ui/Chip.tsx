'use client';

import { TOKENS } from '@/lib/tokens';

type ChipColor = 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'pink' | 'gold' | 'gray';
type ChipSize = 'sm' | 'xs';

interface ChipProps {
  children: React.ReactNode;
  color?: ChipColor;
  size?: ChipSize;
}

const colorMap: Record<ChipColor, { bg: string; fg: string }> = {
  green: { bg: TOKENS.greenSoft, fg: TOKENS.green },
  red: { bg: TOKENS.redSoft, fg: TOKENS.red },
  amber: { bg: TOKENS.amberSoft, fg: TOKENS.amber },
  blue: { bg: TOKENS.blueSoft, fg: TOKENS.blue },
  purple: { bg: TOKENS.purpleSoft, fg: TOKENS.purple },
  pink: { bg: TOKENS.pinkSoft, fg: TOKENS.pink },
  gold: { bg: '#fef9ec', fg: TOKENS.accent },
  gray: { bg: TOKENS.line2, fg: TOKENS.muted },
};

export default function Chip({ children, color = 'gray', size = 'sm' }: ChipProps) {
  const { bg, fg } = colorMap[color];
  const fontSize = size === 'xs' ? 10 : 11;
  const padding = size === 'xs' ? '1px 6px' : '2px 8px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: bg,
        color: fg,
        borderRadius: 20,
        fontSize,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        padding,
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}
