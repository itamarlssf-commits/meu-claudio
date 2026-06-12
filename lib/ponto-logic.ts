// Utilitários do módulo de Ponto Eletrônico: datas, horas trabalhadas,
// relatório mensal, compressão de selfie e captura de GPS.

import type { Funcionaria, RegistroPonto } from '@/types/ponto';

export function novoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * E-mails de admin definidos via env NEXT_PUBLIC_PONTO_ADMIN_EMAILS
 * (separados por vírgula). Permite o "primeiro admin" sem precisar criar
 * o doc em ponto_usuarios manualmente.
 */
export function emailEhAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const lista = (process.env.NEXT_PUBLIC_PONTO_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
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
  entrada: RegistroPonto;
  saida?: RegistroPonto;
  duracaoMs: number; // 0 quando ainda sem saída
}

/**
 * Pareia entrada→saída de uma lista de registros (de um mesmo dia/funcionária),
 * em ordem cronológica. Retorna os pares e o total de ms trabalhados.
 */
export function parearRegistros(registros: RegistroPonto[]): {
  pares: ParRegistro[];
  totalMs: number;
} {
  const ordenados = [...registros].sort((a, b) => a.timestamp - b.timestamp);
  const pares: ParRegistro[] = [];
  let totalMs = 0;
  let entradaAberta: RegistroPonto | null = null;

  for (const reg of ordenados) {
    if (reg.tipo === 'entrada') {
      if (entradaAberta) {
        // entrada sem saída anterior — registra em aberto
        pares.push({ entrada: entradaAberta, duracaoMs: 0 });
      }
      entradaAberta = reg;
    } else if (reg.tipo === 'saida') {
      if (entradaAberta) {
        const dur = reg.timestamp - entradaAberta.timestamp;
        pares.push({ entrada: entradaAberta, saida: reg, duracaoMs: dur });
        totalMs += dur;
        entradaAberta = null;
      }
      // saída sem entrada é ignorada no cálculo
    }
  }
  if (entradaAberta) {
    pares.push({ entrada: entradaAberta, duracaoMs: 0 });
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

/** Status atual do dia para uma funcionária: está trabalhando ou não? */
export function statusAtual(registrosDoDia: RegistroPonto[]): {
  trabalhando: boolean;
  ultimoRegistro?: RegistroPonto;
} {
  const ordenados = [...registrosDoDia].sort((a, b) => a.timestamp - b.timestamp);
  const ultimo = ordenados[ordenados.length - 1];
  return { trabalhando: ultimo?.tipo === 'entrada', ultimoRegistro: ultimo };
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
