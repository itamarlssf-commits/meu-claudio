'use client';

import type { CSSProperties } from 'react';
import clsx from 'clsx';
import { TOKENS } from '@/lib/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: CSSProperties;
  padding?: string | number;
  className?: string;
  clickable?: boolean;
}

export default function Card({ children, style, padding = 20, className, clickable }: CardProps) {
  return (
    <div
      className={clsx(className, clickable && 'card-hover')}
      style={{
        background: '#ffffff',
        border: `1px solid ${TOKENS.line}`,
        borderRadius: 16,
        padding,
        boxShadow: TOKENS.shadowSm,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
