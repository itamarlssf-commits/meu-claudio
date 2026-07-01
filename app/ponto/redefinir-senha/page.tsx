'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verificarCodigoDeSenha, confirmarNovaSenha } from '@/lib/ponto-firebase-app';
import { TOKENS } from '@/lib/tokens';
import { inputBase } from '@/lib/input-styles';
import { Btn } from '@/components/ui';

type Estado = 'verificando' | 'pronto' | 'invalido' | 'sucesso';

export default function RedefinirSenhaPage() {
  const params = useSearchParams();
  const oobCode = params.get('oobCode') ?? '';

  const [estado, setEstado] = useState<Estado>('verificando');
  const [emailAlvo, setEmailAlvo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setEstado('invalido');
      return;
    }
    verificarCodigoDeSenha(oobCode)
      .then((email) => {
        setEmailAlvo(email);
        setEstado('pronto');
      })
      .catch(() => setEstado('invalido'));
  }, [oobCode]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.');
      return;
    }
    setSalvando(true);
    try {
      await confirmarNovaSenha(oobCode, senha);
      setEstado('sucesso');
    } catch {
      setErro('Não foi possível salvar a senha. Peça um novo link.');
    } finally {
      setSalvando(false);
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
            padding: '32px 32px 36px',
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 700, color: TOKENS.primary, margin: '0 0 6px' }}>
            Criar senha
          </h1>

          {estado === 'verificando' && (
            <p style={{ color: TOKENS.muted, fontSize: 13 }}>Verificando o link…</p>
          )}

          {estado === 'invalido' && (
            <p style={{ color: TOKENS.muted, fontSize: 13, lineHeight: 1.5 }}>
              Este link é inválido ou expirou. Volte para a tela de login e peça um novo em
              &ldquo;Primeiro acesso ou esqueceu a senha?&rdquo;.
            </p>
          )}

          {estado === 'sucesso' && (
            <p style={{ color: TOKENS.muted, fontSize: 13, lineHeight: 1.5 }}>
              Senha criada! Volte para <a href="/ponto">a tela de login</a> e entre normalmente.
            </p>
          )}

          {estado === 'pronto' && (
            <>
              <p style={{ color: TOKENS.muted, fontSize: 13, marginBottom: 18 }}>
                Defina a senha para <strong>{emailAlvo}</strong>
              </p>
              <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Nova senha (mín. 6 caracteres)"
                  required
                  style={inputBase}
                />
                <input
                  type="password"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  placeholder="Confirme a senha"
                  required
                  style={inputBase}
                />
                {erro && (
                  <div
                    style={{
                      background: TOKENS.redSoft,
                      color: '#dc2626',
                      borderRadius: 10,
                      padding: '10px 14px',
                      fontSize: 13,
                    }}
                  >
                    {erro}
                  </div>
                )}
                <Btn
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={salvando}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {salvando ? 'Salvando…' : 'Salvar senha'}
                </Btn>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
