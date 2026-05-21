'use client';

import { useState } from 'react';
import { signIn } from '@/lib/firebase';
import { TOKENS } from '@/lib/tokens';
import { inputBase } from '@/lib/input-styles';
import { Btn } from '@/components/ui';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, senha);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao entrar';
      if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: TOKENS.bg,
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: `1px solid ${TOKENS.line}`,
          padding: '40px 36px',
          maxWidth: 380,
          width: '100%',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 22,
              fontWeight: 700,
              color: TOKENS.primary,
              margin: 0,
            }}
          >
            Dr. Itamar Santana
          </h1>
          <p style={{ fontSize: 13, color: TOKENS.muted, marginTop: 6, marginBottom: 0 }}>
            Painel de Gestão do Consultório
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: TOKENS.ink2,
                marginBottom: 5,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={inputBase}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: TOKENS.ink2,
                marginBottom: 5,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              style={inputBase}
            />
          </div>

          {error && (
            <div
              style={{
                background: TOKENS.redSoft,
                color: TOKENS.red,
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <Btn
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </Btn>
        </form>
      </div>
    </div>
  );
}
