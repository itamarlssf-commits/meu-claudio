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
  { id: 'multi', label: '👩‍⚕️ Multi' },
  { id: 'parto', label: '🤱 Parto & Sócio' },
  { id: 'consultas', label: '📅 Consultas' },
  { id: 'obs', label: '📝 Obs' },
  { id: 'editar', label: '✏️ Editar' },
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

  const ig = idadeGestacional(paciente.dum);
  const alertas = alertasCobrancaDPP(paciente);
  const total = totalPago(paciente);
  const sld = saldo(paciente);
  const pct = pctPago(paciente);
  const waLink = whatsAppCobranca(paciente);

  const statusChip: Record<string, { color: 'green' | 'amber' | 'red'; label: string }> = {
    pago: { color: 'green', label: '✓ Pago' },
    parcial: { color: 'amber', label: '◑ Parcial' },
    pendente: { color: 'red', label: '○ Pendente' },
  };
  const sc = statusChip[paciente.status] || { color: 'gray' as const, label: paciente.status };

  return (
    <Modal open onClose={onClose} width={740}>
      {/* Header */}
      <div style={{ padding: '18px 22px', borderBottom: `1px solid ${TOKENS.line}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 18,
                fontWeight: 700,
                color: TOKENS.primary,
                marginBottom: 6,
              }}
            >
              {paciente.nome}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <Chip color={sc.color}>{sc.label}</Chip>
              <Chip color="blue">{paciente.via}</Chip>
              <Chip color="gold">{paciente.pacote}</Chip>
              {alertas.length > 0 && <Chip color="red">⚡ {alertas[0].label}</Chip>}
              <span style={{ fontSize: 12, color: TOKENS.muted }}>
                📞 {paciente.telefone}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                fontWeight: 700,
                padding: '7px 12px',
                borderRadius: 8,
                background: '#25d366',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              📱 Cobrar
            </a>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 22,
                cursor: 'pointer',
                color: TOKENS.muted,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* DPP / DUM / IG */}
        <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: TOKENS.muted }}>
            DPP: <strong style={{ color: TOKENS.ink2 }}>{fmtDate(paciente.dpp)}</strong>
          </div>
          <div style={{ fontSize: 12, color: TOKENS.muted }}>
            DUM: <strong style={{ color: TOKENS.ink2 }}>{fmtDate(paciente.dum)}</strong>
          </div>
          {ig && (
            <div style={{ fontSize: 12, color: TOKENS.muted }}>
              IG: <strong style={{ color: TOKENS.blue }}>{ig.semanas}s {ig.dias}d</strong>
            </div>
          )}
        </div>

        {/* Mini KPIs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <Mini label="Contrato" value={fmtMoney(paciente.contrato)} />
          <Mini label="Pago" value={fmtMoney(total)} color={TOKENS.green} />
          <Mini label="Saldo" value={fmtMoney(sld)} color={sld > 0 ? TOKENS.amber : TOKENS.green} />
          <Mini label="%" value={`${pct}%`} color={pct >= 100 ? TOKENS.green : TOKENS.amber} />
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${TOKENS.line}`,
          overflowX: 'auto',
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '11px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? TOKENS.primary : TOKENS.muted,
              borderBottom: tab === t.id ? `2px solid ${TOKENS.primary}` : '2px solid transparent',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {tab === 'financeiro' && (
          <TabFinanceiro paciente={paciente} data={data} setData={setData} />
        )}
        {tab === 'multi' && (
          <TabMulti paciente={paciente} data={data} setData={setData} />
        )}
        {tab === 'parto' && (
          <TabParto paciente={paciente} data={data} setData={setData} />
        )}
        {tab === 'consultas' && (
          <TabConsultas paciente={paciente} data={data} setData={setData} />
        )}
        {tab === 'obs' && (
          <TabObs paciente={paciente} data={data} setData={setData} />
        )}
        {tab === 'editar' && (
          <TabEditar paciente={paciente} data={data} setData={setData} onClose={onClose} />
        )}
      </div>
    </Modal>
  );
}
