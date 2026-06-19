'use client';

import { useState } from 'react';
import { signInPonto as signIn } from '@/lib/ponto-firebase-app';
import { TOKENS } from '@/lib/tokens';
import { inputBase } from '@/lib/input-styles';
import { Btn } from '@/components/ui';

export default function PontoLogin() {
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
      if (
        msg.includes('invalid-credential') ||
        msg.includes('wrong-password') ||
        msg.includes('user-not-found')
      ) {
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
        background: `radial-gradient(ellipse at 60% 40%, #e8eef7 0%, #fafaf7 60%)`,
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: 20,
            border: `1px solid ${TOKENS.line}`,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(31,58,95,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${TOKENS.primary} 0%, #2c4a7c 100%)`,
              padding: '32px 36px 28px',
              borderBottom: `3px solid ${TOKENS.accent}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'rgba(184,145,90,0.2)',
                border: '2px solid rgba(184,145,90,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                fontSize: 24,
              }}
            >
              🕐
            </div>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Ponto Eletrônico
            </h1>
            <p
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.6)',
                marginTop: 5,
                marginBottom: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
              }}
            >
              Registro de jornada
            </p>
          </div>

          <div style={{ padding: '28px 32px 32px' }}>
            <p
              style={{
                fontSize: 13,
                color: TOKENS.muted,
                marginTop: 0,
                marginBottom: 22,
                textAlign: 'center',
              }}
            >
              Entre com seu e-mail e senha
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: TOKENS.ink2,
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
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
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
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
                    color: '#dc2626',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 13,
                    border: '1px solid #fecaca',
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
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </Btn>
            </form>
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: TOKENS.muted,
            marginTop: 20,
            opacity: 0.7,
          }}
        >
          Controle interno de jornada
        </p>
      </div>
    </div>
  );
}
