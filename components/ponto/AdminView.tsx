'use client';

import { useMemo, useState } from 'react';
import { signOutPonto as signOutUser } from '@/lib/ponto-firebase-app';
import { usePontoStore } from '@/store/use-ponto-store';
import {
  saveFuncionaria,
  criarContaFuncionaria,
  excluirFuncionaria,
  saveRegistro,
  deleteRegistro,
} from '@/lib/ponto-firebase';
import {
  agruparPorDia,
  parearRegistros,
  formatDuracao,
  formatDataBR,
  relatorioMensal,
  JORNADA_PADRAO,
  descreverJornada,
} from '@/lib/ponto-logic';
import { TOKENS } from '@/lib/tokens';
import { inputBase } from '@/lib/input-styles';
import { Card, Btn, Chip, Modal, Field, SectionHeader, KPI } from '@/components/ui';
import { TIPO_LABELS, LOCAIS_TRABALHO, DIAS_SEMANA_LABELS } from '@/types/ponto';
import type { Funcionaria, RegistroPonto, TipoRegistro, LocalTrabalho, JornadaPorDia } from '@/types/ponto';

type Aba = 'registros' | 'funcionarias' | 'relatorio';

type ChipColor = 'green' | 'red' | 'amber' | 'blue';
const CHIP_COR: Record<TipoRegistro, ChipColor> = {
  entrada: 'green',
  saida: 'red',
  inicio_intervalo: 'amber',
  fim_intervalo: 'blue',
};

export default function AdminView() {
  const usuario = usePontoStore((s) => s.usuario);
  const funcionarias = usePontoStore((s) => s.funcionarias);
  const registros = usePontoStore((s) => s.registros);
  const upsertRegistro = usePontoStore((s) => s.upsertRegistro);
  const removeRegistro = usePontoStore((s) => s.removeRegistro);

  const [aba, setAba] = useState<Aba>('registros');

  return (
    <div style={{ minHeight: '100vh', background: TOKENS.bg }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${TOKENS.primary} 0%, #2c4a7c 100%)`,
          padding: '18px 20px',
          color: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 920,
            margin: '0 auto',
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>🕐 Ponto · Administração</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{usuario?.nome}</div>
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

      <div style={{ maxWidth: 920, margin: '0 auto', padding: 20 }}>
        {/* Abas */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(
            [
              ['registros', 'Registros'],
              ['funcionarias', 'Funcionárias'],
              ['relatorio', 'Relatório'],
            ] as [Aba, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              style={{
                background: aba === id ? TOKENS.primary : '#fff',
                color: aba === id ? '#fff' : TOKENS.ink2,
                border: `1.5px solid ${aba === id ? TOKENS.primary : TOKENS.line}`,
                borderRadius: 9,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {aba === 'registros' && (
          <AbaRegistros
            registros={registros}
            funcionarias={funcionarias}
            onSalvar={async (r) => {
              upsertRegistro(r);
              await saveRegistro(r);
            }}
            onExcluir={async (id) => {
              removeRegistro(id);
              await deleteRegistro(id);
            }}
            adminEmail={usuario?.nome ?? ''}
          />
        )}

        {aba === 'funcionarias' && <AbaFuncionarias funcionarias={funcionarias} />}

        {aba === 'relatorio' && (
          <AbaRelatorio registros={registros} funcionarias={funcionarias} />
        )}
      </div>
    </div>
  );
}

// ── Aba: Registros ────────────────────────────────────────────────

function AbaRegistros({
  registros,
  funcionarias,
  onSalvar,
  onExcluir,
  adminEmail,
}: {
  registros: RegistroPonto[];
  funcionarias: Funcionaria[];
  onSalvar: (r: RegistroPonto) => Promise<void>;
  onExcluir: (id: string) => Promise<void>;
  adminEmail: string;
}) {
  const agora = new Date();
  const [filtroFunc, setFiltroFunc] = useState('all');
  const [mesRef, setMesRef] = useState(
    `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`,
  );
  const [editando, setEditando] = useState<RegistroPonto | null>(null);

  const filtrados = useMemo(() => {
    return registros
      .filter((r) => r.data.startsWith(mesRef))
      .filter((r) => filtroFunc === 'all' || r.funcionariaId === filtroFunc);
  }, [registros, mesRef, filtroFunc]);

  const dias = useMemo(() => {
    const mapa = agruparPorDia(filtrados);
    return Array.from(mapa.entries())
      .map(([data, regs]) => {
        const { totalMs } = parearRegistros(regs);
        return { data, regs: regs.sort((a, b) => a.timestamp - b.timestamp), totalMs };
      })
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [filtrados]);

  return (
    <>
      <SectionHeader title="Registros de ponto" subtitle="Filtre, confira e corrija as batidas" />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={filtroFunc}
          onChange={(e) => setFiltroFunc(e.target.value)}
          style={{ ...inputBase, width: 'auto', minWidth: 180 }}
        >
          <option value="all">Todas as funcionárias</option>
          {funcionarias.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </select>
        <input
          type="month"
          value={mesRef}
          onChange={(e) => setMesRef(e.target.value)}
          style={{ ...inputBase, width: 'auto' }}
        />
      </div>

      {dias.length === 0 ? (
        <Card style={{ textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>
          Nenhum registro para este filtro.
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dias.map((d) => (
            <Card key={d.data}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <strong style={{ color: TOKENS.primary }}>{formatDataBR(d.data)}</strong>
                <Chip color="blue" size="xs">
                  {formatDuracao(d.totalMs)}
                </Chip>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.regs.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      background: TOKENS.bg,
                      borderRadius: 8,
                    }}
                  >
                    {r.selfieUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.selfieUrl}
                        alt="selfie"
                        style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 6,
                          background: TOKENS.line2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {CHIP_COR[r.tipo] === 'green' ? '↪' : CHIP_COR[r.tipo] === 'amber' ? '☕' : '↩'}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Chip color={CHIP_COR[r.tipo]} size="xs">
                          {TIPO_LABELS[r.tipo]}
                        </Chip>
                        <strong style={{ fontSize: 15 }}>{r.hora}</strong>
                        {r.editadoPor && (
                          <span style={{ fontSize: 10, color: TOKENS.amber }}>corrigido</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: TOKENS.muted }}>
                        {filtroFunc === 'all' ? r.funcionariaNome + ' · ' : ''}
                        {r.lat != null ? `📍 ${r.lat.toFixed(4)}, ${r.lng?.toFixed(4)}` : 'sem GPS'}
                      </div>
                    </div>
                    <Btn variant="ghost" size="sm" onClick={() => setEditando(r)}>
                      Editar
                    </Btn>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {editando && (
        <ModalEditarRegistro
          registro={editando}
          adminEmail={adminEmail}
          onClose={() => setEditando(null)}
          onSalvar={onSalvar}
          onExcluir={onExcluir}
        />
      )}
    </>
  );
}

function ModalEditarRegistro({
  registro,
  adminEmail,
  onClose,
  onSalvar,
  onExcluir,
}: {
  registro: RegistroPonto;
  adminEmail: string;
  onClose: () => void;
  onSalvar: (r: RegistroPonto) => Promise<void>;
  onExcluir: (id: string) => Promise<void>;
}) {
  const [data, setData] = useState(registro.data);
  const [hora, setHora] = useState(registro.hora);
  const [tipo, setTipo] = useState(registro.tipo);
  const [obs, setObs] = useState(registro.obs ?? '');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const timestamp = new Date(`${data}T${hora}`).getTime();
    const atualizado: RegistroPonto = {
      ...registro,
      data,
      hora,
      tipo,
      obs: obs || undefined,
      timestamp: Number.isNaN(timestamp) ? registro.timestamp : timestamp,
      editadoPor: adminEmail,
    };
    await onSalvar(atualizado);
    setSalvando(false);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Corrigir registro" width={420}>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 12, color: TOKENS.muted }}>{registro.funcionariaNome}</div>
        <Field label="Tipo">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as RegistroPonto['tipo'])}
            style={inputBase}
          >
            {(Object.keys(TIPO_LABELS) as TipoRegistro[]).map((t) => (
              <option key={t} value={t}>
                {TIPO_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Data">
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={inputBase} />
          </Field>
          <Field label="Hora">
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} style={inputBase} />
          </Field>
        </div>
        <Field label="Observação">
          <input value={obs} onChange={(e) => setObs(e.target.value)} style={inputBase} placeholder="opcional" />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <Btn
            variant="danger"
            size="sm"
            onClick={async () => {
              await onExcluir(registro.id);
              onClose();
            }}
          >
            Excluir
          </Btn>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Btn>
            <Btn variant="primary" size="sm" disabled={salvando} onClick={salvar}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Aba: Funcionárias ─────────────────────────────────────────────

function AbaFuncionarias({ funcionarias }: { funcionarias: Funcionaria[] }) {
  const [novaAberta, setNovaAberta] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  async function handleExcluir(f: Funcionaria) {
    const confirmado = window.confirm(
      `Excluir "${f.nome}"? Ela perde o acesso e o cadastro é removido. Os registros de ponto já feitos continuam guardados.`,
    );
    if (!confirmado) return;
    setErro('');
    setExcluindoId(f.id);
    try {
      await excluirFuncionaria(f.id);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Não foi possível excluir.');
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <>
      <SectionHeader
        title="Funcionárias"
        subtitle="Cadastre e gerencie quem registra o ponto"
        action={
          <Btn variant="accent" size="sm" icon="+" onClick={() => setNovaAberta(true)}>
            Nova funcionária
          </Btn>
        }
      />

      {erro && (
        <div
          style={{
            background: TOKENS.redSoft,
            color: '#dc2626',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            marginBottom: 10,
          }}
        >
          {erro}
        </div>
      )}

      {funcionarias.length === 0 ? (
        <Card style={{ textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>
          Nenhuma funcionária cadastrada. Clique em “Nova funcionária”.
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {funcionarias.map((f) => (
            <Card key={f.id} padding={14}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, color: TOKENS.ink }}>{f.nome}</div>
                  <div style={{ fontSize: 12, color: TOKENS.muted }}>
                    {f.local}
                    {f.email ? ` · ${f.email}` : ''}
                    {f.jornadaPorDia ? ` · ${descreverJornada(f.jornadaPorDia)}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Chip color={f.ativo ? 'green' : 'gray'} size="xs">
                    {f.ativo ? 'Ativa' : 'Inativa'}
                  </Chip>
                  <Btn
                    variant="danger"
                    size="sm"
                    disabled={excluindoId === f.id}
                    onClick={() => handleExcluir(f)}
                  >
                    {excluindoId === f.id ? 'Excluindo…' : 'Excluir'}
                  </Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {novaAberta && <ModalNovaFuncionaria onClose={() => setNovaAberta(false)} />}
    </>
  );
}

function ModalNovaFuncionaria({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [local, setLocal] = useState<LocalTrabalho>('Casa');
  const [jornadaPorDia, setJornadaPorDia] = useState<JornadaPorDia>([...JORNADA_PADRAO]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  function alterarHoraDoDia(indice: number, valor: string) {
    const copia = [...jornadaPorDia] as JornadaPorDia;
    copia[indice] = valor ? Number(valor) : 0;
    setJornadaPorDia(copia);
  }

  async function salvar() {
    setErro('');
    if (!nome || !email) {
      setErro('Preencha nome e e-mail.');
      return;
    }
    setSalvando(true);
    try {
      await criarContaFuncionaria({
        nome,
        email,
        local,
        jornadaPorDia,
      });
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('email-already-in-use')) {
        setErro('Este e-mail já está cadastrado.');
      } else {
        setErro('Não foi possível criar a conta. Verifique os dados.');
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Nova funcionária" width={420}>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Nome">
          <input value={nome} onChange={(e) => setNome(e.target.value)} style={inputBase} placeholder="Nome completo" />
        </Field>
        <Field label="E-mail (login)">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputBase}
            placeholder="email@exemplo.com"
          />
        </Field>
        <Field label="Local">
          <select
            value={local}
            onChange={(e) => setLocal(e.target.value as LocalTrabalho)}
            style={inputBase}
          >
            {LOCAIS_TRABALHO.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Jornada por dia (horas líquidas, já sem o almoço)"
          hint={`Total na semana: ${jornadaPorDia.reduce((a, h) => a + h, 0)}h`}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {DIAS_SEMANA_LABELS.map((label, i) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: TOKENS.muted, marginBottom: 4 }}>{label}</div>
                <input
                  type="number"
                  value={jornadaPorDia[i]}
                  onChange={(e) => alterarHoraDoDia(i, e.target.value)}
                  style={{ ...inputBase, padding: '6px 4px', textAlign: 'center' }}
                  min={0}
                  max={24}
                  step={0.5}
                />
              </div>
            ))}
          </div>
        </Field>

        <div style={{ fontSize: 11, color: TOKENS.muted }}>
          Ela vai receber um e-mail para criar a própria senha e acessar.
        </div>

        {erro && (
          <div
            style={{
              background: TOKENS.redSoft,
              color: '#dc2626',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 12,
            }}
          >
            {erro}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <Btn variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Btn>
          <Btn variant="primary" size="sm" disabled={salvando} onClick={salvar}>
            {salvando ? 'Criando…' : 'Criar conta'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

// ── Aba: Relatório ────────────────────────────────────────────────

function AbaRelatorio({
  registros,
  funcionarias,
}: {
  registros: RegistroPonto[];
  funcionarias: Funcionaria[];
}) {
  const agora = new Date();
  const [mesRef, setMesRef] = useState(
    `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`,
  );

  const [ano, mes] = mesRef.split('-').map(Number);
  const linhas = useMemo(
    () => relatorioMensal(registros, funcionarias, ano, mes),
    [registros, funcionarias, ano, mes],
  );
  const totalGeral = linhas.reduce((acc, l) => acc + l.totalMs, 0);

  return (
    <>
      <SectionHeader
        title="Relatório mensal"
        subtitle="Total de horas por funcionária"
        action={
          <input
            type="month"
            value={mesRef}
            onChange={(e) => setMesRef(e.target.value)}
            style={{ ...inputBase, width: 'auto' }}
          />
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <KPI label="Total geral" value={formatDuracao(totalGeral)} accent={TOKENS.primary} icon="⏱" />
        <KPI label="Funcionárias" value={String(funcionarias.length)} accent={TOKENS.accent} icon="👥" />
      </div>

      {linhas.length === 0 ? (
        <Card style={{ textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>
          Nenhuma funcionária cadastrada.
        </Card>
      ) : (
        <Card padding={0}>
          {linhas.map((l, i) => (
            <div
              key={l.funcionariaId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderTop: i === 0 ? 'none' : `1px solid ${TOKENS.line}`,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: TOKENS.ink }}>{l.funcionariaNome}</div>
                <div style={{ fontSize: 12, color: TOKENS.muted }}>
                  {l.diasTrabalhados} dia(s) trabalhado(s)
                </div>
              </div>
              <strong style={{ fontSize: 16, color: TOKENS.primary }}>
                {formatDuracao(l.totalMs)}
              </strong>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
