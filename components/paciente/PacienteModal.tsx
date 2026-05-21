'use client';

import { useState } from 'react';
import type { AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import {
  fmtDate,
  fmtMoney,
  totalPago,
  saldo,
  pctPago,
  idadeGestacional,
  whatsAppCobranca,
  alertasCobrancaDPP,
} from '@/lib/business-logic';
import { Modal, Chip, Mini, Btn } from '@/components/ui';
import TabFinanceiro from './TabFinanceiro';
import TabMulti from './TabMulti';
import TabParto from './TabParto';
import TabConsultas from './TabConsultas';
import TabObs from './TabObs';
import TabEditar from './TabEditar';

type TabId = 'financeiro' | 'multi' | 'parto' | 'consultas' | 'obs' | 'editar';

const TABS: { id: TabId; label: string }[] = [
  { id: 'financeiro', label: '💰 Financeiro' },
  { id: 'multi',      label: '👩‍⚕️ Multi' },
  { id: 'parto',      label: '🤱 Parto' },
  { id: 'consultas',  label: '📅 Consultas' },
  { id: 'obs',        label: '📝 Obs' },
  { id: 'editar',     label: '✏️ Editar' },
];

interface Props {
  pacienteId: string;
  data: AppData;
  setData: (d: AppData) => void;
  onClose: () => void;
}

export default function PacienteModal({ pacienteId, data, setData, onClose }: Props) {
  const [tab, setTab] = useState<TabId>('financeiro');
  const paciente = data.pacientes.find((p) => p.id === pacienteId);

  if (!paciente) return null;

  const ig      = idadeGestacional(paciente.dum);
  const alertas = alertasCobrancaDPP(paciente);
  const total   = totalPago(paciente);
  const sld     = saldo(paciente);
  const pct     = pctPago(paciente);
  const waLink  = whatsAppCobranca(paciente);

  const statusConfig: Record<string, { color: 'green' | 'amber' | 'red'; label: string }> = {
    pago:     { color: 'green', label: '✓ Pago' },
    parcial:  { color: 'amber', label: '◑ Parcial' },
    pendente: { color: 'red',   label: '○ Pendente' },
  };
  const sc = statusConfig[paciente.status] || { color: 'gray' as const, label: paciente.status };

  return (
    <Modal open onClose={onClose} width={760}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${TOKENS.primary} 0%, #2c4a7c 100%)`,
          padding: '20px 24px 18px',
          borderBottom: `3px solid ${TOKENS.accent}`,
          borderRadius: '16px 16px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: 8,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {paciente.nome}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
              <Chip color={sc.color}>{sc.label}</Chip>
              <Chip color="blue">{paciente.via}</Chip>
              <Chip color="gold">{paciente.pacote}</Chip>
              {alertas.length > 0 && <Chip color="red">⚡ {alertas[0].label}</Chip>}
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginLeft: 2 }}>
                📞 {paciente.telefone}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexShrink: 0 }}>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                padding: '7px 13px',
                borderRadius: 9,
                background: '#25d366',
                color: '#fff',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(37,211,102,0.35)',
              }}
            >
              📱 Cobrar
            </a>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* DPP / DUM / IG row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'DPP', value: fmtDate(paciente.dpp) },
            { label: 'DUM', value: fmtDate(paciente.dum) },
            ...(ig ? [{ label: 'IG', value: `${ig.semanas}s ${ig.dias}d` }] : []),
          ].map((item) => (
            <div key={item.label} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              {item.label}:{' '}
              <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{item.value}</strong>
            </div>
          ))}
        </div>

        {/* Mini KPIs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <Mini label="Contrato"  value={fmtMoney(paciente.contrato)} />
          <Mini label="Pago"      value={fmtMoney(total)} color={TOKENS.green} />
          <Mini label="Saldo"     value={fmtMoney(sld)}   color={sld > 0 ? TOKENS.amber : TOKENS.green} />
          <Mini label="%"         value={`${pct}%`}       color={pct >= 100 ? TOKENS.green : TOKENS.amber} />
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${TOKENS.line}`,
          overflowX: 'auto',
          padding: '0 8px',
          background: '#fafafa',
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '12px 14px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? TOKENS.primary : TOKENS.muted,
              borderBottom: tab === t.id ? `2px solid ${TOKENS.primary}` : '2px solid transparent',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              transition: 'color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ maxHeight: '58vh', overflowY: 'auto' }}>
        {tab === 'financeiro' && <TabFinanceiro paciente={paciente} data={data} setData={setData} />}
        {tab === 'multi'      && <TabMulti      paciente={paciente} data={data} setData={setData} />}
        {tab === 'parto'      && <TabParto      paciente={paciente} data={data} setData={setData} />}
        {tab === 'consultas'  && <TabConsultas  paciente={paciente} data={data} setData={setData} />}
        {tab === 'obs'        && <TabObs        paciente={paciente} data={data} setData={setData} />}
        {tab === 'editar'     && <TabEditar     paciente={paciente} data={data} setData={setData} onClose={onClose} />}
      </div>
    </Modal>
  );
}
