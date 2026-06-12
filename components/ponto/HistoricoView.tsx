'use client';

import { useMemo, useState } from 'react';
import {
  agruparPorDia,
  parearRegistros,
  formatDuracao,
  formatDataBR,
} from '@/lib/ponto-logic';
import { TOKENS } from '@/lib/tokens';
import { Card, Chip } from '@/components/ui';
import type { RegistroPonto } from '@/types/ponto';

interface HistoricoViewProps {
  registros: RegistroPonto[];
  titulo?: string;
}

export default function HistoricoView({ registros, titulo = 'Meu histórico' }: HistoricoViewProps) {
  const agora = new Date();
  const [mesRef, setMesRef] = useState(
    `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`,
  );

  const doMes = useMemo(
    () => registros.filter((r) => r.data.startsWith(mesRef)),
    [registros, mesRef],
  );

  const dias = useMemo(() => {
    const mapa = agruparPorDia(doMes);
    const linhas = Array.from(mapa.entries()).map(([data, regs]) => {
      const { pares, totalMs } = parearRegistros(regs);
      return { data, regs: regs.sort((a, b) => a.timestamp - b.timestamp), pares, totalMs };
    });
    return linhas.sort((a, b) => b.data.localeCompare(a.data));
  }, [doMes]);

  const totalMes = dias.reduce((acc, d) => acc + d.totalMs, 0);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '8px 16px 40px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: TOKENS.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {titulo}
        </div>
        <input
          type="month"
          value={mesRef}
          onChange={(e) => setMesRef(e.target.value)}
          style={{
            border: `1.5px solid ${TOKENS.line}`,
            borderRadius: 8,
            padding: '4px 8px',
            fontSize: 12,
            fontFamily: 'inherit',
            color: TOKENS.ink,
          }}
        />
      </div>

      <Card style={{ textAlign: 'center', marginBottom: 16 }} padding={14}>
        <div style={{ fontSize: 12, color: TOKENS.muted }}>Total no mês</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: TOKENS.primary }}>
          {formatDuracao(totalMes)}
        </div>
        <div style={{ fontSize: 11, color: TOKENS.muted, marginTop: 2 }}>
          {dias.filter((d) => d.totalMs > 0).length} dia(s) trabalhado(s)
        </div>
      </Card>

      {dias.length === 0 ? (
        <Card style={{ textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>
          Nenhum registro neste mês.
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dias.map((d) => (
            <Card key={d.data} padding={14}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <strong style={{ fontSize: 13, color: TOKENS.ink }}>
                  {formatDataBR(d.data)}
                </strong>
                <Chip color={d.totalMs > 0 ? 'blue' : 'gray'} size="xs">
                  {formatDuracao(d.totalMs)}
                </Chip>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {d.regs.map((r) => (
                  <span
                    key={r.id}
                    style={{
                      fontSize: 12,
                      color: r.tipo === 'entrada' ? '#059669' : '#dc2626',
                      background: r.tipo === 'entrada' ? TOKENS.greenSoft : TOKENS.redSoft,
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontWeight: 600,
                    }}
                  >
                    {r.tipo === 'entrada' ? '↪' : '↩'} {r.hora}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
