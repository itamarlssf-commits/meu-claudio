'use client';

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { TOKENS } from '@/lib/tokens';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: string;
  style?: CSSProperties;
}

const variantStyles: Record<Variant, CSSProperties> = {
  primary:  { background: TOKENS.primary, color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(31,58,95,0.25)' },
  accent:   { background: TOKENS.accent, color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(184,145,90,0.3)' },
  outline:  { background: 'transparent', color: TOKENS.primary, border: `1.5px solid ${TOKENS.primary}` },
  ghost:    { background: 'transparent', color: TOKENS.ink2, border: `1.5px solid ${TOKENS.line}` },
  danger:   { background: TOKENS.red, color: '#fff', border: 'none' },
  success:  { background: TOKENS.green, color: '#fff', border: 'none', boxShadow: '0 2px 6px rgba(16,185,129,0.3)' },
  whatsapp: { background: '#25d366', color: '#fff', border: 'none', boxShadow: '0 2px 6px rgba(37,211,102,0.3)' },
};

const sizeStyles: Record<Size, CSSProperties> = {
  sm: { fontSize: 12, padding: '5px 12px', borderRadius: 8 },
  md: { fontSize: 13, padding: '8px 18px', borderRadius: 9 },
  lg: { fontSize: 14, padding: '11px 24px', borderRadius: 10 },
};

export default function Btn({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  style,
  ...rest
}: BtnProps) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'opacity 0.15s, transform 0.1s, box-shadow 0.15s',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...rest}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
