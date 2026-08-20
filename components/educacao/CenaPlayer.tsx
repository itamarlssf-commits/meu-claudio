'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Cena } from '@/types/educacao';
import { camadasIniciais } from '@/lib/educacao/registry';
import { etapaAtual, indiceEtapaAtual, clamp } from '@/lib/educacao/interpolar';
import { resolverRenderer } from './renderers';
import { TOKENS } from '@/lib/tokens';
import { Btn, Card, Chip } from '@/components/ui';

/** Duração de uma passagem completa da cena, em milissegundos. */
const DURACAO_MS = 16000;

interface Props {
  cena: Cena;
  onVoltar: () => void;
}

export default function CenaPlayer({ cena, onVoltar }: Props) {
  const [progresso, setProgresso] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [camadasAtivas, setCamadasAtivas] = useState<Set<string>>(() => camadasIniciais(cena));
  const [apresentando, setApresentando] = useState(false);

  const palcoRef = useRef<HTMLDivElement>(null);
  const quadroRef = useRef<number | null>(null);

  const etapas = useMemo(() => cena.etapas ?? [], [cena]);
  const camadas = cena.camadas ?? [];
  const temLinhaDoTempo = cena.modo === 'timeline';

  const etapa = temLinhaDoTempo ? etapaAtual(etapas, progresso) : undefined;
  const indice = temLinhaDoTempo ? indiceEtapaAtual(etapas, progresso) : -1;

  /* Ao trocar de cena, recomeça do zero com as camadas padrão. */
  useEffect(() => {
    setProgresso(0);
    setTocando(false);
    setCamadasAtivas(camadasIniciais(cena));
  }, [cena]);

  /* Animação automática. Ao chegar no fim, para sozinha. */
  useEffect(() => {
    if (!tocando) return;

    let anterior = performance.now();

    const passo = (agora: number) => {
      const delta = agora - anterior;
      anterior = agora;

      setProgresso((p) => {
        const proximo = p + delta / DURACAO_MS;
        if (proximo >= 1) {
          setTocando(false);
          return 1;
        }
        return proximo;
      });

      quadroRef.current = requestAnimationFrame(passo);
    };

    quadroRef.current = requestAnimationFrame(passo);

    return () => {
      if (quadroRef.current !== null) cancelAnimationFrame(quadroRef.current);
    };
  }, [tocando]);

  /* Mantém o estado do botão em sincronia com a tecla Esc do navegador. */
  useEffect(() => {
    const aoMudar = () => setApresentando(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, []);

  const irParaEtapa = useCallback(
    (i: number) => {
      const alvo = etapas[clamp(i, 0, etapas.length - 1)];
      if (!alvo) return;
      setTocando(false);
      setProgresso(alvo.progresso);
    },
    [etapas]
  );

  function alternarCamada(id: string) {
    setCamadasAtivas((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  async function alternarApresentacao() {
    const palco = palcoRef.current;
    if (!palco) return;

    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await palco.requestFullscreen();
    } catch {
      /* Alguns navegadores bloqueiam tela cheia; o modo normal continua servindo. */
    }
  }

  const Renderer = resolverRenderer(cena.renderer);

  /* Camadas ativas com sintomas — a correlação clínica exibida ao lado. */
  const detalhes = camadas.filter((c) => camadasAtivas.has(c.id));

  return (
    <div style={{ padding: '28px 32px 40px' }}>
      {/* cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
        <div>
          <button
            onClick={onVoltar}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              marginBottom: 6,
              cursor: 'pointer',
              color: TOKENS.muted,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            ‹ Todas as explicações
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: TOKENS.primary, margin: 0, letterSpacing: '-0.02em' }}>
            {cena.titulo}
          </h2>
          <div style={{ fontSize: 12.5, color: TOKENS.muted, marginTop: 3 }}>{cena.subtitulo}</div>
        </div>
        <Btn variant="accent" icon="⛶" onClick={alternarApresentacao}>
          {apresentando ? 'Sair da apresentação' : 'Modo apresentação'}
        </Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 20, alignItems: 'start' }}>
        {/* ---------- palco ---------- */}
        <div
          ref={palcoRef}
          style={{
            background: '#fff',
            border: `1px solid ${TOKENS.line}`,
            borderRadius: 16,
            boxShadow: TOKENS.shadowSm,
            padding: apresentando ? '3vh 4vw' : 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 14,
            ...(apresentando ? { height: '100vh', borderRadius: 0, boxSizing: 'border-box' as const } : {}),
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              minHeight: 0,
              /* Fora da apresentação, o desenho não pode empurrar os controles para fora da tela. */
              ...(apresentando ? { flex: 1 } : { height: 'min(56vh, 460px)' }),
            }}
          >
            {Renderer ? (
              <Renderer cena={cena} progresso={progresso} camadasAtivas={camadasAtivas} />
            ) : (
              <div style={{ padding: 60, color: TOKENS.muted, fontSize: 13 }}>
                Este tipo de desenho ainda não está disponível.
              </div>
            )}
          </div>

          {/* controles da linha do tempo */}
          {temLinhaDoTempo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Btn variant="ghost" size="sm" onClick={() => irParaEtapa(indice - 1)} aria-label="Etapa anterior">
                ‹
              </Btn>
              <Btn variant="primary" size="sm" onClick={() => setTocando((t) => !t)} style={{ minWidth: 82 }}>
                {tocando ? '❚❚ Pausar' : '▶ Animar'}
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => irParaEtapa(indice + 1)} aria-label="Próxima etapa">
                ›
              </Btn>
              <input
                type="range"
                min={0}
                max={1000}
                value={Math.round(progresso * 1000)}
                onChange={(e) => {
                  setTocando(false);
                  setProgresso(Number(e.target.value) / 1000);
                }}
                aria-label="Progresso da explicação"
                style={{ flex: 1, accentColor: TOKENS.primary, cursor: 'pointer' }}
              />
            </div>
          )}

          {/* trilha de etapas */}
          {temLinhaDoTempo && etapas.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {etapas.map((e, i) => {
                const ativa = i === indice;
                return (
                  <button
                    key={e.id}
                    onClick={() => irParaEtapa(i)}
                    style={{
                      background: ativa ? TOKENS.primary : 'transparent',
                      color: ativa ? '#fff' : TOKENS.ink2,
                      border: `1.5px solid ${ativa ? TOKENS.primary : TOKENS.line}`,
                      borderRadius: 20,
                      padding: '4px 11px',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    {i + 1}. {e.titulo}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ---------- painel lateral ---------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {etapa && (
            <Card padding={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Chip color="gold" size="xs">{`Etapa ${indice + 1} de ${etapas.length}`}</Chip>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: TOKENS.primary, marginBottom: 6 }}>
                {etapa.titulo}
              </div>
              <p style={{ fontSize: 12.5, lineHeight: 1.6, color: TOKENS.ink2, margin: 0 }}>{etapa.narrativa}</p>
            </Card>
          )}

          {camadas.length > 0 && (
            <Card padding={16}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.ink2, marginBottom: 10 }}>
                Camadas
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {camadas.map((c) => {
                  const ativa = camadasAtivas.has(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => alternarCamada(c.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        background: ativa ? `${c.cor}14` : 'transparent',
                        border: `1.5px solid ${ativa ? c.cor : TOKENS.line}`,
                        borderRadius: 10,
                        padding: '7px 10px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                    >
                      <span
                        style={{
                          width: 11,
                          height: 11,
                          borderRadius: '50%',
                          background: ativa ? c.cor : 'transparent',
                          border: `2px solid ${c.cor}`,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600, color: ativa ? TOKENS.ink : TOKENS.muted }}>
                        {c.titulo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {detalhes.length > 0 && (
            <Card padding={16}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.ink2, marginBottom: 10 }}>
                Sintomas relacionados
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {detalhes.map((c) => (
                  <div key={c.id}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: c.cor, marginBottom: 4 }}>{c.titulo}</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {c.sintomas.map((s) => (
                        <li key={s} style={{ fontSize: 11.5, lineHeight: 1.55, color: TOKENS.ink2, marginBottom: 2 }}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
