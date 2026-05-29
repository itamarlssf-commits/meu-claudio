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
  isDragging,
  onDragStart,
  onDragEnd,
  onMove,
  onConvert,
  onDelete,
}: {
  lead: Lead;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
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
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', lead.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      style={{
        background: '#fff',
        borderRadius: 10,
        padding: '11px 12px',
        border: `1px solid ${TOKENS.line}`,
        boxShadow: isDragging ? TOKENS.shadowMd : TOKENS.shadowSm,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        opacity: isDragging ? 0.4 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'opacity 0.15s ease, box-shadow 0.15s ease',
        userSelect: 'none',
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
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);

  const draggedLead = draggedId ? leads.find((l) => l.id === draggedId) : null;

  function moveStatus(lead: Lead, status: LeadStatus) {
    onSaveLead({ ...lead, status });
  }

  function handleDragOver(e: React.DragEvent, colStatus: LeadStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== colStatus) setDragOverStatus(colStatus);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStatus(null);
    }
  }

  function handleDrop(e: React.DragEvent, colStatus: LeadStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const lead = leads.find((l) => l.id === id);
    if (lead && lead.status !== colStatus) {
      moveStatus(lead, colStatus);
    }
    setDragOverStatus(null);
    setDraggedId(null);
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
        const isOver = dragOverStatus === col.status && draggedLead?.status !== col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
            style={{
              borderRadius: 12,
              border: isOver
                ? `2px dashed ${col.bar}`
                : '2px solid transparent',
              background: isOver ? `${col.bar}10` : 'transparent',
              padding: isOver ? 6 : 0,
              transition: 'border 0.15s ease, background 0.15s ease, padding 0.15s ease',
            }}
          >
            {/* Column header */}
            <div
              style={{
                background: isOver ? col.bg : col.bg,
                border: `1px solid ${col.bar}40`,
                borderRadius: 10,
                padding: '9px 12px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: isOver ? `0 0 0 2px ${col.bar}40` : 'none',
                transition: 'box-shadow 0.15s ease',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 60 }}>
              {colLeads.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '24px 12px',
                    fontSize: 12,
                    color: isOver ? col.color : TOKENS.muted,
                    border: `1.5px dashed ${isOver ? col.bar : TOKENS.line}`,
                    borderRadius: 10,
                    fontWeight: isOver ? 700 : 400,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isOver ? '↓ Soltar aqui' : 'Nenhum lead'}
                </div>
              ) : (
                <>
                  {colLeads.map((lead) => (
                    <KanbanCard
                      key={lead.id}
                      lead={lead}
                      isDragging={draggedId === lead.id}
                      onDragStart={() => setDraggedId(lead.id)}
                      onDragEnd={() => { setDraggedId(null); setDragOverStatus(null); }}
                      onMove={(status) => moveStatus(lead, status)}
                      onConvert={() => onConvert(lead)}
                      onDelete={() => onRemoveLead(lead.id)}
                    />
                  ))}
                  {isOver && (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '12px',
                        fontSize: 12,
                        color: col.color,
                        border: `1.5px dashed ${col.bar}`,
                        borderRadius: 10,
                        fontWeight: 700,
                        background: `${col.bar}08`,
                      }}
                    >
                      ↓ Soltar aqui
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
