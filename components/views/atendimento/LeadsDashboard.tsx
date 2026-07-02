'use client';

import { useState, useMemo } from 'react';
import type { Lead, LeadStatus, LeadOrigem } from '@/types/lead';
import type { Paciente } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { computeLeadMetrics } from '@/lib/leads-logic';
import { KPI, SectionHeader, Empty, Donut, Btn } from '@/components/ui';
import LeadCard from './LeadCard';
import KanbanBoard from './KanbanBoard';

interface Props {
  leads: Lead[];
  pacientes: Paciente[];
  onSaveLead: (lead: Lead) => void;
  onRemoveLead: (id: string) => void;
  onNovoAtendimento: () => void;
  onConvert: (lead: Lead) => void;
}

const ORIGENS: LeadOrigem[] = [
  'Instagram',
  'Indicação (amiga/familiar)',
  'Indicação médica',
  'Google',
  'WhatsApp',
  'Outra',
];

type ViewMode = 'list' | 'kanban';

export default function LeadsDashboard({
  leads,
  onSaveLead,
  onRemoveLead,
  onNovoAtendimento,
  onConvert,
}: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
  const [filterOrigem, setFilterOrigem] = useState<LeadOrigem | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const metrics = useMemo(() => computeLeadMetrics(leads), [leads]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return leads.filter((l) => {
      if (viewMode === 'list' && filterStatus !== 'all' && l.status !== filterStatus) return false;
      if (filterOrigem !== 'all' && l.origem !== filterOrigem) return false;
      if (q && !l.nome.toLowerCase().includes(q) && !l.telefone.includes(q)) return false;
      return true;
    });
  }, [leads, filterStatus, filterOrigem, search, viewMode]);

  function handleStatusChange(id: string, status: LeadStatus) {
    const lead = leads.find((l) => l.id === id);
    if (lead) onSaveLead({ ...lead, status });
  }

  const donutSlices = [
    { label: 'Agendou', value: metrics.agendou, color: TOKENS.green },
    { label: 'Pendente', value: metrics.pendente, color: TOKENS.amber },
    { label: 'Retornar', value: metrics.retornar, color: TOKENS.blue },
    { label: 'Não agendou', value: metrics.perdeu, color: TOKENS.red },
  ];

  const viewToggleStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 12px',
    borderRadius: 8,
    border: `1.5px solid ${active ? TOKENS.primary : TOKENS.line}`,
    background: active ? TOKENS.primary : '#fff',
    color: active ? '#fff' : TOKENS.muted,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    lineHeight: 1,
  });

  return (
    <div
      style={{
        padding: '24px 28px',
        maxWidth: viewMode === 'kanban' ? 1200 : 960,
        margin: '0 auto',
        transition: 'max-width 0.3s ease',
      }}
    >
      <SectionHeader
        title="Atendimentos / Leads"
        subtitle={`Hoje · ${new Date().toLocaleDateString('pt-BR')}`}
        action={
          <Btn variant="primary" size="md" onClick={onNovoAtendimento}>
            ＋ Novo Atendimento
          </Btn>
        }
      />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        <KPI label="Total de Leads" value={metrics.total} sub="todos os contatos" accent={TOKENS.primary} icon="📋" />
        <KPI
          label="Agendamentos"
          value={metrics.agendou}
          sub={`${metrics.conversionRate}% de conversão`}
          accent={TOKENS.green}
          icon="✅"
        />
        <KPI
          label="Pendentes"
          value={metrics.pendente + metrics.retornar}
          sub="aguardando contato"
          accent={TOKENS.amber}
          icon="⏳"
        />
        <KPI
          label="Retornos Vencidos"
          value={metrics.overdue}
          sub="precisam de ação agora"
          accent={metrics.overdue > 0 ? TOKENS.red : TOKENS.muted}
          icon="⚠️"
        />
      </div>

      {/* Analytics */}
      {leads.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 22 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '18px 20px',
              border: `1px solid ${TOKENS.line}`,
              boxShadow: TOKENS.shadowSm,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.muted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Distribuição por Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Donut slices={donutSlices} size={110} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {donutSlices.map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                      <span style={{ color: TOKENS.ink2 }}>{s.label}</span>
                    </span>
                    <span style={{ fontWeight: 700, color: TOKENS.ink }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '18px 20px',
              border: `1px solid ${TOKENS.line}`,
              boxShadow: TOKENS.shadowSm,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.muted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Conversão por Origem
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ORIGENS.filter((o) => metrics.byOrigem[o]?.total > 0).map((o) => {
                const d = metrics.byOrigem[o];
                const pct = Math.round((d.agendou / d.total) * 100);
                return (
                  <div key={o}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: TOKENS.ink2 }}>{o}</span>
                      <span style={{ color: TOKENS.muted }}>{d.agendou}/{d.total} · <strong>{pct}%</strong></span>
                    </div>
                    <div style={{ height: 5, background: TOKENS.line2, borderRadius: 3 }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: pct >= 60 ? TOKENS.green : pct >= 30 ? TOKENS.amber : TOKENS.red,
                          borderRadius: 3,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(metrics.byOrigem).length === 0 && (
                <span style={{ fontSize: 12, color: TOKENS.muted }}>Sem dados ainda</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overdue alert */}
      {metrics.overdue > 0 && (
        <div
          style={{
            background: '#fef2f2',
            border: `1px solid ${TOKENS.red}30`,
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <strong style={{ color: '#991b1b', fontSize: 13 }}>
              {metrics.overdue} retorno{metrics.overdue > 1 ? 's' : ''} vencido{metrics.overdue > 1 ? 's' : ''}!
            </strong>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#991b1b' }}>
              Entre em contato agora para não perder a conversão.
            </p>
          </div>
          <Btn
            size="sm"
            variant="ghost"
            style={{ marginLeft: 'auto' }}
            onClick={() => { setViewMode('list'); setFilterStatus('retornar'); }}
          >
            Ver retornos
          </Btn>
        </div>
      )}

      {/* Filters + view toggle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          style={{
            padding: '8px 14px',
            border: `1.5px solid ${TOKENS.line}`,
            borderRadius: 20,
            fontSize: 13,
            outline: 'none',
            fontFamily: 'inherit',
            width: 220,
            color: TOKENS.ink,
            background: '#fff',
          }}
        />

        {/* Status filters — list mode only */}
        {viewMode === 'list' && (
          <>
            {(
              [
                { key: 'all', label: 'Todos', count: metrics.total },
                { key: 'agendou', label: '✓ Agendou', count: metrics.agendou },
                { key: 'pendente', label: '⏳ Pendente', count: metrics.pendente },
                { key: 'retornar', label: '📞 Retornar', count: metrics.retornar },
                { key: 'perdeu', label: '✗ Não agendou', count: metrics.perdeu },
              ] as { key: LeadStatus | 'all'; label: string; count: number }[]
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                style={{
                  padding: '6px 13px',
                  borderRadius: 20,
                  border: `1.5px solid ${filterStatus === f.key ? TOKENS.primary : TOKENS.line}`,
                  background: filterStatus === f.key ? TOKENS.primary : '#fff',
                  color: filterStatus === f.key ? '#fff' : TOKENS.muted,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {f.label} {f.count > 0 && `(${f.count})`}
              </button>
            ))}
          </>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            background: TOKENS.line2,
            border: `1px solid ${TOKENS.line}`,
            borderRadius: 10,
            padding: 3,
          }}
        >
          <button
            onClick={() => setViewMode('list')}
            style={viewToggleStyle(viewMode === 'list')}
            title="Visualização em lista"
          >
            ≡ Lista
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            style={viewToggleStyle(viewMode === 'kanban')}
            title="Visualização Kanban"
          >
            ▦ Kanban
          </button>
        </div>
      </div>

      {/* Content */}
      {leads.length === 0 ? (
        <Empty
          icon="☎️"
          title="Nenhum atendimento registrado."
          subtitle='Clique em "Novo Atendimento" para começar.'
        />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          leads={filtered}
          onSaveLead={onSaveLead}
          onRemoveLead={onRemoveLead}
          onConvert={onConvert}
        />
      ) : filtered.length === 0 ? (
        <Empty
          icon="🔍"
          title="Nenhum lead encontrado."
          subtitle="Tente ajustar os filtros."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((l) => (
            <LeadCard
              key={l.id}
              lead={l}
              onStatusChange={handleStatusChange}
              onDelete={onRemoveLead}
              onConvert={onConvert}
              onSave={onSaveLead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
