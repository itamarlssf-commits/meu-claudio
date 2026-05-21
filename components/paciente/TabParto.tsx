'use client';

import type { Paciente, NomeSocio, AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { fmtDate, fmtMoney } from '@/lib/business-logic';
import { inputBase } from '@/lib/input-styles';

const SOCIOS: NomeSocio[] = ['', 'Lucas', 'Marcos'];

interface Props {
  paciente: Paciente;
  data: AppData;
  setData: (d: AppData) => void;
}

export default function TabParto({ paciente, data, setData }: Props) {
  function updPaciente(patch: Partial<Paciente>) {
    setData({
      ...data,
      pacientes: data.pacientes.map((p) => (p.id === paciente.id ? { ...p, ...patch } : p)),
    });
  }

  const bruto   = paciente.socioValor     ?? 0;
  const imposto = paciente.socioImpostos  ?? 0;
  const liquido = Math.max(0, bruto - imposto);
  const pctAtual = bruto > 0 ? ((imposto / bruto) * 100).toFixed(1) : '0';

  function handlePct(val: string) {
    const pct = parseFloat(val) || 0;
    updPaciente({ socioImpostos: Math.round(bruto * pct / 100) });
  }

  function handleImpostoRS(val: string) {
    updPaciente({ socioImpostos: parseFloat(val) || 0 });
  }

  const labelStyle = { fontSize: 11, color: TOKENS.ink2, fontWeight: 600 as const, display: 'block' as const, marginBottom: 4 };

  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Parto */}
      <section>
        <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink2, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${TOKENS.line2}` }}>
          Informações do Parto
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Via do Parto</label>
            <select style={inputBase} value={paciente.via} onChange={(e) => updPaciente({ via: e.target.value as Paciente['via'] })}>
              {['Normal', 'Cesária', 'A definir'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>DPP</label>
            <input style={inputBase} type="date" value={paciente.dpp || ''} onChange={(e) => updPaciente({ dpp: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, marginTop: 4 }}>
              <input type="checkbox" checked={paciente.partoRealizado} onChange={(e) => updPaciente({ partoRealizado: e.target.checked })} />
              Parto realizado
            </label>
          </div>
          {paciente.partoRealizado && (
            <div>
              <label style={labelStyle}>Data Real do Parto</label>
              <input style={inputBase} type="date" value={paciente.dataPartoReal || ''} onChange={(e) => updPaciente({ dataPartoReal: e.target.value })} />
            </div>
          )}
        </div>
      </section>

      {/* Sócio */}
      <section>
        <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink2, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${TOKENS.line2}` }}>
          Sócio / Auxiliar
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Sócio selector */}
          <div>
            <label style={labelStyle}>Sócio</label>
            <select style={inputBase} value={paciente.socio || ''} onChange={(e) => updPaciente({ socio: e.target.value as NomeSocio })}>
              {SOCIOS.map((s) => <option key={s} value={s}>{s || '— Nenhum —'}</option>)}
            </select>
          </div>

          {/* Valor bruto */}
          <div>
            <label style={labelStyle}>Valor Bruto do Repasse (R$)</label>
            <input
              style={inputBase}
              type="number"
              placeholder="0"
              value={bruto || ''}
              onChange={(e) => {
                const novo = parseFloat(e.target.value) || 0;
                // recompute imposto mantendo o % atual
                const pct = bruto > 0 ? imposto / bruto : 0;
                updPaciente({ socioValor: novo, socioImpostos: Math.round(novo * pct) });
              }}
            />
          </div>

          {/* Desconto % */}
          <div>
            <label style={labelStyle}>Desconto / Impostos (%)</label>
            <input
              style={inputBase}
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="0"
              value={pctAtual === '0' ? '' : pctAtual}
              onChange={(e) => handlePct(e.target.value)}
            />
          </div>

          {/* Desconto R$ calculado */}
          <div>
            <label style={labelStyle}>Desconto / Impostos (R$)</label>
            <input
              style={inputBase}
              type="number"
              placeholder="0"
              value={imposto || ''}
              onChange={(e) => handleImpostoRS(e.target.value)}
            />
          </div>

          {/* Repasse pago */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, marginTop: 4 }}>
              <input type="checkbox" checked={paciente.socioPago || false} onChange={(e) => updPaciente({ socioPago: e.target.checked })} />
              Repasse pago
            </label>
          </div>

          {paciente.socioPago && (
            <div>
              <label style={labelStyle}>Data do Pagamento ao Sócio</label>
              <input style={inputBase} type="date" value={paciente.socioDataPgt || ''} onChange={(e) => updPaciente({ socioDataPgt: e.target.value })} />
            </div>
          )}
        </div>

        {/* Valor líquido destaque */}
        {paciente.socio && (
          <div
            style={{
              marginTop: 16,
              padding: '14px 16px',
              background: paciente.socioPago ? '#f0fdf4' : '#fffbeb',
              borderRadius: 12,
              border: `1px solid ${paciente.socioPago ? '#d1fae5' : '#fef3c7'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: TOKENS.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                {paciente.socio} · Resumo do Repasse
              </div>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: TOKENS.muted }}>
                  Bruto: <strong style={{ fontFamily: 'ui-monospace, monospace', color: TOKENS.ink }}>{fmtMoney(bruto)}</strong>
                </span>
                <span style={{ fontSize: 12, color: TOKENS.muted }}>
                  Desconto: <strong style={{ fontFamily: 'ui-monospace, monospace', color: TOKENS.red }}>−{fmtMoney(imposto)}</strong>
                  {bruto > 0 && <span style={{ fontSize: 10, marginLeft: 3 }}>({pctAtual}%)</span>}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: TOKENS.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Valor Líquido
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'ui-monospace, monospace', color: paciente.socioPago ? TOKENS.green : TOKENS.amber }}>
                {fmtMoney(liquido)}
              </div>
              <div style={{ fontSize: 12, marginTop: 2, color: paciente.socioPago ? TOKENS.green : TOKENS.amber }}>
                {paciente.socioPago ? `✓ Pago em ${fmtDate(paciente.socioDataPgt)}` : 'Aguardando pagamento'}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
