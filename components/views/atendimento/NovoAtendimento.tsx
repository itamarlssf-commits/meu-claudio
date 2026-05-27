'use client';

import { useState, useMemo } from 'react';
import type { Lead, LeadMotivo, LeadOrigem, LeadStatus } from '@/types/lead';
import type { Paciente } from '@/types/paciente';
import { MOTIVO_LABELS } from '@/types/lead';
import { TOKENS } from '@/lib/tokens';
import {
  SCRIPTS,
  genLeadId,
  findDuplicatePhone,
  formatPhone,
} from '@/lib/leads-logic';
import { todayISO } from '@/lib/business-logic';
import ScriptBox from './ScriptBox';
import ObjecaoPanel from './ObjecaoPanel';

const ORIGENS: LeadOrigem[] = [
  'Instagram',
  'Indicação (amiga/familiar)',
  'Indicação médica',
  'Google',
  'WhatsApp',
  'Outra',
];

const MOTIVOS = Object.entries(MOTIVO_LABELS) as [LeadMotivo, string][];

const STEP_LABELS = ['📞 Contato', '🎯 Motivo', '💬 Atendimento', '✅ Resultado', '📋 Resumo'];

interface FormState {
  nome: string;
  telefone: string;
  email: string;
  origem: LeadOrigem | '';
  motivo: LeadMotivo | '';
  observacoes: string;
  status: LeadStatus | '';
  hora: string;
  dataRetorno: string;
  objetaoCodigo: string;
}

const emptyForm = (): FormState => ({
  nome: '',
  telefone: '',
  email: '',
  origem: '',
  motivo: '',
  observacoes: '',
  status: '',
  hora: '',
  dataRetorno: '',
  objetaoCodigo: '',
});

interface Props {
  leads: Lead[];
  pacientes: Paciente[];
  onSave: (lead: Lead) => void;
  onCancel: () => void;
  userEmail: string;
}

export default function NovoAtendimento({ leads, pacientes, onSave, onCancel, userEmail }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm());

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const duplicate = useMemo(
    () => findDuplicatePhone(form.telefone, leads, pacientes),
    [form.telefone, leads, pacientes],
  );

  const canNext = () => {
    if (step === 0) return form.nome.trim().length > 0 && form.telefone.replace(/\D/g, '').length >= 8 && form.origem !== '';
    return true;
  };

  function handleSave() {
    if (!form.motivo || !form.status || !form.origem) return;
    const lead: Lead = {
      id: genLeadId(),
      nome: form.nome.trim(),
      telefone: form.telefone,
      email: form.email || undefined,
      origem: form.origem as LeadOrigem,
      motivo: form.motivo as LeadMotivo,
      motivoLabel: MOTIVO_LABELS[form.motivo as LeadMotivo],
      status: form.status as LeadStatus,
      data: todayISO(),
      hora: form.hora,
      observacoes: form.observacoes,
      timestamp: Date.now(),
      dataRetorno: form.status === 'retornar' && form.dataRetorno ? form.dataRetorno : undefined,
      objetaoCodigo: form.objetaoCodigo || undefined,
      criadoPor: userEmail,
    };
    onSave(lead);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 13px',
    border: `1.5px solid ${TOKENS.line}`,
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
    color: TOKENS.ink,
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: TOKENS.muted,
    display: 'block',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button
          onClick={onCancel}
          style={{
            background: TOKENS.line2,
            border: `1px solid ${TOKENS.line}`,
            borderRadius: 8,
            padding: '7px 14px',
            cursor: 'pointer',
            fontSize: 13,
            color: TOKENS.muted,
            fontFamily: 'inherit',
            fontWeight: 600,
          }}
        >
          ← Voltar
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: TOKENS.ink }}>
            Novo Atendimento
          </h2>
          {form.nome && (
            <p style={{ margin: '2px 0 0', color: TOKENS.muted, fontSize: 12 }}>
              Paciente: {form.nome}
            </p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          {STEP_LABELS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    background: done ? TOKENS.green : active ? TOKENS.primary : '#fff',
                    color: done || active ? '#fff' : TOKENS.muted,
                    fontWeight: 700,
                    fontSize: 12,
                    border: `2px solid ${done ? TOKENS.green : active ? TOKENS.primary : TOKENS.line}`,
                  }}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: active ? TOKENS.primary : TOKENS.muted,
                    marginTop: 4,
                    textAlign: 'center',
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {s.split(' ').slice(1).join(' ')}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ height: 4, background: TOKENS.line, borderRadius: 4 }}>
          <div
            style={{
              height: '100%',
              background: TOKENS.green,
              borderRadius: 4,
              width: `${(step / (STEP_LABELS.length - 1)) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: 22,
          border: `1px solid ${TOKENS.line}`,
          marginBottom: 20,
        }}
      >
        {/* Step 0 — Identificação */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ScriptBox
              script="Olá! Consultório do Dr. Itamar Santana, aqui é [seu nome]! Com quem eu tenho o prazer de falar?"
            />
            <div>
              <label style={labelStyle}>Nome da paciente *</label>
              <input
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
                placeholder="Nome completo"
                style={{ ...inputStyle, borderColor: form.nome ? TOKENS.green : TOKENS.line }}
              />
            </div>
            <div>
              <label style={labelStyle}>Telefone / WhatsApp *</label>
              <input
                value={form.telefone}
                onChange={(e) => set('telefone', formatPhone(e.target.value))}
                placeholder="(81) 99999-9999"
                style={{ ...inputStyle, borderColor: form.telefone ? TOKENS.green : TOKENS.line }}
              />
              {duplicate && (
                <div
                  style={{
                    marginTop: 6,
                    padding: '7px 12px',
                    background: TOKENS.amberSoft,
                    border: `1px solid ${TOKENS.amber}50`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#92400e',
                    fontWeight: 600,
                  }}
                >
                  ⚠️ Este telefone já existe: <strong>{duplicate.nome}</strong> ({duplicate.type === 'lead' ? 'lead' : 'paciente cadastrada'})
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>E-mail (opcional)</label>
              <input
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="email@exemplo.com"
                type="email"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Como nos encontrou? *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {ORIGENS.map((o) => (
                  <button
                    key={o}
                    onClick={() => set('origem', o)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 20,
                      border: `1.5px solid ${form.origem === o ? TOKENS.green : TOKENS.line}`,
                      background: form.origem === o ? `${TOKENS.green}1A` : '#fff',
                      color: form.origem === o ? TOKENS.green : TOKENS.muted,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Motivo */}
        {step === 1 && (
          <div>
            <ScriptBox
              script={`Que ótimo que entrou em contato, ${form.nome || '[nome]'}! Me conta um pouquinho — o que te trouxe até nós hoje?`}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {MOTIVOS.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => set('motivo', id)}
                  style={{
                    padding: '13px 12px',
                    borderRadius: 12,
                    border: `2px solid ${form.motivo === id ? TOKENS.primary : TOKENS.line}`,
                    background: form.motivo === id ? `${TOKENS.primary}12` : '#fff',
                    color: form.motivo === id ? TOKENS.primary : TOKENS.ink,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {form.motivo && (
              <ScriptBox
                script={SCRIPTS[form.motivo as LeadMotivo]}
                label="💬 Script para este motivo:"
              />
            )}
          </div>
        )}

        {/* Step 2 — Atendimento */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: TOKENS.blueSoft,
                border: `1px solid ${TOKENS.blue}30`,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: TOKENS.blue,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                🎯 Transição para agendamento
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#1e3a8a', fontStyle: 'italic', lineHeight: 1.75 }}>
                &quot;Então, {form.nome || '[nome]'}, vou verificar os próximos horários disponíveis pra você. A agenda do Dr. Itamar está bem concorrida — qual dia da semana você prefere?&quot;
              </p>
            </div>
            <ObjecaoPanel
              onObjecaoClick={(codigo) => set('objetaoCodigo', codigo)}
              selectedCodigo={form.objetaoCodigo}
            />
            <div>
              <label style={labelStyle}>Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => set('observacoes', e.target.value)}
                placeholder="Algo importante sobre a paciente ou o atendimento..."
                rows={3}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Step 3 — Resultado */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ScriptBox script="Perfeito! A consulta está marcada. Vou enviar a confirmação pelo WhatsApp agora. O Dr. Itamar vai te receber muito bem. Alguma dúvida?" />
            <div>
              <label style={labelStyle}>Resultado do atendimento *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(
                  [
                    { s: 'agendou', label: '✅ Paciente Agendou!', bg: TOKENS.green, color: '#fff' },
                    { s: 'retornar', label: '📞 Precisa de Retorno', bg: TOKENS.blue, color: '#fff' },
                    { s: 'pendente', label: '⏳ Pendente / Vai Pensar', bg: TOKENS.amber, color: '#fff' },
                    { s: 'perdeu', label: '✗ Não Agendou', bg: '#fff', color: TOKENS.red, border: `2px solid ${TOKENS.red}` },
                  ] as { s: LeadStatus; label: string; bg: string; color: string; border?: string }[]
                ).map(({ s, label, bg, color, border }) => (
                  <button
                    key={s}
                    onClick={() => set('status', s)}
                    style={{
                      padding: 13,
                      borderRadius: 10,
                      border: border || 'none',
                      background: form.status === s ? bg : form.status ? `${bg}30` : bg,
                      color: form.status === s ? color : TOKENS.muted,
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      outline: form.status === s ? `3px solid ${bg}` : 'none',
                      outlineOffset: 2,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {form.status === 'retornar' && (
              <div>
                <label style={labelStyle}>Data para retornar *</label>
                <input
                  type="date"
                  value={form.dataRetorno}
                  onChange={(e) => set('dataRetorno', e.target.value)}
                  min={todayISO()}
                  style={inputStyle}
                />
              </div>
            )}
            <div>
              <label style={labelStyle}>Horário da ligação</label>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => set('hora', e.target.value)}
                style={{ ...inputStyle, width: 'auto' }}
              />
            </div>
          </div>
        )}

        {/* Step 4 — Resumo */}
        {step === 4 && (
          <div>
            <ScriptBox script="Tudo registrado! Qualquer dúvida, pode me chamar no WhatsApp. Até breve!" />
            <div
              style={{
                background: TOKENS.line2,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                border: `1px solid ${TOKENS.line}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: TOKENS.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 10,
                }}
              >
                Resumo do Atendimento
              </div>
              {[
                { label: 'Paciente', value: form.nome },
                { label: 'Telefone', value: form.telefone },
                { label: 'E-mail', value: form.email || '—' },
                { label: 'Origem', value: form.origem },
                { label: 'Motivo', value: form.motivo ? MOTIVO_LABELS[form.motivo as LeadMotivo] : '—' },
                { label: 'Resultado', value: form.status },
                { label: 'Retornar em', value: form.dataRetorno ? new Date(form.dataRetorno + 'T12:00:00').toLocaleDateString('pt-BR') : '—' },
                { label: 'Observações', value: form.observacoes || '—' },
              ].map((r, i, arr) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '7px 0',
                    borderBottom: i < arr.length - 1 ? `1px solid ${TOKENS.line}` : 'none',
                  }}
                >
                  <span style={{ fontSize: 12, color: TOKENS.muted, fontWeight: 600 }}>{r.label}</span>
                  <span style={{ fontSize: 13, color: TOKENS.ink, fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>
                    {r.value || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            style={{
              padding: '10px 22px',
              borderRadius: 10,
              border: `1.5px solid ${TOKENS.line}`,
              background: '#fff',
              color: TOKENS.muted,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ← Anterior
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            style={{
              padding: '10px 26px',
              borderRadius: 10,
              border: 'none',
              background: canNext() ? TOKENS.primary : TOKENS.line,
              color: canNext() ? '#fff' : TOKENS.muted,
              fontWeight: 700,
              fontSize: 14,
              cursor: canNext() ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
            }}
          >
            Próximo →
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={!form.status}
            style={{
              padding: '11px 28px',
              borderRadius: 10,
              border: 'none',
              background: form.status ? TOKENS.green : TOKENS.line,
              color: form.status ? '#fff' : TOKENS.muted,
              fontWeight: 700,
              fontSize: 15,
              cursor: form.status ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              boxShadow: form.status ? `0 2px 8px ${TOKENS.green}40` : 'none',
            }}
          >
            ✓ Salvar Atendimento
          </button>
        )}
      </div>
    </div>
  );
}
