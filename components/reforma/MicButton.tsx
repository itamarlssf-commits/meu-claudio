'use client';

import { useCallback } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { TOKENS } from '@/lib/tokens';

interface Props {
  onResult: (text: string) => void;
  append?: boolean; // se true, adiciona ao texto existente; se false, substitui
}

export default function MicButton({ onResult, append = true }: Props) {
  const { listening, start, stop, supported } = useVoiceInput(onResult);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      title={listening ? 'Parar gravação' : 'Ditar por voz (pt-BR)'}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: listening ? `1.5px solid ${TOKENS.red}` : `1.5px solid ${TOKENS.line}`,
        background: listening ? TOKENS.redSoft : '#fff',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        flexShrink: 0,
        transition: 'all 0.15s',
        animation: listening ? 'pulse 1s infinite' : 'none',
      }}
    >
      {listening ? '⏹' : '🎤'}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </button>
  );
}
