'use client';

import { useState } from 'react';
import type { Lead, LeadStatus, ContatoTentativa, ContatoResultado } from '@/types/lead';
import { TOKENS } from '@/lib/tokens';
import { todayISO } from '@/lib/business-logic';
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
  onSave: (lead: Lead) => void;
}

const STATUS_STYLE: Record<LeadStatus, { bg: string; color: string; bar: string; label: string }> = {
  agendou:  { bg: TOKENS.greenSoft,  color: '#166534', bar: TOKENS.green,  label: 'Agendou ✓' },
  pendente: { bg: TOKENS.amberSoft,  color: '#92400e', bar: TOKENS.amber,  label: 'Pendente' },
  retornar: { bg: TOKENS.blueSoft,   color: '#1e3a8a', bar: TOKENS.blue,   label: '📞 Retornar' },
  perdeu:   { bg: TOKENS.redSoft,    color: '#991b1b', bar: TOKENS.red,    label: 'Não agendou' },
};

const RESULTADO_CONFIG: Record<ContatoResultado, { icone: string; cor: string; bg: string; label: string }> = {
  atendeu:      { icone: '✅', cor: '#166534', bg: TOKENS.greenSoft, label: 'Atendeu' },
  caixa_postal: { icone: '📬', cor: TOKENS.muted,  bg: TOKENS.line2,    label: 'Caixa postal' },
  nao_atendeu:  { icone: '📵', cor: '#92400e', bg: TOKENS.amberSoft, label: 'Não atendeu' },
  retornou:     { icone: '🔄', cor: '#1e3a8a', bg: TOKENS.blueSoft,  label: 'Retornou' },
  recusou:      { icone: '❌', cor: '#991b1b', bg: TOKENS.redSoft,   label: 'Recusou' },
};

const RESULTADO_OPTIONS: { valor: ContatoResultado; icone: string; label: string }[] = [
  { valor: 'atendeu',      icone: '✅', label: 'Atendeu' },
  { valor: 'caixa_postal', icone: '📬', label: 'Caixa postal' },
  { valor: 'nao_atendeu',  icone: '📵', label: 'Não atendeu' },
  { valor: 'retornou',     icone: '🔄', label: 'Retornou' },
  { valor: 'recusou',      icone: '❌', label: 'Recusou' },
];

function genContatoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

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

function ContatoItem({ contato }: { contato: ContatoTentativa }) {
  const cfg = RESULTADO_CONFIG[contato.resultado];
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap', fontSize: 12 }}>
      <span
        style={{
          background: cfg.bg,
          color: cfg.cor,
          padding: '1px 8px',
          borderRadius: 20,
          fontWeight: 700,
          fontSize: 11,
          whiteSpace: 'nowrap',
        }}
      >
        {cfg.icone} {cfg.label}
      </span>
      <span style={{ color: TOKENS.muted, whiteSpace: 'nowrap' }}>
        {new Date(contato.data + 'T12:00:00').toLocaleDateString('pt-BR')} às {contato.hora}
      </span>
      {contato.nota && (
        <span style={{ color: TOKENS.ink2, fontStyle: 'italic' }}>&quot;{contato.nota}&quot;</span>
      )}
    </div>
  );
}

export default function LeadCard({ lead, onStatusChange, onDelete, onConvert, onSave }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contatosOpen, setContatosOpen] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [novoResultado, setNovoResultado] = useState<ContatoResultado | ''>('');
  const [novaNota, setNovaNota] = useState('');

  const sc = STATUS_STYLE[lead.status];
  const aging = leadAgingDays(lead);
  const overdue = isRetornoOverdue(lead);
  const waLink = lead.status === 'agendou' ? whatsAppConfirmacao(lead) : whatsAppRetornar(lead);
  const numContatos = lead.contatos?.length ?? 0;

  function handleCopyPhone() {
    navigator.clipboard.writeText(lead.telefone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function openAddForm() {
    const now = new Date();
    setNovaData(todayISO());
    setNovaHora(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    );
    setNovoResultado('');
    setNovaNota('');
    setAddFormOpen(true);
    setContatosOpen(true);
  }

  function registrarContato() {
    if (!novoResultado) return;
    const tentativa: ContatoTentativa = {
      id: genContatoId(),
      data: novaData,
      hora: novaHora,
      resultado: novoResultado,
      nota: novaNota.trim() || undefined,
    };
    onSave({ ...lead, contatos: [tentativa, ...(lead.contatos ?? [])] });
    setAddFormOpen(false);
    setNovoResultado('');
    setNovaNota('');
  }

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: `1px solid ${TOKENS.line}`,
    borderRadius: 8,
    fontSize: 12,
    fontFamily: 'inherit',
    background: '#fff',
    color: TOKENS.ink,
    outline: 'none',
  };

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
        {/* Header row */}
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
          {/* Contatos badge */}
          <button
            onClick={() => setContatosOpen((v) => !v)}
            style={{
              background: numContatos === 0
                ? TOKENS.line2
                : numContatos < 3 ? TOKENS.blueSoft : TOKENS.amberSoft,
              color: numContatos === 0
                ? TOKENS.muted
                : numContatos < 3 ? '#1e3a8a' : '#92400e',
              borderRadius: 20,
              padding: '2px 9px',
              fontSize: 10,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            📞 {numContatos} {numContatos === 1 ? 'contato' : 'contatos'}
          </button>
        </div>

        {/* Meta row */}
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

        {/* Contatos expandable section */}
        {contatosOpen && (
          <div
            style={{
              marginTop: 10,
              borderTop: `1px dashed ${TOKENS.line}`,
              paddingTop: 10,
            }}
          >
            {/* Timeline */}
            {numContatos > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
                {lead.contatos!.map((c) => (
                  <ContatoItem key={c.id} contato={c} />
                ))}
              </div>
            )}

            {/* Inline form */}
            {addFormOpen ? (
              <div
                style={{
                  background: TOKENS.line2,
                  border: `1px solid ${TOKENS.line}`,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: TOKENS.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 10,
                  }}
                >
                  Registrar tentativa de contato
                </div>

                {/* Data + Hora */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    type="time"
                    value={novaHora}
                    onChange={(e) => setNovaHora(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Resultado pills */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                  {RESULTADO_OPTIONS.map((opt) => (
                    <button
                      key={opt.valor}
                      onClick={() => setNovoResultado(opt.valor)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 20,
                        border: `1.5px solid ${novoResultado === opt.valor ? RESULTADO_CONFIG[opt.valor].cor : TOKENS.line}`,
                        background: novoResultado === opt.valor
                          ? RESULTADO_CONFIG[opt.valor].bg
                          : '#fff',
                        color: novoResultado === opt.valor
                          ? RESULTADO_CONFIG[opt.valor].cor
                          : TOKENS.muted,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {opt.icone} {opt.label}
                    </button>
                  ))}
                </div>

                {/* Nota */}
                <textarea
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  placeholder="Nota (opcional)"
                  rows={2}
                  style={{ ...inputStyle, width: '100%', resize: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                />

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={registrarContato}
                    disabled={!novoResultado}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: novoResultado ? TOKENS.primary : TOKENS.line,
                      color: novoResultado ? '#fff' : TOKENS.muted,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: novoResultado ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit',
                    }}
                  >
                    ✓ Registrar
                  </button>
                  <button
                    onClick={() => setAddFormOpen(false)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: `1px solid ${TOKENS.line}`,
                      background: '#fff',
                      color: TOKENS.muted,
                      fontSize: 12,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={openAddForm}
                style={{
                  padding: '5px 12px',
                  borderRadius: 8,
                  border: `1px dashed ${TOKENS.primary}50`,
                  background: `${TOKENS.primary}08`,
                  color: TOKENS.primary,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                + Registrar contato
              </button>
            )}
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
