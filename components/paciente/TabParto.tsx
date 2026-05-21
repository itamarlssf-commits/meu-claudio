'use client';

import type { Paciente, NomeSocio, AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { fmtDate, fmtMoney } from '@/lib/business-logic';
import { inputBase } from '@/lib/input-styles';
import { Btn } from '@/components/ui';

const SOCIOS: NomeSocio[] = ['', 'Lucas', 'Marcos'];

interface Props {
  paciente: Paciente;
  data: AppData;
  setData: (d: AppData) => void;
}

export default function TabParto({ paciente, data, setData }: Props) {
  function updPaciente(patch: Partial<Paciente>) {
    const next: AppData = {
      ...data,
      pacientes: data.pacientes.map((p) => (p.id === paciente.id ? { ...p, ...patch } : p)),
    };
    setData(next);
  }

  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Parto info */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink2, marginBottom: 12 }}>
          Informações do Parto
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Via do Parto
            </label>
            <select
              style={inputBase}
              value={paciente.via}
              onChange={(e) => updPaciente({ via: e.target.value as Paciente['via'] })}
            >
              {['Normal', 'Cesária', 'A definir'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              DPP
            </label>
            <input
              style={inputBase}
              type="date"
              value={paciente.dpp || ''}
              onChange={(e) => updPaciente({ dpp: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={paciente.partoRealizado}
                onChange={(e) => updPaciente({ partoRealizado: e.target.checked })}
              />
              Parto realizado
            </label>
          </div>
          {paciente.partoRealizado && (
            <div>
              <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Data Real do Parto
              </label>
              <input
                style={inputBase}
                type="date"
                value={paciente.dataPartoReal || ''}
                onChange={(e) => updPaciente({ dataPartoReal: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sócio */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink2, marginBottom: 12 }}>
          Sócio / Auxiliar
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Sócio
            </label>
            <select
              style={inputBase}
              value={paciente.socio || ''}
              onChange={(e) => updPaciente({ socio: e.target.value as NomeSocio })}
            >
              {SOCIOS.map((s) => <option key={s} value={s}>{s || '— Nenhum —'}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Valor do Repasse (R$)
            </label>
            <input
              style={inputBase}
              type="number"
              value={paciente.socioValor ?? ''}
              onChange={(e) => updPaciente({ socioValor: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Impostos (R$)
            </label>
            <input
              style={inputBase}
              type="number"
              value={paciente.socioImpostos ?? ''}
              onChange={(e) => updPaciente({ socioImpostos: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={paciente.socioPago || false}
                onChange={(e) => updPaciente({ socioPago: e.target.checked })}
              />
              Repasse pago
            </label>
          </div>
          {paciente.socioPago && (
            <div>
              <label style={{ fontSize: 11, color: TOKENS.ink2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Data do Pagamento ao Sócio
              </label>
              <input
                style={inputBase}
                type="date"
                value={paciente.socioDataPgt || ''}
                onChange={(e) => updPaciente({ socioDataPgt: e.target.value })}
              />
            </div>
          )}
        </div>

        {paciente.socio && (
          <div
            style={{
              marginTop: 14,
              padding: '12px 14px',
              background: paciente.socioPago ? '#f0fdf4' : '#fffbeb',
              borderRadius: 10,
              border: `1px solid ${paciente.socioPago ? '#d1fae5' : '#fef3c7'}`,
            }}
          >
            <div style={{ fontSize: 13, color: TOKENS.ink2 }}>
              <strong>{paciente.socio}</strong> ·{' '}
              <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
                {fmtMoney(paciente.socioValor)}
              </span>
              {paciente.socioImpostos ? (
                <span style={{ color: TOKENS.muted }}>
                  {' '}(impostos: {fmtMoney(paciente.socioImpostos)})
                </span>
              ) : null}
            </div>
            <div style={{ fontSize: 12, marginTop: 4, color: paciente.socioPago ? TOKENS.green : TOKENS.amber }}>
              {paciente.socioPago
                ? `✓ Pago em ${fmtDate(paciente.socioDataPgt)}`
                : 'Pendente'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
