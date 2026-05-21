'use client';

import type { CSSProperties } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  style?: CSSProperties;
  padding?: string | number;
  className?: string;
}

export default function Card({ children, style, padding = 20, className }: CardProps) {
  return (
    <div
      className={clsx(className)}
      style={{
        background: '#ffffff',
        border: '1px solid #e8eaed',
        borderRadius: 14,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
