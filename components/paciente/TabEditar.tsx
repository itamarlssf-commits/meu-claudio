'use client';

import { useState } from 'react';
import type { Paciente, AppData, Via, Origem } from '@/types/paciente';
import { TOKENS } from '@/lib/tokens';
import { inputBase } from '@/lib/input-styles';
import { Btn, Field } from '@/components/ui';

const VIAS: Via[] = ['Normal', 'Cesária', 'A definir'];
const ORIGENS: Origem[] = ['Indicação', 'Instagram', 'Site', 'Google', 'Outra'];

interface Props {
  paciente: Paciente;
  data: AppData;
  setData: (d: AppData) => void;
  onClose: () => void;
}

export default function TabEditar({ paciente, data, setData, onClose }: Props) {
  const [form, setForm] = useState<Partial<Paciente>>({
    nome: paciente.nome,
    telefone: paciente.telefone,
    email: paciente.email,
    dataNasc: paciente.dataNasc,
    dum: paciente.dum,
    dpp: paciente.dpp,
    via: paciente.via,
    pacote: paciente.pacote,
    contrato: paciente.contrato,
    origem: paciente.origem,
  });

  function upd<K extends keyof Paciente>(key: K, val: Paciente[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function save() {
    const next: AppData = {
      ...data,
      pacientes: data.pacientes.map((p) =>
        p.id === paciente.id ? { ...p, ...form } : p
      ),
    };
    setData(next);
    onClose();
  }

  function deletePaciente() {
    if (!confirm(`Excluir ${paciente.nome}? Esta ação não pode ser desfeita.`)) return;
    const next: AppData = {
      ...data,
      pacientes: data.pacientes.filter((p) => p.id !== paciente.id),
    };
    setData(next);
    onClose();
  }

  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Nome completo">
          <input
            style={inputBase}
            value={form.nome || ''}
            onChange={(e) => upd('nome', e.target.value)}
          />
        </Field>
        <Field label="Telefone">
          <input
            style={inputBase}
            value={form.telefone || ''}
            onChange={(e) => upd('telefone', e.target.value)}
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
        <Field label="DUM">
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

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <Btn variant="danger" size="sm" onClick={deletePaciente}>
          🗑 Excluir Paciente
        </Btn>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" size="sm" onClick={save}>Salvar Alterações</Btn>
        </div>
      </div>
    </div>
  );
}
