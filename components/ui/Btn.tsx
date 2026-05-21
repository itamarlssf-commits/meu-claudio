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
  primary: { background: TOKENS.primary, color: '#fff', border: 'none' },
  accent: { background: TOKENS.accent, color: '#fff', border: 'none' },
  outline: { background: 'transparent', color: TOKENS.primary, border: `1.5px solid ${TOKENS.primary}` },
  ghost: { background: 'transparent', color: TOKENS.ink2, border: '1.5px solid #e8eaed' },
  danger: { background: TOKENS.red, color: '#fff', border: 'none' },
  success: { background: TOKENS.green, color: '#fff', border: 'none' },
  whatsapp: { background: '#25d366', color: '#fff', border: 'none' },
};

const sizeStyles: Record<Size, CSSProperties> = {
  sm: { fontSize: 12, padding: '5px 12px', borderRadius: 7 },
  md: { fontSize: 13, padding: '8px 16px', borderRadius: 8 },
  lg: { fontSize: 15, padding: '11px 22px', borderRadius: 10 },
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
        transition: 'opacity 0.15s',
        whiteSpace: 'nowrap',
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
