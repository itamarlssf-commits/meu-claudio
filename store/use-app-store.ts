import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { AppData } from '@/types/paciente';
import type { ReformaData } from '@/types/reforma';
import { DEFAULT_DATA, saveDataLocal } from '@/lib/business-logic';
import { REFORMA_DEFAULT } from '@/types/reforma';

interface AppStore {
  data: AppData;
  reforma: ReformaData;
  view: string;
  openPacienteId: string | null;
  filterStatus: string;
  user: User | null;
  syncStatus: 'connecting' | 'live' | 'offline';
  authReady: boolean;

  setData: (data: AppData) => void;
  setReforma: (data: ReformaData) => void;
  setView: (view: string) => void;
  setOpenPacienteId: (id: string | null) => void;
  setFilterStatus: (status: string) => void;
  setUser: (user: User | null) => void;
  setSyncStatus: (status: 'connecting' | 'live' | 'offline') => void;
  setAuthReady: (ready: boolean) => void;
  updPaciente: (id: string, patch: Partial<AppData['pacientes'][0]>) => void;
  delPaciente: (id: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  data: DEFAULT_DATA,
  reforma: REFORMA_DEFAULT,
  view: 'dashboard',
  openPacienteId: null,
  filterStatus: 'all',
  user: null,
  syncStatus: 'connecting',
  authReady: false,

  setData: (data) => {
    set({ data });
    saveDataLocal(data);
  },

  setReforma: (reforma) => set({ reforma }),

  setView: (view) => set({ view }),
  setOpenPacienteId: (id) => set({ openPacienteId: id }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setUser: (user) => set({ user }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setAuthReady: (ready) => set({ authReady: ready }),

  updPaciente: (id, patch) => {
    const data = get().data;
    const next: AppData = {
      ...data,
      pacientes: data.pacientes.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    };
    set({ data: next });
    saveDataLocal(next);
  },

  delPaciente: (id) => {
    const data = get().data;
    const next: AppData = {
      ...data,
      pacientes: data.pacientes.filter((p) => p.id !== id),
    };
    set({ data: next });
    saveDataLocal(next);
  },
}));
