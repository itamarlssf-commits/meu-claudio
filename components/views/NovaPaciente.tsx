'use client';

import { useState } from 'react';
import type { Paciente, AppData, Via, Origem } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { inputBase } from '@/lib/input-styles';
import { Modal, Btn, Field } from '@/components/ui';
import { todayISO } from '@/lib/business-logic';

const VIAS: Via[] = ['Normal', 'Cesária', 'A definir'];
const ORIGENS: Origem[] = ['Indicação', 'Instagram', 'Site', 'Google', 'Outra'];

interface Props {
  open: boolean;
  onClose: () => void;
  data: AppData;
  setData: (d: AppData) => void;
}

function genId(nome: string): string {
  return (
    nome
      .toLowerCase()
      .split(' ')[0]
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z]/g, '') + Date.now().toString(36)
  );
}

export default function NovaPaciente({ open, onClose, data, setData }: Props) {
  const blank = (): Partial<Paciente> => ({
    nome: '',
    telefone: '',
    email: '',
    dataNasc: '',
    dum: '',
    dpp: '',
    via: 'A definir',
    pacote: '',
    contrato: 0,
    origem: 'Indicação',
  });

  const [form, setForm] = useState<Partial<Paciente>>(blank());
  const [err, setErr] = useState('');

  function upd<K extends keyof Paciente>(k: K, v: Paciente[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function save() {
    if (!form.nome?.trim()) return setErr('Nome é obrigatório');
    setErr('');

    const nova: Paciente = {
      id: genId(form.nome!),
      nome: form.nome!,
      telefone: form.telefone || '',
      email: form.email || '',
      dataNasc: form.dataNasc || '',
      dum: form.dum || '',
      dpp: form.dpp || '',
      via: form.via || 'A definir',
      pacote: form.pacote || '',
      contrato: form.contrato || 0,
      pagamentos: [],
      partoRealizado: false,
      dataPartoReal: null,
      socios: [],
      multi: [],
      consultas: [],
      observacoes: [],
      status: 'pendente',
      origem: form.origem || 'Indicação',
      criadoEm: todayISO(),
    };

    setData({ ...data, pacientes: [...data.pacientes, nova] });
    setForm(blank());
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova Paciente" width={560}>
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {err && (
          <div
            style={{
              background: TOKENS.redSoft,
              color: TOKENS.red,
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
            }}
          >
            {err}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Nome completo *">
              <input
                style={inputBase}
                value={form.nome || ''}
                onChange={(e) => upd('nome', e.target.value)}
                placeholder="Nome da paciente"
              />
            </Field>
          </div>
          <Field label="Telefone">
            <input
              style={inputBase}
              value={form.telefone || ''}
              onChange={(e) => upd('telefone', e.target.value)}
              placeholder="11999999999"
            />
          </Field>
          <Field label="E-mail">
            <input
              style={inputBase}
              type="email"
              value={form.email || ''}
              onChange={(e) => upd('email', e.target.value)}
            />
          </Field>
          <Field label="Data de Nascimento">
            <input
              style={inputBase}
              type="date"
              value={form.dataNasc || ''}
              onChange={(e) => upd('dataNasc', e.target.value)}
            />
          </Field>
          <Field label="DUM (1º dia da última menstruação)">
            <input
              style={inputBase}
              type="date"
              value={form.dum || ''}
              onChange={(e) => upd('dum', e.target.value)}
            />
          </Field>
          <Field label="DPP">
            <input
              style={inputBase}
              type="date"
              value={form.dpp || ''}
              onChange={(e) => upd('dpp', e.target.value)}
            />
          </Field>
          <Field label="Via do Parto">
            <select
              style={inputBase}
              value={form.via || 'A definir'}
              onChange={(e) => upd('via', e.target.value as Via)}
            >
              {VIAS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Pacote">
            <input
              style={inputBase}
              value={form.pacote || ''}
              onChange={(e) => upd('pacote', e.target.value)}
              placeholder="Ex: Consultas + Parto"
            />
          </Field>
          <Field label="Valor do Contrato (R$)">
            <input
              style={inputBase}
              type="number"
              value={form.contrato || ''}
              onChange={(e) => upd('contrato', parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field label="Origem">
            <select
              style={inputBase}
              value={form.origem || 'Indicação'}
              onChange={(e) => upd('origem', e.target.value as Origem)}
            >
              {ORIGENS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Btn variant="ghost" size="sm" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" size="sm" onClick={save}>Cadastrar Paciente</Btn>
        </div>
      </div>
    </Modal>
  );
}
