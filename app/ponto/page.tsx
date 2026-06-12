'use client';

import { usePontoStore } from '@/store/use-ponto-store';
import PontoProvider from '@/components/ponto/PontoProvider';
import PontoLogin from '@/components/ponto/PontoLogin';
import BaterPontoView from '@/components/ponto/BaterPontoView';
import HistoricoView from '@/components/ponto/HistoricoView';
import AdminView from '@/components/ponto/AdminView';
import { TOKENS } from '@/lib/tokens';

function Carregando({ texto }: { texto: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: TOKENS.bg,
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid #e8eaed',
          borderTop: `3px solid ${TOKENS.primary}`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: TOKENS.muted, fontSize: 13 }}>{texto}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PontoContent() {
  const authReady = usePontoStore((s) => s.authReady);
  const user = usePontoStore((s) => s.user);
  const usuarioReady = usePontoStore((s) => s.usuarioReady);
  const usuario = usePontoStore((s) => s.usuario);
  const registros = usePontoStore((s) => s.registros);

  if (!authReady) return <Carregando texto="Carregando…" />;
  if (!user) return <PontoLogin />;
  if (!usuarioReady) return <Carregando texto="Verificando acesso…" />;

  // Logado, mas sem perfil no ponto (ex.: admin do consultório ainda não configurado)
  if (!usuario) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: TOKENS.bg,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h2 style={{ color: TOKENS.primary, fontSize: 18, margin: '0 0 8px' }}>
            Acesso não configurado
          </h2>
          <p style={{ color: TOKENS.muted, fontSize: 13, lineHeight: 1.5 }}>
            Sua conta entrou, mas ainda não tem um perfil de ponto. Peça ao administrador
            para liberar seu acesso em <strong>ponto_usuarios</strong>.
          </p>
        </div>
      </div>
    );
  }

  if (usuario.papel === 'admin') return <AdminView />;

  // Funcionária: bater ponto + histórico próprio
  return (
    <div style={{ background: TOKENS.bg, minHeight: '100vh' }}>
      <BaterPontoView />
      <HistoricoView registros={registros} />
    </div>
  );
}

export default function PontoPage() {
  return (
    <PontoProvider>
      <PontoContent />
    </PontoProvider>
  );
}
