// Camada de acesso a dados do módulo de Ponto Eletrônico.
// Usa a instância Firebase DEDICADA (lib/ponto-firebase-app.ts) e coleções
// isoladas (prefixo "ponto_") — projeto separado do CRM.

import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import {
  pontoDb as db,
  pontoAuth,
  getPontoStorageLazy as getStorageLazy,
  pontoConfigValues as firebaseConfigValues,
  enviarLinkDeSenha,
} from '@/lib/ponto-firebase-app';
import type { Funcionaria, JornadaPorDia, LocalTrabalho, RegistroPonto, UsuarioPonto } from '@/types/ponto';

const FUNCIONARIAS_COL = collection(db, 'ponto_funcionarias');
const REGISTROS_COL = collection(db, 'ponto_registros');

// ── Usuário / papel ───────────────────────────────────────────────

export function subscribeUsuario(
  uid: string,
  cb: (usuario: UsuarioPonto | null) => void,
): () => void {
  return onSnapshot(doc(db, 'ponto_usuarios', uid), (snap) => {
    if (snap.exists()) {
      cb({ uid, ...(snap.data() as Omit<UsuarioPonto, 'uid'>) });
    } else {
      cb(null);
    }
  });
}

export async function getUsuario(uid: string): Promise<UsuarioPonto | null> {
  const snap = await getDoc(doc(db, 'ponto_usuarios', uid));
  if (!snap.exists()) return null;
  return { uid, ...(snap.data() as Omit<UsuarioPonto, 'uid'>) };
}

// ── Funcionárias ──────────────────────────────────────────────────

export function subscribeFuncionarias(
  cb: (funcionarias: Funcionaria[]) => void,
): () => void {
  const q = query(FUNCIONARIAS_COL, orderBy('nome'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Funcionaria)));
  });
}

export async function getFuncionaria(id: string): Promise<Funcionaria | null> {
  const snap = await getDoc(doc(db, 'ponto_funcionarias', id));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as Funcionaria;
}

export async function saveFuncionaria(funcionaria: Funcionaria): Promise<void> {
  const { id, ...rest } = funcionaria;
  await setDoc(doc(db, 'ponto_funcionarias', id), {
    ...rest,
    atualizadoEm: serverTimestamp(),
  });
}

/**
 * Cria o login (Firebase Auth) da funcionária usando uma instância secundária
 * do app, para não deslogar o admin que está fazendo o cadastro. Grava também
 * o doc de papel em ponto_usuarios e o cadastro em ponto_funcionarias.
 *
 * A conta nasce com uma senha aleatória que nem o admin nem a funcionária
 * chegam a usar: em seguida enviamos o e-mail de "criar sua senha" (mesmo
 * link do "esqueci a senha") para ela escolher a própria senha no primeiro
 * acesso. Retorna o uid criado.
 */
export async function criarContaFuncionaria(params: {
  nome: string;
  email: string;
  local: LocalTrabalho;
  jornadaPorDia?: JornadaPorDia;
}): Promise<string> {
  const secundario = initializeApp(firebaseConfigValues, `ponto-secundario-${Date.now()}`);
  try {
    const authSec = getAuth(secundario);
    const senhaTemporaria = crypto.randomUUID();
    const cred = await createUserWithEmailAndPassword(authSec, params.email, senhaTemporaria);
    const uid = cred.user.uid;

    const funcionaria: Funcionaria = {
      id: uid,
      nome: params.nome,
      email: params.email,
      local: params.local,
      jornadaPorDia: params.jornadaPorDia,
      jornadaSemanalHoras: params.jornadaPorDia?.reduce((acc, h) => acc + h, 0),
      ativo: true,
      criadoEm: Date.now(),
    };
    await saveFuncionaria(funcionaria);
    await setDoc(doc(db, 'ponto_usuarios', uid), {
      papel: 'funcionaria',
      nome: params.nome,
      funcionariaId: uid,
    });

    await signOut(authSec);
    await enviarLinkDeSenha(params.email);
    return uid;
  } finally {
    await deleteApp(secundario).catch(() => {});
  }
}

/**
 * Exclui a funcionária por completo (conta de login + perfil + cadastro),
 * via rota de servidor que usa o Admin SDK. Os registros de ponto dela
 * continuam guardados como histórico.
 */
export async function excluirFuncionaria(id: string): Promise<void> {
  const idToken = await pontoAuth.currentUser?.getIdToken();
  if (!idToken) throw new Error('Não autenticado');

  const resp = await fetch('/api/ponto/excluir-funcionaria', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ funcionariaId: id }),
  });
  if (!resp.ok) {
    const dados = await resp.json().catch(() => ({}));
    throw new Error(dados.erro ?? 'Não foi possível excluir a funcionária.');
  }
}

// ── Registros de ponto ────────────────────────────────────────────

export function subscribeRegistros(
  cb: (registros: RegistroPonto[]) => void,
  funcionariaId?: string,
): () => void {
  const q = funcionariaId
    ? query(
        REGISTROS_COL,
        where('funcionariaId', '==', funcionariaId),
        orderBy('timestamp', 'desc'),
      )
    : query(REGISTROS_COL, orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ ...d.data(), id: d.id } as RegistroPonto)));
  });
}

export async function saveRegistro(registro: RegistroPonto): Promise<void> {
  const { id, ...rest } = registro;
  // Remove campos undefined (Firestore não aceita)
  const limpo = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined),
  );
  await setDoc(doc(db, 'ponto_registros', id), {
    ...limpo,
    atualizadoEm: serverTimestamp(),
  });
}

export async function deleteRegistro(id: string): Promise<void> {
  await deleteDoc(doc(db, 'ponto_registros', id));
}

// ── Selfie (Firebase Storage) ─────────────────────────────────────

/**
 * Faz upload de uma selfie (dataURL JPEG base64) para o Storage e devolve a URL pública.
 */
export async function uploadSelfie(
  funcionariaId: string,
  registroId: string,
  dataUrl: string,
): Promise<string> {
  const caminho = `ponto/selfies/${funcionariaId}/${registroId}.jpg`;
  const storageRef = ref(getStorageLazy(), caminho);
  await uploadString(storageRef, dataUrl, 'data_url');
  return getDownloadURL(storageRef);
}
