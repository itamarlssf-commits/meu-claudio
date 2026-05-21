'use client';

import { useState, useMemo } from 'react';
import type { AppData } from '@/types/paciente';
import { TOKENS, rowTint } from '@/lib/tokens';
import {
  fmtDate,
  fmtMoney,
  totalPago,
  saldo,
  pctPago,
  idadeGestacional,
  alertasCobrancaDPP,
  whatsAppCobranca,
} from '@/lib/business-logic';
import { Chip, Btn, SectionHeader, Progress, Empty } from '@/components/ui';
import NovaPaciente from './NovaPaciente';

interface Props {
  data: AppData;
  setData: (d: AppData) => void;
  onOpenPaciente: (id: string) => void;
}

type StatusFilter = 'all' | 'pago' | 'parcial' | 'pendente';

export default function PacientesView({ data, setData, onOpenPaciente }: Props) {
  const [bucket, setBucket] = useState<'ativas' | 'arquivadas'>('ativas');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [novaPaciente, setNovaPaciente] = useState(false);

  const countAtivas = useMemo(() => data.pacientes.filter((p) => !p.partoRealizado).length, [data.pacientes]);
  const countArquivadas = useMemo(() => data.pacientes.filter((p) => p.partoRealizado).length, [data.pacientes]);

  const sorted = useMemo(() => {
    const pool = data.pacientes.filter((p) =>
      bucket === 'ativas' ? !p.partoRealizado : p.partoRealizado,
    );
    return pool
      .filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (search && !p.nome.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => (a.dpp || '').localeCompare(b.dpp || ''));
  }, [data.pacientes, bucket, statusFilter, search]);

  const STATUS_COLORS: Record<string, 'green' | 'amber' | 'red'> = {
    pago: 'green',
    parcial: 'amber',
    pendente: 'red',
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader
        title="Pacientes"
        subtitle={`${data.pacientes.length} pacientes cadastradas`}
        action={
          <Btn variant="primary" size="sm" onClick={() => setNovaPaciente(true)}>
            + Nova Paciente
          </Btn>
        }
      />

      {/* Bucket tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${TOKENS.line}`, paddingBottom: 0 }}>
        {(['ativas', 'arquivadas'] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBucket(b)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: bucket === b ? 700 : 500,
              color: bucket === b ? TOKENS.primary : TOKENS.muted,
              borderBottom: bucket === b ? `2px solid ${TOKENS.primary}` : '2px solid transparent',
              fontFamily: 'inherit',
              marginBottom: -1,
            }}
          >
            {b === 'ativas' ? `Ativas (${countAtivas})` : `Arquivadas / Pós-Parto (${countArquivadas})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{
            padding: '7px 12px',
            border: `1.5px solid ${TOKENS.line}`,
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none',
            width: 220,
          }}
          placeholder="Buscar paciente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {(['all', 'pago', 'parcial', 'pendente'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: `1.5px solid ${statusFilter === s ? TOKENS.primary : TOKENS.line}`,
              background: statusFilter === s ? TOKENS.primary : 'transparent',
              color: statusFilter === s ? '#fff' : TOKENS.ink2,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {s === 'all' ? 'Todas' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <Empty title="Nenhuma paciente encontrada" subtitle="Ajuste os filtros ou cadastre uma nova paciente." icon="👤" />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TOKENS.line}` }}>
                {['Paciente', 'DPP', 'IG', 'Pacote', 'Contrato', 'Pago', 'Saldo', 'Status', 'Alertas', ''].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: TOKENS.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const ig = idadeGestacional(p.dum);
                const alertas = alertasCobrancaDPP(p);
                const pago = totalPago(p);
                const sld = saldo(p);
                const pct = pctPago(p);
                const tint = rowTint(p.status);

                return (
                  <tr
                    key={p.id}
                    onClick={() => onOpenPaciente(p.id)}
                    style={{
                      background: tint,
                      borderBottom: `1px solid ${TOKENS.line2}`,
                      cursor: 'pointer',
                    }}
                  >
                    <td style={{ padding: '10px 10px', fontWeight: 600, color: TOKENS.ink }}>
                      {p.nome}
                      {p.observacoes.length > 0 && (
                        <span style={{ marginLeft: 5, fontSize: 11 }} title={p.observacoes[p.observacoes.length - 1].texto}>
                          📝
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 10px', color: TOKENS.ink2, whiteSpace: 'nowrap' }}>
                      {fmtDate(p.dpp)}
                    </td>
                    <td style={{ padding: '10px 10px', color: TOKENS.blue, whiteSpace: 'nowrap', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                      {ig ? `${ig.semanas}s ${ig.dias}d` : '—'}
                    </td>
                    <td style={{ padding: '10px 10px', color: TOKENS.ink2, fontSize: 12 }}>{p.pacote}</td>
                    <td
                      style={{
                        padding: '10px 10px',
                        fontFamily: 'ui-monospace, monospace',
                        fontWeight: 600,
                        color: TOKENS.ink,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fmtMoney(p.contrato)}
                    </td>
                    <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: TOKENS.green }}>
                        {fmtMoney(pago)}
                      </div>
                      <Progress value={pct} color={pct >= 100 ? TOKENS.green : TOKENS.amber} />
                    </td>
                    <td
                      style={{
                        padding: '10px 10px',
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 12,
                        color: sld > 0 ? TOKENS.amber : TOKENS.green,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fmtMoney(sld)}
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <Chip color={STATUS_COLORS[p.status] || 'gray'} size="xs">
                        {p.status}
                      </Chip>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      {alertas.length > 0 && (
                        <Chip color="red" size="xs">⚡ {alertas[0].label}</Chip>
                      )}
                    </td>
                    <td style={{ padding: '10px 6px' }}>
                      <a
                        href={whatsAppCobranca(p)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: '#25d366',
                          color: '#fff',
                          textDecoration: 'none',
                        }}
                      >
                        WA
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <NovaPaciente
        open={novaPaciente}
        onClose={() => setNovaPaciente(false)}
        data={data}
        setData={setData}
      />
    </div>
  );
}
