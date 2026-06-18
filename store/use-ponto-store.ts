import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { Funcionaria, RegistroPonto, UsuarioPonto } from '@/types/ponto';

interface PontoStore {
  user: User | null;
  authReady: boolean;
  usuario: UsuarioPonto | null; // papel resolvido (admin / funcionaria)
  usuarioReady: boolean;
  funcionarias: Funcionaria[];
  registros: RegistroPonto[];
  syncStatus: 'connecting' | 'live' | 'offline';

  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  setUsuario: (usuario: UsuarioPonto | null) => void;
  setUsuarioReady: (ready: boolean) => void;
  setFuncionarias: (funcionarias: Funcionaria[]) => void;
  setRegistros: (registros: RegistroPonto[]) => void;
  upsertRegistro: (registro: RegistroPonto) => void;
  removeRegistro: (id: string) => void;
  setSyncStatus: (status: 'connecting' | 'live' | 'offline') => void;
}

export const usePontoStore = create<PontoStore>((set) => ({
  user: null,
  authReady: false,
  usuario: null,
  usuarioReady: false,
  funcionarias: [],
  registros: [],
  syncStatus: 'connecting',

  setUser: (user) => set({ user }),
  setAuthReady: (ready) => set({ authReady: ready }),
  setUsuario: (usuario) => set({ usuario }),
  setUsuarioReady: (ready) => set({ usuarioReady: ready }),
  setFuncionarias: (funcionarias) => set({ funcionarias }),
  setRegistros: (registros) => set({ registros }),

  upsertRegistro: (registro) =>
    set((s) => {
      const idx = s.registros.findIndex((r) => r.id === registro.id);
      if (idx >= 0) {
        const next = [...s.registros];
        next[idx] = registro;
        return { registros: next };
      }
      return { registros: [registro, ...s.registros] };
    }),

  removeRegistro: (id) =>
    set((s) => ({ registros: s.registros.filter((r) => r.id !== id) })),

  setSyncStatus: (status) => set({ syncStatus: status }),
}));
