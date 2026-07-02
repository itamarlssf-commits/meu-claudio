'use client';

import { useState } from 'react';
import type { AppData, Paciente } from '@/types/paciente';
import type { Lead } from '@/types/lead';
import { useAppStore } from '@/store/use-app-store';
import useLeads from '@/hooks/useLeads';
import { todayISO } from '@/lib/business-logic';
import LeadsDashboard from './atendimento/LeadsDashboard';
import NovoAtendimento from './atendimento/NovoAtendimento';

interface Props {
  data: AppData;
  setData: (d: AppData) => void;
}

export default function AtendimentoView({ data, setData }: Props) {
  const [mode, setMode] = useState<'dashboard' | 'novo'>('dashboard');
  const user = useAppStore((s) => s.user);
  const { leads, saveLead, removeLead } = useLeads();

  function handleConvertToPaciente(lead: Lead) {
    const novaPaciente: Paciente = {
      id: 'pac_' + Date.now().toString(36),
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email ?? '',
      dataNasc: '',
      dum: '',
      dpp: '',
      via: 'A definir',
      pacote: '',
      contrato: 0,
      pagamentos: [],
      partoRealizado: false,
      dataPartoReal: null,
      multi: [],
      consultas: [],
      observacoes: lead.observacoes
        ? [{ data: todayISO(), texto: `Lead convertido: ${lead.observacoes}` }]
        : [],
      status: 'pendente',
      origem: (['Indicação', 'Instagram', 'Site', 'Google'] as const).includes(lead.origem as never)
        ? (lead.origem as Paciente['origem'])
        : 'Outra',
      criadoEm: todayISO(),
    };
    setData({ ...data, pacientes: [...data.pacientes, novaPaciente] });
    saveLead({ ...lead, observacoes: `${lead.observacoes}${lead.observacoes ? ' | ' : ''}[Convertida em paciente]` });
  }

  if (mode === 'novo') {
    return (
      <NovoAtendimento
        leads={leads}
        pacientes={data.pacientes}
        onSave={(lead) => {
          saveLead(lead);
          setMode('dashboard');
        }}
        onCancel={() => setMode('dashboard')}
        userEmail={user?.email ?? ''}
      />
    );
  }

  return (
    <LeadsDashboard
      leads={leads}
      pacientes={data.pacientes}
      onSaveLead={saveLead}
      onRemoveLead={removeLead}
      onNovoAtendimento={() => setMode('novo')}
      onConvert={handleConvertToPaciente}
    />
  );
}
