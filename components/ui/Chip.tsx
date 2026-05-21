'use client';

import { TOKENS } from '@/lib/tokens';

type ChipColor = 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'pink' | 'gold' | 'gray';
type ChipSize = 'sm' | 'xs';

interface ChipProps {
  children: React.ReactNode;
  color?: ChipColor;
  size?: ChipSize;
}

const colorMap: Record<ChipColor, { bg: string; fg: string; border: string }> = {
  green:  { bg: TOKENS.greenSoft,  fg: '#059669', border: '#a7f3d0' },
  red:    { bg: TOKENS.redSoft,    fg: '#dc2626', border: '#fecaca' },
  amber:  { bg: TOKENS.amberSoft,  fg: '#d97706', border: '#fde68a' },
  blue:   { bg: TOKENS.blueSoft,   fg: '#2563eb', border: '#bfdbfe' },
  purple: { bg: TOKENS.purpleSoft, fg: '#7c3aed', border: '#ddd6fe' },
  pink:   { bg: TOKENS.pinkSoft,   fg: '#db2777', border: '#fbcfe8' },
  gold:   { bg: '#fef9ec',         fg: TOKENS.accent, border: '#fde68a' },
  gray:   { bg: TOKENS.line2,      fg: TOKENS.muted, border: TOKENS.line },
};

export default function Chip({ children, color = 'gray', size = 'sm' }: ChipProps) {
  const { bg, fg, border } = colorMap[color];
  const fontSize = size === 'xs' ? 10 : 11;
  const padding  = size === 'xs' ? '2px 7px' : '3px 9px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        borderRadius: 20,
        fontSize,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        padding,
        lineHeight: 1.4,
        letterSpacing: '0.01em',
      }}
    >
      {children}
    </span>
  );
}
