'use client';

import { useRef } from 'react';
import type { User } from 'firebase/auth';
import type { AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { alertasCobrancaDPP } from '@/lib/business-logic';
import { signOutUser } from '@/lib/firebase';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Visão Geral', icon: '📊' },
  { id: 'pacientes', label: 'Pacientes', icon: '👤' },
  { id: 'financeiro', label: 'Financeiro', icon: '💰' },
  { id: 'agenda', label: 'Agenda', icon: '📅' },
  { id: 'alertas', label: 'Alertas', icon: '⚡' },
];

interface SidebarProps {
  view: string;
  onNav: (v: string) => void;
  data: AppData;
  user: User | null;
  syncStatus: 'connecting' | 'live' | 'offline';
  onSignOut: () => void;
}

export default function Sidebar({ view, onNav, data, user, syncStatus, onSignOut }: SidebarProps) {
  const importRef = useRef<HTMLInputElement>(null);

  const alertasCount = data.pacientes.filter(
    (p) => alertasCobrancaDPP(p).length > 0
  ).length;
  const pendentesCount = data.pacientes.filter(
    (p) => p.status === 'pendente' || p.status === 'parcial'
  ).length;

  function handleExport() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultorio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as AppData;
        if (parsed.pacientes) {
          alert('Backup importado! Recarregue a página para ver os dados.');
          localStorage.setItem('controle_consultorio_v1', JSON.stringify(parsed));
        }
      } catch {
        alert('Arquivo inválido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const syncDot: Record<string, string> = {
    live: TOKENS.green,
    connecting: TOKENS.amber,
    offline: TOKENS.red,
  };

  return (
    <aside
      style={{
        width: 230,
        minWidth: 230,
        background: '#ffffff',
        borderRight: `1px solid ${TOKENS.line}`,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Branding */}
      <div
        style={{
          padding: '22px 18px 16px',
          borderBottom: `1px solid ${TOKENS.line2}`,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 15,
            fontWeight: 700,
            color: TOKENS.primary,
            lineHeight: 1.2,
          }}
        >
          Dr. Itamar Santana
        </div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: TOKENS.muted,
            marginTop: 3,
          }}
        >
          Consultório · Painel
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 10px', flex: 1 }}>
        {NAV.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 10px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                background: active ? TOKENS.primary : 'transparent',
                color: active ? '#fff' : TOKENS.ink2,
                marginBottom: 2,
                transition: 'all 0.15s',
                textAlign: 'left',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </span>
              {item.id === 'alertas' && alertasCount > 0 && (
                <span
                  style={{
                    background: active ? 'rgba(255,255,255,0.3)' : TOKENS.red,
                    color: '#fff',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                    minWidth: 18,
                    textAlign: 'center',
                  }}
                >
                  {alertasCount}
                </span>
              )}
              {item.id === 'pacientes' && pendentesCount > 0 && (
                <span
                  style={{
                    background: active ? 'rgba(255,255,255,0.3)' : TOKENS.line,
                    color: active ? '#fff' : TOKENS.ink2,
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                    minWidth: 18,
                    textAlign: 'center',
                  }}
                >
                  {pendentesCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Backup card */}
      <div
        style={{
          margin: '0 10px 10px',
          padding: '12px 12px',
          background: TOKENS.line2,
          borderRadius: 10,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: TOKENS.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}
        >
          Backup
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleExport}
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: 600,
              padding: '6px 8px',
              borderRadius: 6,
              border: `1.5px solid ${TOKENS.line}`,
              background: '#fff',
              color: TOKENS.ink2,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ↓ Exportar
          </button>
          <button
            onClick={() => importRef.current?.click()}
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: 600,
              padding: '6px 8px',
              borderRadius: 6,
              border: `1.5px solid ${TOKENS.line}`,
              background: '#fff',
              color: TOKENS.ink2,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ↑ Importar
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>
      </div>

      {/* Sync status + user */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: `1px solid ${TOKENS.line2}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: syncDot[syncStatus] || TOKENS.muted,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, color: TOKENS.muted }}>
            {syncStatus === 'live' ? 'Sincronizado' : syncStatus === 'connecting' ? 'Conectando…' : 'Offline'}
          </span>
        </div>
        {user && (
          <div style={{ fontSize: 11, color: TOKENS.muted, wordBreak: 'break-all' }}>
            {user.email}
          </div>
        )}
        <button
          onClick={onSignOut}
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '5px 10px',
            borderRadius: 6,
            border: `1.5px solid ${TOKENS.line}`,
            background: 'transparent',
            color: TOKENS.ink2,
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left',
          }}
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
