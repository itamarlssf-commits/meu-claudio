'use client';

import { useState } from 'react';
import { TOKENS } from '@/lib/tokens';
import { fmtMoney, fmtDate } from '@/lib/business-logic';
import { uploadComprovante } from '@/lib/firebase';
import useReforma from '@/hooks/useReforma';
import GastoModal from '@/components/reforma/GastoModal';
import ContribuicaoModal from '@/components/reforma/ContribuicaoModal';
import GastoCard from '@/components/reforma/GastoCard';
import SocioSaldo from '@/components/reforma/SocioSaldo';
import KPI from '@/components/ui/KPI';
import type { Gasto, Contribuicao } from '@/types/reforma';
import {
  totalPrevisto,
  totalPago,
  totalAPagar,
  pctConcluido,
  parcelasProximas,
  parcelasVencidas,
  saldosPorSocio,
} from '@/lib/reforma-logic';

type Aba = 'resumo' | 'gastos' | 'socios';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function hoje() {
  return new Date().toISOString().split('T')[0];
}

export default function ReformaView() {
  const { reforma, setReforma } = useReforma();
  const [aba, setAba] = useState<Aba>('resumo');
  const [modalGasto, setModalGasto] = useState(false);
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null);
  const [modalContrib, setModalContrib] = useState(false);

  const previsto = totalPrevisto(reforma.gastos);
  const pago = totalPago(reforma.gastos);
  const aPagar = totalAPagar(reforma.gastos);
  const pct = pctConcluido(reforma.gastos);
  const proximas = parcelasProximas(reforma.gastos, 30);
  const vencidas = parcelasVencidas(reforma.gastos);
  const saldos = saldosPorSocio(reforma);

  function salvarGasto(gasto: Gasto) {
    const existe = reforma.gastos.find((g) => g.id === gasto.id);
    const gastos = existe
      ? reforma.gastos.map((g) => (g.id === gasto.id ? gasto : g))
      : [...reforma.gastos, gasto];
    setReforma({ ...reforma, gastos });
  }

  function removerGasto(id: string) {
    setReforma({ ...reforma, gastos: reforma.gastos.filter((g) => g.id !== id) });
  }

  async function toggleParcela(gastoId: string, parcelaId: string, pago: boolean, comprovanteFile?: File | null) {
    let comprovanteUrl: string | undefined;
    if (pago && comprovanteFile) {
      try {
        comprovanteUrl = await uploadComprovante(gastoId, parcelaId, comprovanteFile);
      } catch {
        // upload falhou, segue sem comprovante
      }
    }
    const gastos = reforma.gastos.map((g) =>
      g.id !== gastoId
        ? g
        : {
            ...g,
            parcelas: g.parcelas.map((p) =>
              p.id !== parcelaId
                ? p
                : {
                    ...p,
                    pago,
                    dataPagamento: pago ? hoje() : undefined,
                    comprovanteUrl: pago ? (comprovanteUrl ?? p.comprovanteUrl) : undefined,
                  },
            ),
          },
    );
    setReforma({ ...reforma, gastos });
  }

  function salvarContribuicao(contrib: Contribuicao) {
    setReforma({ ...reforma, contribuicoes: [...reforma.contribuicoes, contrib] });
  }

  function removerContribuicao(id: string) {
    setReforma({ ...reforma, contribuicoes: reforma.contribuicoes.filter((c) => c.id !== id) });
  }

  const ABA_STYLE = (ativo: boolean) => ({
    padding: '9px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: ativo ? 700 : 400,
    background: ativo ? TOKENS.primary : 'transparent',
    color: ativo ? '#fff' : TOKENS.ink2,
    transition: 'all 0.15s',
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1
              style={{
                fontSize: 24, fontWeight: 700, color: TOKENS.primary, margin: 0,
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              🏗 Reforma Ellas
            </h1>
            <p style={{ fontSize: 13, color: TOKENS.muted, marginTop: 4, marginBottom: 0 }}>
              Controle de gastos e contribuições — 10 sócios
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setGastoEditando(null); setModalGasto(true); }}
              style={{
                padding: '9px 18px', borderRadius: 9, border: 'none',
                background: TOKENS.primary, color: '#fff', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
              }}
            >
              + Novo Gasto
            </button>
            <button
              onClick={() => setModalContrib(true)}
              style={{
                padding: '9px 18px', borderRadius: 9,
                border: `1px solid ${TOKENS.green}`, background: TOKENS.greenSoft,
                color: TOKENS.green, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
              }}
            >
              + Contribuição
            </button>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: TOKENS.line2, padding: 4, borderRadius: 10, width: 'fit-content' }}>
        <button style={ABA_STYLE(aba === 'resumo')} onClick={() => setAba('resumo')}>Resumo</button>
        <button style={ABA_STYLE(aba === 'gastos')} onClick={() => setAba('gastos')}>
          Gastos {reforma.gastos.length > 0 && `(${reforma.gastos.length})`}
        </button>
        <button style={ABA_STYLE(aba === 'socios')} onClick={() => setAba('socios')}>Sócios</button>
      </div>

      {/* ===== ABA RESUMO ===== */}
      {aba === 'resumo' && (
        <div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
            <KPI label="Total Previsto" value={fmtMoney(previsto)} icon="📋" accent={TOKENS.primary} />
            <KPI label="Total Pago" value={fmtMoney(pago)} icon="✓" accent={TOKENS.green} sub={`${pct}% da reforma`} />
            <KPI label="A Pagar" value={fmtMoney(aPagar)} icon="⏳" accent={TOKENS.amber} />
            <KPI label="Cota por Sócio" value={fmtMoney(previsto / 10)} icon="👥" accent={TOKENS.blue} sub="10% cada" />
          </div>

          {/* Barra de progresso geral */}
          {previsto > 0 && (
            <div
              style={{
                background: '#fff', borderRadius: 14, border: `1px solid ${TOKENS.line}`,
                padding: '18px 22px', marginBottom: 24, boxShadow: TOKENS.shadowSm,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>Progresso da reforma</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? TOKENS.green : TOKENS.primary }}>{pct}%</span>
              </div>
              <div style={{ height: 12, background: TOKENS.line2, borderRadius: 6, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%', width: `${pct}%`, borderRadius: 6, transition: 'width 0.6s',
                    background: pct === 100
                      ? TOKENS.green
                      : `linear-gradient(90deg, ${TOKENS.primary} 0%, ${TOKENS.blue} 100%)`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Parcelas vencidas */}
          {vencidas.length > 0 && (
            <div
              style={{
                background: TOKENS.redSoft, borderRadius: 14, border: `1px solid ${TOKENS.red}30`,
                padding: '16px 20px', marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.red, marginBottom: 10 }}>
                ⚠ {vencidas.length} parcela{vencidas.length > 1 ? 's' : ''} vencida{vencidas.length > 1 ? 's' : ''}
              </div>
              {vencidas.map(({ gasto, parcela }) => (
                <div key={parcela.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: TOKENS.red, marginBottom: 4 }}>
                  <span>{gasto.descricao} — {parcela.numero === 0 ? 'Entrada' : `${parcela.numero}ª parcela`}</span>
                  <span style={{ fontWeight: 700 }}>{fmtMoney(parcela.valor)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Próximas parcelas (30 dias) */}
          {proximas.filter((x) => !x.parcela.vencimento || new Date(x.parcela.vencimento + 'T00:00:00') >= new Date(new Date().setHours(0,0,0,0))).length > 0 && (
            <div
              style={{
                background: '#fff', borderRadius: 14, border: `1px solid ${TOKENS.line}`,
                padding: '18px 22px', boxShadow: TOKENS.shadowSm,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink, marginBottom: 14 }}>
                📅 Próximas parcelas (30 dias)
              </div>
              {proximas
                .filter((x) => new Date(x.parcela.vencimento + 'T00:00:00') >= new Date(new Date().setHours(0,0,0,0)))
                .map(({ gasto, parcela }) => (
                <div
                  key={parcela.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 9, marginBottom: 6,
                    background: TOKENS.amberSoft, border: `1px solid ${TOKENS.amber}30`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>{gasto.descricao}</div>
                    <div style={{ fontSize: 11, color: TOKENS.muted }}>
                      {gasto.fornecedor} · {parcela.numero === 0 ? 'Entrada' : `${parcela.numero}ª parcela`} · vence {fmtDate(parcela.vencimento)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: TOKENS.amber }}>{fmtMoney(parcela.valor)}</div>
                </div>
              ))}
            </div>
          )}

          {reforma.gastos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: TOKENS.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏗</div>
              <p style={{ fontSize: 15, marginBottom: 4 }}>Nenhum gasto cadastrado ainda.</p>
              <p style={{ fontSize: 13 }}>Clique em "Novo Gasto" para começar.</p>
            </div>
          )}
        </div>
      )}

      {/* ===== ABA GASTOS ===== */}
      {aba === 'gastos' && (
        <div>
          {reforma.gastos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: TOKENS.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <p style={{ fontSize: 15, marginBottom: 4 }}>Sem gastos cadastrados.</p>
              <button
                onClick={() => { setGastoEditando(null); setModalGasto(true); }}
                style={{
                  marginTop: 12, padding: '10px 24px', borderRadius: 9, border: 'none',
                  background: TOKENS.primary, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                }}
              >
                + Adicionar primeiro gasto
              </button>
            </div>
          ) : (
            reforma.gastos.map((g) => (
              <GastoCard
                key={g.id}
                gasto={g}
                onEdit={() => { setGastoEditando(g); setModalGasto(true); }}
                onDelete={() => removerGasto(g.id)}
                onToggleParcela={(parcelaId, pago, file) => toggleParcela(g.id, parcelaId, pago, file)}
              />
            ))
          )}
        </div>
      )}

      {/* ===== ABA SÓCIOS ===== */}
      {aba === 'socios' && (
        <div>
          {/* Grid de saldos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
            {saldos.map((s) => (
              <SocioSaldo key={s.socio} saldo={s} />
            ))}
          </div>

          {/* Histórico de contribuições */}
          {reforma.contribuicoes.length > 0 && (
            <div
              style={{
                background: '#fff', borderRadius: 14, border: `1px solid ${TOKENS.line}`,
                padding: '18px 22px', boxShadow: TOKENS.shadowSm,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink, marginBottom: 14 }}>
                Histórico de contribuições
              </div>
              {[...reforma.contribuicoes]
                .sort((a, b) => b.data.localeCompare(a.data))
                .map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 0', borderBottom: `1px solid ${TOKENS.line2}`,
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: TOKENS.ink }}>{c.socio}</span>
                    <span style={{ fontSize: 12, color: TOKENS.muted, marginLeft: 8 }}>{c.descricao}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TOKENS.green }}>{fmtMoney(c.valor)}</span>
                    <span style={{ fontSize: 11, color: TOKENS.muted }}>{fmtDate(c.data)}</span>
                    <button
                      onClick={() => {
                        if (confirm(`Remover contribuição de ${c.socio}?`)) removerContribuicao(c.id);
                      }}
                      style={{
                        fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.muted, padding: '0 4px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reforma.contribuicoes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: TOKENS.muted }}>
              <p style={{ fontSize: 13 }}>Nenhuma contribuição registrada ainda.</p>
            </div>
          )}
        </div>
      )}

      {/* Modais */}
      <GastoModal
        open={modalGasto}
        onClose={() => { setModalGasto(false); setGastoEditando(null); }}
        onSave={salvarGasto}
        inicial={gastoEditando}
      />
      <ContribuicaoModal
        open={modalContrib}
        onClose={() => setModalContrib(false)}
        onSave={salvarContribuicao}
      />
    </div>
  );
}
