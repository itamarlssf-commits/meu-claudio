'use client';

import { useAppStore } from '@/store/use-app-store';
import AppProvider from '@/components/providers/AppProvider';
import LoginScreen from '@/components/auth/LoginScreen';
import AppShell from '@/components/layout/AppShell';

function AppContent() {
  const authReady = useAppStore((s) => s.authReady);
  const user = useAppStore((s) => s.user);

  if (!authReady) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafaf7',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid #e8eaed',
            borderTop: '3px solid #1f3a5f',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#7a8494', fontSize: 13 }}>Carregando…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AppShell />;
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
