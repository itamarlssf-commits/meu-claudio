import type {
  AppData,
  Paciente,
  SocioFlat,
  AlertaCobranca,
  ConsultaSugerida,
  IdadeGestacional,
} from '@/types/paciente';

export const STORAGE_KEY = 'controle_consultorio_v1';

export const DEFAULT_DATA: AppData = {
  pacientes: [
    {
      id: 'lais',
      nome: 'Laís Carneiro Vieira Santos',
      telefone: '11987654321',
      email: '',
      dataNasc: '1992-03-15',
      dum: '2025-07-16',
      dpp: '2026-04-23',
      via: 'Normal',
      pacote: 'Parto',
      contrato: 10000,
      pagamentos: [{ id: 'p1', valor: 10000, data: '2026-03-25', forma: 'PIX', tipo: 'Entrada' }],
      partoRealizado: true,
      dataPartoReal: '2026-04-13',
      socio: 'Lucas',
      socioValor: 4100,
      socioImpostos: 0,
      socioPago: true,
      socioDataPgt: '2026-04-15',
      socios: [],
      multi: [{ profissional: 'Nutricionista', valor: 0, pago: true, data: null }],
      consultas: [],
      observacoes: [],
      status: 'pago',
      origem: 'Indicação',
      criadoEm: '2025-12-01',
    },
    {
      id: 'viviane',
      nome: 'Viviane Pereira de Souza Felix',
      telefone: '11912345678',
      email: '',
      dataNasc: '1990-05-22',
      dum: '2025-08-11',
      dpp: '2026-05-18',
      via: 'Normal',
      pacote: 'Parto',
      contrato: 12000,
      pagamentos: [{ id: 'p1', valor: 12000, data: '2026-04-08', forma: 'Cartão', tipo: 'Integral' }],
      partoRealizado: false,
      dataPartoReal: null,
      socios: [],
      multi: [],
      consultas: [],
      observacoes: [],
      status: 'pago',
      origem: 'Instagram',
      criadoEm: '2025-11-15',
    },
    {
      id: 'luisa',
      nome: 'Luisa Caroline',
      telefone: '11998765432',
      email: '',
      dataNasc: '1988-11-03',
      dum: '2025-10-20',
      dpp: '2026-07-27',
      via: 'Cesária',
      pacote: 'Consultas + Parto',
      contrato: 10000,
      pagamentos: [],
      partoRealizado: false,
      dataPartoReal: null,
      socios: [],
      multi: [],
      consultas: [],
      observacoes: [{ data: '2026-04-20', texto: 'Cliente inadimplente — sem entrada' }],
      status: 'pendente',
      origem: 'Indicação',
      criadoEm: '2026-01-10',
    },
    {
      id: 'juliana',
      nome: 'Juliana Duarte',
      telefone: '11955667788',
      email: '',
      dataNasc: '1991-07-19',
      dum: '2025-11-11',
      dpp: '2026-08-18',
      via: 'Normal',
      pacote: 'Consultas + Parto',
      contrato: 15000,
      pagamentos: [{ id: 'p1', valor: 1500, data: '2026-04-08', forma: 'PIX', tipo: 'Sinal' }],
      partoRealizado: false,
      dataPartoReal: null,
      socios: [],
      multi: [{ profissional: 'Nutricionista', valor: 1200, pago: false }],
      consultas: [],
      observacoes: [],
      status: 'parcial',
      origem: 'Site',
      criadoEm: '2026-02-01',
    },
    {
      id: 'amanda',
      nome: 'Amanda Maria de Araujo',
      telefone: '11944556677',
      email: '',
      dataNasc: '1989-09-08',
      dum: '2025-12-02',
      dpp: '2026-09-08',
      via: 'Normal',
      pacote: 'Consultas + Parto',
      contrato: 17500,
      pagamentos: [{ id: 'p1', valor: 5250, data: '2026-05-05', forma: 'PIX', tipo: 'Entrada 30%' }],
      partoRealizado: false,
      dataPartoReal: null,
      socios: [],
      multi: [{ profissional: 'Psicóloga', valor: 800, pago: true }],
      consultas: [],
      observacoes: [],
      status: 'parcial',
      origem: 'Indicação',
      criadoEm: '2026-02-15',
    },
    {
      id: 'talita',
      nome: 'Talita Peixoto Cruz',
      telefone: '11933445566',
      email: '',
      dataNasc: '1987-04-12',
      dum: '2025-12-08',
      dpp: '2026-09-14',
      via: 'Normal',
      pacote: 'Cerclagem + Nutri + Parto',
      contrato: 20000,
      pagamentos: [{ id: 'p1', valor: 5000, data: '2026-04-14', forma: 'PIX', tipo: 'Entrada' }],
      partoRealizado: false,
      dataPartoReal: null,
      socios: [],
      multi: [{ profissional: 'Nutricionista', valor: 2400, pago: true }],
      consultas: [],
      observacoes: [{ data: '2026-05-01', texto: 'R$15k pendente — cobrar urgente' }],
      status: 'parcial',
      origem: 'Indicação',
      criadoEm: '2026-01-20',
    },
    {
      id: 'dayane',
      nome: 'Dayane da Silva Vieira',
      telefone: '11922334455',
      email: '',
      dataNasc: '1993-02-28',
      dum: '2026-01-02',
      dpp: '2026-10-09',
      via: 'Normal',
      pacote: 'Consultas + Parto',
      contrato: 20000,
      pagamentos: [],
      partoRealizado: false,
      dataPartoReal: null,
      socios: [],
      multi: [],
      consultas: [],
      observacoes: [],
      status: 'pendente',
      origem: 'Instagram',
      criadoEm: '2026-03-01',
    },
    {
      id: 'vivian',
      nome: 'Vivian Freire Soares Coutinho',
      telefone: '11911223344',
      email: '',
      dataNasc: '1990-12-19',
      dum: '2026-01-26',
      dpp: '2026-11-02',
      via: 'Normal',
      pacote: 'Consultas + Nutri + Pers + Parto',
      contrato: 22000,
      pagamentos: [],
      partoRealizado: false,
      dataPartoReal: null,
      socios: [],
      multi: [
        { profissional: 'Nutricionista', valor: 0, pago: false },
        { profissional: 'Personal', valor: 0, pago: false },
      ],
      consultas: [],
      observacoes: [{ data: '2026-04-30', texto: 'Maior contrato — sem nenhum pagamento' }],
      status: 'pendente',
      origem: 'Indicação',
      criadoEm: '2026-02-25',
    },
    {
      id: 'virginia',
      nome: 'Virginia Rodrigues de Oliveira Siqueira',
      telefone: '11900112233',
      email: '',
      dataNasc: '1992-08-04',
      dum: '2025-11-17',
      dpp: '2026-08-24',
      via: 'Normal',
      pacote: 'Consultas + Parto',
      contrato: 21000,
      pagamentos: [{ id: 'p1', valor: 5000, data: '2026-04-29', forma: 'PIX', tipo: 'Entrada' }],
      partoRealizado: false,
      dataPartoReal: null,
      socios: [],
      multi: [],
      consultas: [],
      observacoes: [],
      status: 'parcial',
      origem: 'Site',
      criadoEm: '2026-02-10',
    },
    {
      id: 'vanessa',
      nome: 'Vanessa Nicolau',
      telefone: '11988776655',
      email: '',
      dataNasc: '1986-06-30',
      dum: '2026-01-13',
      dpp: '2026-10-20',
      via: 'Cesária',
      pacote: 'Consultas + Psico + Cesária',
      contrato: 13000,
      pagamentos: [],
      partoRealizado: false,
      dataPartoReal: null,
      socios: [],
      multi: [{ profissional: 'Psicóloga', valor: 0, pago: false }],
      consultas: [],
      observacoes: [],
      status: 'pendente',
      origem: 'Indicação',
      criadoEm: '2026-03-05',
    },
  ],
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as AppData;
  } catch (e) {
    // ignore
  }
  return DEFAULT_DATA;
}

export function saveDataLocal(d: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch (e) {
    // ignore
  }
}

export function fmtMoney(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return 'R$ 0';
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const parts = iso.split('-');
  if (parts.length !== 3) return '—';
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return '—';
  const parts = iso.split('-');
  if (parts.length !== 3) return '—';
  const [, m, d] = parts;
  return `${d}/${m}`;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function diffDays(iso1: string, iso2: string): number {
  return Math.round((new Date(iso2).getTime() - new Date(iso1).getTime()) / (1000 * 60 * 60 * 24));
}

export function totalPago(p: Paciente): number {
  return (p.pagamentos || []).reduce((s, x) => s + (x.valor || 0), 0);
}

export function saldo(p: Paciente): number {
  return (p.contrato || 0) - totalPago(p);
}

export function pctPago(p: Paciente): number {
  if (!p.contrato) return 0;
  return Math.round((totalPago(p) / p.contrato) * 100);
}

export function statusOf(p: Paciente): 'pago' | 'parcial' | 'pendente' {
  const pago = totalPago(p);
  if (pago >= p.contrato && p.contrato > 0) return 'pago';
  if (pago > 0) return 'parcial';
  return 'pendente';
}

export function idadeGestacional(dum: string | null | undefined, refDate?: string): IdadeGestacional | null {
  if (!dum) return null;
  const ref = refDate ? new Date(refDate) : new Date();
  const dias = Math.round((ref.getTime() - new Date(dum).getTime()) / (1000 * 60 * 60 * 24));
  return { semanas: Math.floor(dias / 7), dias: dias % 7, total: dias };
}

export function proximasConsultas(dum: string | null | undefined): ConsultaSugerida[] {
  if (!dum) return [];
  const start = new Date(dum);
  const semanas: number[] = [];
  for (let s = 8; s <= 30; s += 4) semanas.push(s);
  semanas.push(33, 35, 37, 38, 39, 40);
  return semanas.map((s) => {
    const d = new Date(start);
    d.setDate(d.getDate() + s * 7);
    return {
      semana: s,
      data: d.toISOString().split('T')[0],
      especial: s === 35 ? 'Pré-anestésica' : null,
    };
  });
}

export function sociosRepasses(p: Paciente, opts: { onlyPostParto?: boolean } = {}): SocioFlat[] {
  const out: SocioFlat[] = [];
  if (p.socio) {
    out.push({
      nome: p.socio,
      papel: 'Auxiliar',
      valor: p.socioValor || 0,
      impostos: p.socioImpostos || 0,
      pago: !!p.socioPago,
      dataPgt: p.socioDataPgt || null,
      _legacy: false,
      _idx: 0,
    });
  }
  (p.socios || []).forEach((s, i) =>
    out.push({
      nome: s.nome,
      papel: s.papel,
      valor: s.valor,
      impostos: s.impostos,
      pago: s.pago,
      dataPgt: s.dataPgt,
      _legacy: true,
      _idx: i,
    })
  );
  return opts.onlyPostParto ? out.filter(() => p.partoRealizado) : out;
}

export function alertasCobrancaDPP(p: Paciente): AlertaCobranca[] {
  if (!p.dpp) return [];
  const hoje = new Date();
  const dpp = new Date(p.dpp);
  const dias = Math.round((dpp.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  const marcos = [
    { d: 90, label: 'D-90', meta: 30 },
    { d: 60, label: 'D-60', meta: 50 },
    { d: 30, label: 'D-30', meta: 80 },
    { d: 7, label: 'D-7', meta: 100 },
  ];
  const pct = pctPago(p);
  return marcos
    .filter((m) => dias <= m.d && pct < m.meta)
    .map((m) => ({ ...m, diasRestantes: dias, pctAtual: pct }));
}

export function whatsAppCobranca(p: Paciente): string {
  const sld = saldo(p);
  const dpp = fmtDate(p.dpp);
  const primeiro = p.nome.split(' ')[0];
  const txt = `Olá, ${primeiro}! Tudo bem? Aqui é a secretária do Dr. Itamar.\n\nPassando para te lembrar do saldo do seu acompanhamento (${fmtMoney(sld)}). Sua DPP está marcada para ${dpp}.\n\nFico à disposição para combinarmos a melhor forma de pagamento. ❤️`;
  return `https://wa.me/55${(p.telefone || '').replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`;
}

export function whatsAppLembreteConsulta(p: Paciente, dataConsulta: string, hora?: string): string {
  const primeiro = p.nome.split(' ')[0];
  const txt = `Olá, ${primeiro}! Lembrete da sua consulta com Dr. Itamar amanhã (${fmtDate(dataConsulta)}) às ${hora || 'horário marcado'}. Confirma presença? 🤰`;
  return `https://wa.me/55${(p.telefone || '').replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`;
}

export function gcalLink(titulo: string, dataISO?: string, hora?: string, descricao?: string): string {
  const dt = (dataISO || todayISO()).replace(/-/g, '');
  const h = (hora || '09:00').replace(':', '') + '00';
  const start = `${dt}T${h}`;
  const horaBase = hora || '09:00';
  const endH =
    String(parseInt(horaBase.split(':')[0]) + 1).padStart(2, '0') + horaBase.split(':')[1] + '00';
  const end = `${dt}T${endH}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${start}/${end}&details=${encodeURIComponent(descricao || '')}`;
}
