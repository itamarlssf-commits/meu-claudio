import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { AppData } from '@/types/paciente';
import type { Lead } from '@/types/lead';
import { DEFAULT_DATA, saveDataLocal } from '@/lib/business-logic';

interface AppStore {
  data: AppData;
  view: string;
  openPacienteId: string | null;
  filterStatus: string;
  user: User | null;
  syncStatus: 'connecting' | 'live' | 'offline';
  authReady: boolean;
  leads: Lead[];
  leadsReady: boolean;

  setData: (data: AppData) => void;
  setView: (view: string) => void;
  setOpenPacienteId: (id: string | null) => void;
  setFilterStatus: (status: string) => void;
  setUser: (user: User | null) => void;
  setSyncStatus: (status: 'connecting' | 'live' | 'offline') => void;
  setAuthReady: (ready: boolean) => void;
  updPaciente: (id: string, patch: Partial<AppData['pacientes'][0]>) => void;
  delPaciente: (id: string) => void;
  setLeads: (leads: Lead[]) => void;
  setLeadsReady: (ready: boolean) => void;
  upsertLead: (lead: Lead) => void;
  removeLeadFromStore: (id: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  data: DEFAULT_DATA,
  view: 'dashboard',
  openPacienteId: null,
  filterStatus: 'all',
  user: null,
  syncStatus: 'connecting',
  authReady: false,
  leads: [],
  leadsReady: false,

  setData: (data) => {
    set({ data });
    saveDataLocal(data);
  },

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

  setLeads: (leads) => set({ leads }),
  setLeadsReady: (ready) => set({ leadsReady: ready }),

  upsertLead: (lead) =>
    set((s) => {
      const idx = s.leads.findIndex((l) => l.id === lead.id);
      if (idx >= 0) {
        const next = [...s.leads];
        next[idx] = lead;
        return { leads: next };
      }
      return { leads: [lead, ...s.leads] };
    }),

  removeLeadFromStore: (id) =>
    set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
}));
