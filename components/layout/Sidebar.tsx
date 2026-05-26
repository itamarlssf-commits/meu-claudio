'use client';

import { useRef } from 'react';
import type { User } from 'firebase/auth';
import type { AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { alertasCobrancaDPP } from '@/lib/business-logic';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { id: 'dashboard',   label: 'Visão Geral',   icon: '◉' },
  { id: 'pacientes',   label: 'Pacientes',      icon: '♀' },
  { id: 'atendimento', label: 'Atendimentos',   icon: '☎' },
  { id: 'financeiro',  label: 'Financeiro',     icon: '₊' },
  { id: 'agenda',      label: 'Agenda',         icon: '◷' },
  { id: 'alertas',     label: 'Alertas',        icon: '◈' },
];

interface SidebarProps {
  view: string;
  onNav: (v: string) => void;
  data: AppData;
  setData: (d: AppData) => void;
  user: User | null;
  syncStatus: 'connecting' | 'live' | 'offline';
  onSignOut: () => void;
  leadsOverdueCount?: number;
}

export default function Sidebar({ view, onNav, data, setData, user, syncStatus, onSignOut, leadsOverdueCount = 0 }: SidebarProps) {
  const importRef = useRef<HTMLInputElement>(null);

  const alertasCount = data.pacientes.filter((p) => alertasCobrancaDPP(p).length > 0).length;
  const pendentesCount = data.pacientes.filter((p) => p.status === 'pendente' || p.status === 'parcial').length;

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
          setData(parsed);
          alert(`Importado com sucesso! ${parsed.pacientes.length} pacientes carregadas.`);
        } else {
          alert('Arquivo inválido: sem campo "pacientes".');
        }
      } catch {
        alert('Arquivo inválido. Verifique o JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const syncColor = { live: TOKENS.green, connecting: TOKENS.amber, offline: TOKENS.red };
  const syncLabel = { live: 'Sincronizado', connecting: 'Conectando…', offline: 'Offline' };

  return (
    <aside
      style={{
        width: 236,
        minWidth: 236,
        background: '#ffffff',
        borderRight: `1px solid ${TOKENS.line}`,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        flexShrink: 0,
        boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
      }}
    >
      {/* Branding */}
      <div
        style={{
          padding: '24px 20px 20px',
          background: `linear-gradient(135deg, ${TOKENS.primary} 0%, #2c4a7c 100%)`,
          borderBottom: '3px solid #b8915a',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'rgba(184,145,90,0.25)',
            border: '1.5px solid rgba(184,145,90,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            fontSize: 16,
            fontWeight: 700,
            color: TOKENS.accent2,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          IS
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          Dr. Itamar Santana
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.55)',
            marginTop: 4,
          }}
        >
          Ginecologia · Obstetrícia
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {NAV.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={active ? 'nav-active' : 'nav-item'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                background: active ? `${TOKENS.primary}12` : 'transparent',
                color: active ? TOKENS.primary : TOKENS.ink2,
                marginBottom: 2,
                transition: 'all 0.15s',
                textAlign: 'left',
                justifyContent: 'space-between',
                borderLeft: active ? `3px solid ${TOKENS.primary}` : '3px solid transparent',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: active ? TOKENS.primary : TOKENS.line2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    color: active ? '#fff' : TOKENS.muted,
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </span>
              {item.id === 'atendimento' && leadsOverdueCount > 0 && (
                <span
                  style={{
                    background: active ? `rgba(31,58,95,0.2)` : TOKENS.amberSoft,
                    color: active ? TOKENS.primary : TOKENS.amber,
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 7px',
                    minWidth: 20,
                    textAlign: 'center',
                  }}
                >
                  {leadsOverdueCount}
                </span>
              )}
              {item.id === 'alertas' && alertasCount > 0 && (
                <span
                  style={{
                    background: active ? TOKENS.primary : TOKENS.red,
                    color: '#fff',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 7px',
                    minWidth: 20,
                    textAlign: 'center',
                  }}
                >
                  {alertasCount}
                </span>
              )}
              {item.id === 'pacientes' && pendentesCount > 0 && (
                <span
                  style={{
                    background: active ? `rgba(31,58,95,0.2)` : TOKENS.amberSoft,
                    color: active ? TOKENS.primary : TOKENS.amber,
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 7px',
                    minWidth: 20,
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

      {/* Backup */}
      <div
        style={{
          margin: '0 10px 10px',
          padding: '12px 14px',
          background: TOKENS.line2,
          borderRadius: 12,
          border: `1px solid ${TOKENS.line}`,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: TOKENS.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 8,
          }}
        >
          Backup de dados
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleExport}
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: 600,
              padding: '6px 8px',
              borderRadius: 7,
              border: `1px solid ${TOKENS.line}`,
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
              borderRadius: 7,
              border: `1px solid ${TOKENS.line}`,
              background: '#fff',
              color: TOKENS.ink2,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ↑ Importar
          </button>
          <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </div>
      </div>

      {/* Footer: sync + user */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: `1px solid ${TOKENS.line2}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Sync pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: `${syncColor[syncStatus]}15`,
            border: `1px solid ${syncColor[syncStatus]}30`,
            borderRadius: 20,
            padding: '4px 10px',
            width: 'fit-content',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: syncColor[syncStatus],
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 10, fontWeight: 600, color: syncColor[syncStatus] }}>
            {syncLabel[syncStatus]}
          </span>
        </div>

        {/* User + sign out */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 10, color: TOKENS.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {user?.email}
          </div>
          <button
            onClick={onSignOut}
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 6,
              border: `1px solid ${TOKENS.line}`,
              background: 'transparent',
              color: TOKENS.muted,
              cursor: 'pointer',
              fontFamily: 'inherit',
              flexShrink: 0,
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
