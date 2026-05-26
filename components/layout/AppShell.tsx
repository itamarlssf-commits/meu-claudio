'use client';

import { useAppStore } from '@/store/use-app-store';
import { signOutUser } from '@/lib/firebase';
import useData from '@/hooks/useData';
import Sidebar from './Sidebar';
import Dashboard from '@/components/views/Dashboard';
import PacientesView from '@/components/views/PacientesView';
import FinanceiroView from '@/components/views/FinanceiroView';
import AgendaView from '@/components/views/AgendaView';
import AlertasView from '@/components/views/AlertasView';
import ReformaView from '@/components/views/ReformaView';
import PacienteModal from '@/components/paciente/PacienteModal';

export default function AppShell() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const openPacienteId = useAppStore((s) => s.openPacienteId);
  const setOpenPacienteId = useAppStore((s) => s.setOpenPacienteId);
  const user = useAppStore((s) => s.user);
  const syncStatus = useAppStore((s) => s.syncStatus);
  const { data, setData } = useData();

  async function handleSignOut() {
    await signOutUser();
  }

  function openPaciente(id: string) {
    setOpenPacienteId(id);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafaf7' }}>
      <Sidebar
        view={view}
        onNav={setView}
        data={data}
        setData={setData}
        user={user}
        syncStatus={syncStatus}
        onSignOut={handleSignOut}
      />

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {view === 'dashboard' && (
          <Dashboard data={data} onOpenPaciente={openPaciente} />
        )}
        {view === 'pacientes' && (
          <PacientesView data={data} setData={setData} onOpenPaciente={openPaciente} />
        )}
        {view === 'financeiro' && (
          <FinanceiroView data={data} setData={setData} onOpenPaciente={openPaciente} />
        )}
        {view === 'agenda' && (
          <AgendaView data={data} onOpenPaciente={openPaciente} />
        )}
        {view === 'alertas' && (
          <AlertasView data={data} setData={setData} onOpenPaciente={openPaciente} />
        )}
        {view === 'reforma' && (
          <ReformaView />
        )}
      </main>

      {openPacienteId && (
        <PacienteModal
          pacienteId={openPacienteId}
          data={data}
          setData={setData}
          onClose={() => setOpenPacienteId(null)}
        />
      )}
    </div>
  );
}
