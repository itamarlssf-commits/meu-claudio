'use client';

import { TOKENS } from '@/lib/tokens';
import { fmtMoney } from '@/lib/business-logic';
import type { SaldoSocio } from '@/lib/reforma-logic';

interface Props {
  saldo: SaldoSocio;
}

const INICIAIS: Record<string, string> = {
  Adriana: 'AD', Amanda: 'AM', Carla: 'CA', Eveline: 'EV',
  Itamar: 'IT', Lucas: 'LC', Marcos: 'MR', Mariana: 'MA',
  Neto: 'NT', Vanessa: 'VN',
};

export default function SocioSaldo({ saldo }: Props) {
  const positivo = saldo.saldo >= 0;
  const cor = positivo ? TOKENS.green : TOKENS.red;
  const bgCor = positivo ? TOKENS.greenSoft : TOKENS.redSoft;

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${TOKENS.line}`,
        borderRadius: 14,
        padding: '16px 18px',
        boxShadow: TOKENS.shadowSm,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Avatar + Nome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: `${TOKENS.primary}18`,
            border: `2px solid ${TOKENS.primary}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: TOKENS.primary, flexShrink: 0,
          }}
        >
          {INICIAIS[saldo.socio] ?? saldo.socio.slice(0, 2).toUpperCase()}
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: TOKENS.ink }}>{saldo.socio}</span>
      </div>

      {/* Quota */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: TOKENS.muted }}>Cota (10%)</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink2 }}>{fmtMoney(saldo.quota)}</span>
      </div>

      {/* Contribuiu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: TOKENS.muted }}>Já contribuiu</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink2 }}>{fmtMoney(saldo.contribuiu)}</span>
      </div>

      {/* Saldo */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 12px', borderRadius: 9, background: bgCor,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: cor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {positivo ? 'Crédito' : 'Deve'}
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: cor }}>
          {fmtMoney(Math.abs(saldo.saldo))}
        </span>
      </div>
    </div>
  );
}
