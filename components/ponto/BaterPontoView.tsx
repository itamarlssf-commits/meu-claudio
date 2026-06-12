'use client';

import { useMemo, useRef, useState } from 'react';
import { signOutUser } from '@/lib/firebase';
import { usePontoStore } from '@/store/use-ponto-store';
import useBaterPonto from '@/hooks/useBaterPonto';
import {
  dataLocal,
  horaLocal,
  formatDuracao,
  parearRegistros,
  statusAtual,
} from '@/lib/ponto-logic';
import { TOKENS } from '@/lib/tokens';
import { Card, Btn, Chip } from '@/components/ui';
import type { TipoRegistro } from '@/types/ponto';

export default function BaterPontoView() {
  const usuario = usePontoStore((s) => s.usuario);
  const registros = usePontoStore((s) => s.registros);
  const syncStatus = usePontoStore((s) => s.syncStatus);
  const { baterPonto, salvando } = useBaterPonto();

  const inputRef = useRef<HTMLInputElement>(null);
  const tipoPendente = useRef<TipoRegistro>('entrada');
  const [mensagem, setMensagem] = useState<string>('');

  const hoje = dataLocal();
  const registrosHoje = useMemo(
    () => registros.filter((r) => r.data === hoje),
    [registros, hoje],
  );
  const { trabalhando } = statusAtual(registrosHoje);
  const { totalMs } = useMemo(() => parearRegistros(registrosHoje), [registrosHoje]);

  const proximoTipo: TipoRegistro = trabalhando ? 'saida' : 'entrada';

  function abrirCamera(tipo: TipoRegistro) {
    tipoPendente.current = tipo;
    inputRef.current?.click();
  }

  async function registrar(tipo: TipoRegistro, selfie: File | null) {
    if (!usuario?.funcionariaId) return;
    setMensagem('');
    try {
      await baterPonto({
        funcionariaId: usuario.funcionariaId,
        funcionariaNome: usuario.nome,
        tipo,
        selfie,
      });
      setMensagem(tipo === 'entrada' ? '✅ Entrada registrada!' : '✅ Saída registrada!');
    } catch {
      setMensagem('⚠️ Não foi possível registrar. Tente novamente.');
    }
  }

  function onArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    registrar(tipoPendente.current, file);
    e.target.value = '';
  }

  const ordenadosHoje = [...registrosHoje].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div style={{ minHeight: '100vh', background: TOKENS.bg }}>
      {/* Topo */}
      <div
        style={{
          background: `linear-gradient(135deg, ${TOKENS.primary} 0%, #2c4a7c 100%)`,
          padding: '20px 20px 24px',
          color: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Olá,</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{usuario?.nome}</div>
          </div>
          <button
            onClick={() => signOutUser()}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Sair
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 40px' }}>
        {/* Status do dia */}
        <Card style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: TOKENS.muted, marginBottom: 8 }}>
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </div>
          <div style={{ marginBottom: 12 }}>
            {trabalhando ? (
              <Chip color="green">● Trabalhando desde {ordenadosHoje[ordenadosHoje.length - 1]?.hora}</Chip>
            ) : (
              <Chip color="gray">○ Fora de expediente</Chip>
            )}
          </div>
          <div style={{ fontSize: 13, color: TOKENS.ink2 }}>
            Horas hoje: <strong>{formatDuracao(totalMs)}</strong>
          </div>
        </Card>

        {/* Botão principal */}
        <Btn
          variant={proximoTipo === 'entrada' ? 'success' : 'danger'}
          size="lg"
          disabled={salvando}
          onClick={() => abrirCamera(proximoTipo)}
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: 18,
            padding: '20px',
            borderRadius: 14,
          }}
        >
          {salvando
            ? 'Registrando…'
            : proximoTipo === 'entrada'
              ? '📸 Registrar Entrada'
              : '📸 Registrar Saída'}
        </Btn>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={onArquivo}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => registrar(proximoTipo, null)}
          disabled={salvando}
          style={{
            display: 'block',
            margin: '12px auto 0',
            background: 'none',
            border: 'none',
            color: TOKENS.muted,
            fontSize: 12,
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          registrar sem foto
        </button>

        {mensagem && (
          <div
            style={{
              marginTop: 14,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 600,
              color: mensagem.startsWith('✅') ? TOKENS.green : TOKENS.red,
            }}
          >
            {mensagem}
          </div>
        )}

        {syncStatus === 'offline' && (
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: TOKENS.amber }}>
            Sem conexão — o registro será sincronizado quando voltar.
          </div>
        )}

        {/* Registros de hoje */}
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: TOKENS.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 10,
            }}
          >
            Registros de hoje
          </div>
          {ordenadosHoje.length === 0 ? (
            <Card style={{ textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>
              Nenhum registro hoje ainda.
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ordenadosHoje.map((r) => (
                <Card key={r.id} padding={12}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {r.selfieUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.selfieUrl}
                        alt="selfie"
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: TOKENS.line2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                        }}
                      >
                        {r.tipo === 'entrada' ? '↪' : '↩'}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <Chip color={r.tipo === 'entrada' ? 'green' : 'red'} size="xs">
                        {r.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </Chip>
                      <div style={{ fontSize: 16, fontWeight: 700, color: TOKENS.ink, marginTop: 4 }}>
                        {r.hora}
                      </div>
                    </div>
                    {r.lat != null && (
                      <span style={{ fontSize: 16 }} title="Localização capturada">
                        📍
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
