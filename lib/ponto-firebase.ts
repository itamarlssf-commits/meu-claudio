// Camada de acesso a dados do módulo de Ponto Eletrônico.
// Reaproveita a instância Firebase de lib/firebase.ts e usa coleções isoladas (prefixo "ponto_").

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
import { db, storage, firebaseConfigValues } from '@/lib/firebase';
import type { Funcionaria, RegistroPonto, UsuarioPonto } from '@/types/ponto';

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
 * Retorna o uid criado.
 */
export async function criarContaFuncionaria(params: {
  nome: string;
  email: string;
  senha: string;
  local: string;
  jornadaHoras?: number;
}): Promise<string> {
  const secundario = initializeApp(firebaseConfigValues, `ponto-secundario-${Date.now()}`);
  try {
    const authSec = getAuth(secundario);
    const cred = await createUserWithEmailAndPassword(authSec, params.email, params.senha);
    const uid = cred.user.uid;

    const funcionaria: Funcionaria = {
      id: uid,
      nome: params.nome,
      email: params.email,
      local: params.local,
      jornadaHoras: params.jornadaHoras,
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
    return uid;
  } finally {
    await deleteApp(secundario).catch(() => {});
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
  const storageRef = ref(storage, caminho);
  await uploadString(storageRef, dataUrl, 'data_url');
  return getDownloadURL(storageRef);
}
