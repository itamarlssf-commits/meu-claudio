// Utilitários do módulo de Ponto Eletrônico: datas, horas trabalhadas,
// relatório mensal, compressão de selfie e captura de GPS.

import type { Funcionaria, LocalTrabalho, RegistroPonto, TipoRegistro } from '@/types/ponto';
import { TIPOS_ABRE } from '@/types/ponto';

function abre(tipo: TipoRegistro): boolean {
  return TIPOS_ABRE.includes(tipo);
}

export function novoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * E-mails de admin definidos via env NEXT_PUBLIC_PONTO_ADMIN_EMAILS
 * (separados por vírgula). Permite o "primeiro admin" sem precisar criar
 * o doc em ponto_usuarios manualmente.
 */
/**
 * Admins padrão (fallback quando a env não está definida no ambiente, ex.:
 * preview da Vercel sem env var configurada). Pode ser estendido por
 * NEXT_PUBLIC_PONTO_ADMIN_EMAILS (separado por vírgula).
 */
const ADMINS_PADRAO = ['itamarlssf@gmail.com'];

export function emailEhAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const daEnv = (process.env.NEXT_PUBLIC_PONTO_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const lista = [...ADMINS_PADRAO.map((e) => e.toLowerCase()), ...daEnv];
  return lista.includes(email.toLowerCase());
}

// ── Datas / horas (timezone local) ────────────────────────────────

export function dataLocal(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

export function horaLocal(d: Date = new Date()): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export function formatDataBR(data: string): string {
  const [y, m, d] = data.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDuracao(ms: number): string {
  if (ms <= 0) return '0h';
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h ${String(min).padStart(2, '0')}min`;
}

// ── Cálculo de horas trabalhadas ──────────────────────────────────

export interface ParRegistro {
  inicio: RegistroPonto; // abre o período (entrada ou volta do intervalo)
  fim?: RegistroPonto; // fecha o período (saída ou início do intervalo)
  duracaoMs: number; // 0 quando ainda em aberto
}

/**
 * Pareia períodos de trabalho de uma lista de registros (mesmo dia/funcionária),
 * em ordem cronológica. Registros que "abrem" (entrada, volta do intervalo) começam
 * a contar; registros que "fecham" (saída, início do intervalo) param de contar.
 * Assim o tempo de intervalo/almoço é automaticamente descontado.
 */
export function parearRegistros(registros: RegistroPonto[]): {
  pares: ParRegistro[];
  totalMs: number;
} {
  const ordenados = [...registros].sort((a, b) => a.timestamp - b.timestamp);
  const pares: ParRegistro[] = [];
  let totalMs = 0;
  let aberto: RegistroPonto | null = null;

  for (const reg of ordenados) {
    if (abre(reg.tipo)) {
      if (aberto) {
        // abertura sem fechamento anterior — registra em aberto
        pares.push({ inicio: aberto, duracaoMs: 0 });
      }
      aberto = reg;
    } else {
      // fecha
      if (aberto) {
        const dur = reg.timestamp - aberto.timestamp;
        pares.push({ inicio: aberto, fim: reg, duracaoMs: dur });
        totalMs += dur;
        aberto = null;
      }
      // fechamento sem abertura é ignorado no cálculo
    }
  }
  if (aberto) {
    pares.push({ inicio: aberto, duracaoMs: 0 });
  }
  return { pares, totalMs };
}

export function agruparPorDia(
  registros: RegistroPonto[],
): Map<string, RegistroPonto[]> {
  const mapa = new Map<string, RegistroPonto[]>();
  for (const reg of registros) {
    const arr = mapa.get(reg.data) ?? [];
    arr.push(reg);
    mapa.set(reg.data, arr);
  }
  return mapa;
}

export type EstadoExpediente = 'fora' | 'trabalhando' | 'intervalo';

/** Status atual do dia para uma funcionária a partir do último registro. */
export function statusAtual(registrosDoDia: RegistroPonto[]): {
  estado: EstadoExpediente;
  ultimoRegistro?: RegistroPonto;
} {
  const ordenados = [...registrosDoDia].sort((a, b) => a.timestamp - b.timestamp);
  const ultimo = ordenados[ordenados.length - 1];
  let estado: EstadoExpediente = 'fora';
  if (ultimo) {
    if (ultimo.tipo === 'inicio_intervalo') estado = 'intervalo';
    else if (abre(ultimo.tipo)) estado = 'trabalhando';
    else estado = 'fora';
  }
  return { estado, ultimoRegistro: ultimo };
}

export interface LinhaRelatorio {
  funcionariaId: string;
  funcionariaNome: string;
  totalMs: number;
  diasTrabalhados: number;
}

/** Relatório mensal: total de horas por funcionária no mês informado (1-12). */
export function relatorioMensal(
  registros: RegistroPonto[],
  funcionarias: Funcionaria[],
  ano: number,
  mes: number,
): LinhaRelatorio[] {
  const prefixo = `${ano}-${String(mes).padStart(2, '0')}`;
  const doMes = registros.filter((r) => r.data.startsWith(prefixo));

  const porFunc = new Map<string, RegistroPonto[]>();
  for (const reg of doMes) {
    const arr = porFunc.get(reg.funcionariaId) ?? [];
    arr.push(reg);
    porFunc.set(reg.funcionariaId, arr);
  }

  const linhas: LinhaRelatorio[] = [];
  for (const func of funcionarias) {
    const regs = porFunc.get(func.id) ?? [];
    const dias = agruparPorDia(regs);
    let totalMs = 0;
    let diasTrabalhados = 0;
    dias.forEach((regsDoDia) => {
      const { totalMs: t } = parearRegistros(regsDoDia);
      if (t > 0) diasTrabalhados += 1;
      totalMs += t;
    });
    linhas.push({
      funcionariaId: func.id,
      funcionariaNome: func.nome,
      totalMs,
      diasTrabalhados,
    });
  }
  return linhas.sort((a, b) => a.funcionariaNome.localeCompare(b.funcionariaNome));
}

// ── Selfie: compressão client-side ────────────────────────────────

/**
 * Lê um File de imagem, redimensiona para no máx. `maxLado` px e devolve
 * um dataURL JPEG comprimido.
 */
export function comprimirImagem(
  file: File,
  maxLado = 480,
  qualidade = 0.6,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        const w = Math.round(img.width * escala);
        const h = Math.round(img.height * escala);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas indisponível'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', qualidade));
      };
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

// ── GPS ───────────────────────────────────────────────────────────

export interface Coordenadas {
  lat: number;
  lng: number;
  precisao: number;
}

export function obterLocalizacao(): Promise<Coordenadas> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste dispositivo'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precisao: pos.coords.accuracy,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  });
}

// ── Geolocalização de referência (aviso, não bloqueia) ─────────────
// Coordenadas fixas dos dois locais de trabalho. "Casa" é a residência do
// Dr. Itamar (empregada doméstica); "Consultório Ellas" é o endereço do
// consultório. O raio é uma margem de tolerância, não uma cerca rígida.

export const LOCAL_COORD: Record<LocalTrabalho, { lat: number; lng: number }> = {
  'Consultório Ellas': { lat: -8.033257, lng: -34.9045967 },
  Casa: { lat: -8.0304505, lng: -34.8946544 },
};
export const RAIO_AVISO_LOCAL_M = 150;

/** Distância entre duas coordenadas em metros (fórmula de Haversine). */
export function distanciaMetros(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
