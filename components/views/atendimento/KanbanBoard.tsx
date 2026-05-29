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
  leads: Lead[];
  onSaveLead: (lead: Lead) => void;
  onRemoveLead: (id: string) => void;
  onConvert: (lead: Lead) => void;
}

interface ColDef {
  status: LeadStatus;
  label: string;
  color: string;
  bg: string;
  bar: string;
}

const COLS: ColDef[] = [
  { status: 'pendente', label: '⏳ Pendente',    color: '#92400e', bg: TOKENS.amberSoft, bar: TOKENS.amber },
  { status: 'retornar', label: '📞 Retornar',    color: '#1e3a8a', bg: TOKENS.blueSoft,  bar: TOKENS.blue  },
  { status: 'agendou',  label: '✅ Agendou',     color: '#166534', bg: TOKENS.greenSoft, bar: TOKENS.green },
  { status: 'perdeu',   label: '✗ Não agendou',  color: '#991b1b', bg: TOKENS.redSoft,   bar: TOKENS.red   },
];

function KanbanCard({
  lead,
  onMove,
  onConvert,
  onDelete,
}: {
  lead: Lead;
  onMove: (status: LeadStatus) => void;
  onConvert: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const aging = leadAgingDays(lead);
  const overdue = isRetornoOverdue(lead);
  const numContatos = lead.contatos?.length ?? 0;
  const waLink = lead.status === 'agendou' ? whatsAppConfirmacao(lead) : whatsAppRetornar(lead);

  function copyPhone() {
    navigator.clipboard.writeText(lead.telefone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        padding: '11px 12px',
        border: `1px solid ${TOKENS.line}`,
        boxShadow: TOKENS.shadowSm,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Name + aging */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <strong style={{ fontSize: 13, color: TOKENS.ink, lineHeight: 1.3, flex: 1 }}>
          {lead.nome}
        </strong>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {aging > 0 && (
            <span
              style={{
                background: aging < 2 ? TOKENS.greenSoft : aging < 5 ? TOKENS.amberSoft : TOKENS.redSoft,
                color: aging < 2 ? '#166534' : aging < 5 ? '#92400e' : '#991b1b',
                borderRadius: 20,
                padding: '1px 7px',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {aging}d
            </span>
          )}
          {overdue && (
            <span
              style={{
                background: TOKENS.redSoft,
                color: TOKENS.red,
                borderRadius: 20,
                padding: '1px 6px',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              ⚠
            </span>
          )}
        </div>
      </div>

      {/* Motivo */}
      <div style={{ fontSize: 11, color: TOKENS.ink2 }}>{lead.motivoLabel}</div>

      {/* Phone */}
      <div
        onClick={copyPhone}
        title="Copiar telefone"
        style={{
          fontSize: 11,
          color: TOKENS.muted,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        📱 {lead.telefone}
        <span style={{ fontSize: 10, color: copied ? TOKENS.green : TOKENS.muted }}>
          {copied ? '✓' : '⧉'}
        </span>
      </div>

      {/* Consulta date */}
      {lead.dataConsulta && lead.status === 'agendou' && (
        <div style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>
          📅 {new Date(lead.dataConsulta + 'T12:00:00').toLocaleDateString('pt-BR')}
          {lead.horaConsulta && ` às ${lead.horaConsulta}`}
        </div>
      )}

      {/* Retorno date */}
      {lead.dataRetorno && lead.status === 'retornar' && (
        <div style={{ fontSize: 11, color: overdue ? TOKENS.red : TOKENS.muted }}>
          📅 {new Date(lead.dataRetorno + 'T12:00:00').toLocaleDateString('pt-BR')}
        </div>
      )}

      {/* Contatos */}
      <div style={{ fontSize: 11, color: numContatos > 0 ? '#1e3a8a' : TOKENS.muted }}>
        📞 {numContatos} {numContatos === 1 ? 'contato' : 'contatos'}
      </div>

      {/* Origem */}
      <div style={{ fontSize: 10, color: TOKENS.muted }}>via {lead.origem}</div>

      {/* Actions */}
      <div
        style={{
          borderTop: `1px dashed ${TOKENS.line}`,
          paddingTop: 8,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
        }}
      >
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#25d366',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          📲 WA
        </a>

        {lead.status !== 'agendou' && (
          <button
            onClick={() => onMove('agendou')}
            style={{
              background: TOKENS.greenSoft,
              color: '#166534',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✓ Agendou
          </button>
        )}

        {lead.status !== 'retornar' && lead.status !== 'agendou' && (
          <button
            onClick={() => onMove('retornar')}
            style={{
              background: TOKENS.blueSoft,
              color: '#1e3a8a',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            📞 Retornar
          </button>
        )}

        {lead.status === 'retornar' && (
          <button
            onClick={() => onMove('pendente')}
            style={{
              background: TOKENS.amberSoft,
              color: '#92400e',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ⏳ Pendente
          </button>
        )}

        {lead.status === 'agendou' && (
          <button
            onClick={onConvert}
            style={{
              background: `${TOKENS.primary}12`,
              color: TOKENS.primary,
              border: `1px solid ${TOKENS.primary}30`,
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + Paciente
          </button>
        )}

        {confirmDelete ? (
          <>
            <button
              onClick={onDelete}
              style={{
                background: TOKENS.redSoft,
                color: TOKENS.red,
                border: 'none',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
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
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ×
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              background: TOKENS.redSoft,
              color: TOKENS.red,
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 10,
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

export default function KanbanBoard({ leads, onSaveLead, onRemoveLead, onConvert }: Props) {
  function moveStatus(lead: Lead, status: LeadStatus) {
    onSaveLead({ ...lead, status });
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 8,
        alignItems: 'start',
      }}
    >
      {COLS.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.status);
        return (
          <div key={col.status}>
            {/* Column header */}
            <div
              style={{
                background: col.bg,
                border: `1px solid ${col.bar}40`,
                borderRadius: 10,
                padding: '9px 12px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 12, color: col.color }}>
                {col.label}
              </span>
              <span
                style={{
                  background: col.bar,
                  color: '#fff',
                  borderRadius: 20,
                  padding: '1px 9px',
                  fontSize: 11,
                  fontWeight: 800,
                  minWidth: 22,
                  textAlign: 'center',
                }}
              >
                {colLeads.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {colLeads.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '24px 12px',
                    fontSize: 12,
                    color: TOKENS.muted,
                    border: `1.5px dashed ${TOKENS.line}`,
                    borderRadius: 10,
                  }}
                >
                  Nenhum lead
                </div>
              ) : (
                colLeads.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    onMove={(status) => moveStatus(lead, status)}
                    onConvert={() => onConvert(lead)}
                    onDelete={() => onRemoveLead(lead.id)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
