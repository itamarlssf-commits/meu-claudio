'use client';

import type { Paciente, AppData } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { proximasConsultas, idadeGestacional, fmtDate, gcalLink, todayISO } from '@/lib/business-logic';
import { Chip } from '@/components/ui';

interface Props {
  paciente: Paciente;
  data: AppData;
  setData: (d: AppData) => void;
}

export default function TabConsultas({ paciente, data, setData }: Props) {
  const sugeridas = proximasConsultas(paciente.dum);
  const ig = idadeGestacional(paciente.dum);
  const hoje = todayISO();

  function toggleConsulta(semana: number) {
    const existing = paciente.consultas.find((c) => c.semana === semana);
    const sugerida = sugeridas.find((s) => s.semana === semana);
    let next: typeof paciente.consultas;

    if (existing) {
      next = paciente.consultas.map((c) =>
        c.semana === semana ? { ...c, realizada: !c.realizada } : c
      );
    } else {
      next = [
        ...paciente.consultas,
        { semana, data: sugerida?.data || hoje, realizada: true },
      ];
    }

    const nextData: AppData = {
      ...data,
      pacientes: data.pacientes.map((p) =>
        p.id === paciente.id ? { ...p, consultas: next } : p
      ),
    };
    setData(nextData);
  }

  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {ig && (
        <div
          style={{
            background: TOKENS.blueSoft,
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: TOKENS.blue, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Idade Gestacional Hoje
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TOKENS.primary, fontFamily: 'ui-monospace, monospace' }}>
              {ig.semanas}s {ig.dias}d
            </div>
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink2, marginBottom: 10 }}>
          Calendário Obstétrico
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sugeridas.map((s) => {
            const registrada = paciente.consultas.find((c) => c.semana === s.semana);
            const realizada = registrada?.realizada || false;
            const passada = s.data < hoje;
            const gcal = gcalLink(
              `Consulta ${paciente.nome} — ${s.semana}s`,
              s.data,
              '09:00',
              `Consulta obstétrica — ${s.semana} semanas${s.especial ? ` (${s.especial})` : ''}`
            );

            return (
              <div
                key={s.semana}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: realizada ? '#f0fdf4' : passada ? '#fff1f2' : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => toggleConsulta(s.semana)}
              >
                <input
                  type="checkbox"
                  checked={realizada}
                  readOnly
                  style={{ cursor: 'pointer', width: 15, height: 15, flexShrink: 0 }}
                />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: realizada ? TOKENS.green : TOKENS.ink2,
                      fontFamily: 'ui-monospace, monospace',
                      minWidth: 32,
                    }}
                  >
                    {s.semana}s
                  </span>
                  <span style={{ fontSize: 12, color: TOKENS.muted }}>{fmtDate(s.data)}</span>
                  {s.especial && <Chip color="purple" size="xs">{s.especial}</Chip>}
                  {passada && !realizada && <Chip color="red" size="xs">Atrasada</Chip>}
                </div>
                <a
                  href={gcal}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: 11,
                    color: TOKENS.blue,
                    textDecoration: 'none',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: TOKENS.blueSoft,
                    flexShrink: 0,
                  }}
                >
                  📅 Cal
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
