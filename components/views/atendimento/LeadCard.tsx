'use client';

import { useState } from 'react';
import type { Lead, LeadStatus } from '@/types/lead';
import { TOKENS } from '@/lib/tokens';
import {
  leadAgingDays,
  isRetornoOverdue,
  whatsAppConfirmacao,
  whatsAppRetornar,
} from '@/lib/leads-logic';

interface Props {
  lead: Lead;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
  onConvert: (lead: Lead) => void;
}

const STATUS_STYLE: Record<LeadStatus, { bg: string; color: string; bar: string; label: string }> = {
  agendou:  { bg: TOKENS.greenSoft,  color: '#166534', bar: TOKENS.green,  label: 'Agendou ✓' },
  pendente: { bg: TOKENS.amberSoft,  color: '#92400e', bar: TOKENS.amber,  label: 'Pendente' },
  retornar: { bg: TOKENS.blueSoft,   color: '#1e3a8a', bar: TOKENS.blue,   label: '📞 Retornar' },
  perdeu:   { bg: TOKENS.redSoft,    color: '#991b1b', bar: TOKENS.red,    label: 'Não agendou' },
};

function AgingBadge({ days }: { days: number }) {
  const color = days < 2 ? TOKENS.green : days < 5 ? TOKENS.amber : TOKENS.red;
  const bg = days < 2 ? TOKENS.greenSoft : days < 5 ? TOKENS.amberSoft : TOKENS.redSoft;
  if (days === 0) return null;
  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: 20,
        padding: '1px 8px',
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      {days}d
    </span>
  );
}

export default function LeadCard({ lead, onStatusChange, onDelete, onConvert }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const sc = STATUS_STYLE[lead.status];
  const aging = leadAgingDays(lead);
  const overdue = isRetornoOverdue(lead);
  const waLink = lead.status === 'agendou' ? whatsAppConfirmacao(lead) : whatsAppRetornar(lead);

  function handleCopyPhone() {
    navigator.clipboard.writeText(lead.telefone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '14px 16px',
        border: `1px solid ${TOKENS.line}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        boxShadow: TOKENS.shadowSm,
      }}
    >
      {/* Status bar */}
      <div
        style={{
          width: 4,
          minHeight: 52,
          borderRadius: 4,
          background: sc.bar,
          flexShrink: 0,
          alignSelf: 'stretch',
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <strong style={{ fontSize: 15, color: TOKENS.ink }}>{lead.nome}</strong>
          <span
            style={{
              background: sc.bg,
              color: sc.color,
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {sc.label}
          </span>
          <AgingBadge days={aging} />
          {overdue && (
            <span
              style={{
                background: TOKENS.redSoft,
                color: TOKENS.red,
                borderRadius: 20,
                padding: '2px 8px',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              Retorno vencido
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: 12,
            color: TOKENS.muted,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span
            style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
            onClick={handleCopyPhone}
            title="Copiar telefone"
          >
            📱 {lead.telefone}
            <span style={{ fontSize: 10, color: copied ? TOKENS.green : TOKENS.muted }}>
              {copied ? '✓' : '⧉'}
            </span>
          </span>
          {lead.motivoLabel && <span>{lead.motivoLabel}</span>}
          {lead.origem && <span>via {lead.origem}</span>}
          {lead.dataRetorno && lead.status === 'retornar' && (
            <span style={{ color: overdue ? TOKENS.red : TOKENS.muted }}>
              📅 Retornar em {new Date(lead.dataRetorno + 'T12:00:00').toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        {lead.observacoes && (
          <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 4, fontStyle: 'italic' }}>
            &quot;{lead.observacoes}&quot;
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        {/* WhatsApp */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#25d366',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            padding: '5px 10px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          📲 WA
        </a>

        {/* Mark as agendou */}
        {lead.status !== 'agendou' && (
          <button
            onClick={() => onStatusChange(lead.id, 'agendou')}
            style={{
              background: TOKENS.greenSoft,
              color: '#166534',
              border: 'none',
              borderRadius: 7,
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✓ Agendou
          </button>
        )}

        {/* Mark as retornar */}
        {lead.status !== 'retornar' && lead.status !== 'agendou' && (
          <button
            onClick={() => onStatusChange(lead.id, 'retornar')}
            style={{
              background: TOKENS.blueSoft,
              color: '#1e3a8a',
              border: 'none',
              borderRadius: 7,
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            📞
          </button>
        )}

        {/* Convert to patient */}
        {lead.status === 'agendou' && (
          <button
            onClick={() => onConvert(lead)}
            style={{
              background: `${TOKENS.primary}12`,
              color: TOKENS.primary,
              border: `1px solid ${TOKENS.primary}30`,
              borderRadius: 7,
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + Paciente
          </button>
        )}

        {/* Delete */}
        {confirmDelete ? (
          <>
            <button
              onClick={() => onDelete(lead.id)}
              style={{
                background: TOKENS.redSoft,
                color: TOKENS.red,
                border: 'none',
                borderRadius: 7,
                padding: '5px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                background: TOKENS.line2,
                color: TOKENS.muted,
                border: 'none',
                borderRadius: 7,
                padding: '5px 10px',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              background: TOKENS.redSoft,
              color: TOKENS.red,
              border: 'none',
              borderRadius: 7,
              padding: '5px 10px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}
