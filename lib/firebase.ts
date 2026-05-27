import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import type { AppData } from '@/types/paciente';
import type { ReformaData } from '@/types/reforma';

// Projeto Firebase das pacientes (acesso restrito por senha)
const pacientesConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Projeto Firebase da reforma (acesso público, compartilhado por link)
const reformaConfig = {
  apiKey: process.env.NEXT_PUBLIC_REFORMA_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_REFORMA_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_REFORMA_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_REFORMA_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_REFORMA_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_REFORMA_FIREBASE_APP_ID,
};

const pacientesApp = getApps().find((a) => a.name === 'pacientes') ?? initializeApp(pacientesConfig, 'pacientes');
const reformaApp   = getApps().find((a) => a.name === 'reforma')   ?? initializeApp(reformaConfig,   'reforma');

export const auth    = getAuth(pacientesApp);
export const db      = getFirestore(pacientesApp);
export const DOC_REF = doc(db, 'consultorio', 'principal');

const reformaDb      = getFirestore(reformaApp);
const reformaStorage = getStorage(reformaApp);
export const REFORMA_REF = doc(reformaDb, 'consultorio', 'reforma');

export async function signIn(email: string, senha: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, senha);
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeData(cb: (data: AppData | null) => void): () => void {
  return onSnapshot(DOC_REF, (snap) => {
    if (snap.exists()) {
      const d = snap.data();
      cb((d?.payload as AppData) ?? null);
    } else {
      cb(null);
    }
  });
}

export async function saveData(data: AppData, userEmail: string): Promise<void> {
  await setDoc(DOC_REF, {
    payload: data,
    updatedAt: serverTimestamp(),
    updatedBy: userEmail,
  });
}

export function subscribeReforma(cb: (data: ReformaData | null) => void): () => void {
  return onSnapshot(REFORMA_REF, (snap) => {
    if (snap.exists()) {
      cb((snap.data()?.payload as ReformaData) ?? null);
    } else {
      cb(null);
    }
  });
}

export async function saveReforma(data: ReformaData): Promise<void> {
  await setDoc(REFORMA_REF, {
    payload: data,
    updatedAt: serverTimestamp(),
  });
}

export async function uploadContrato(gastoId: string, file: File): Promise<string> {
  const path = `reforma/contratos/${gastoId}/${file.name}`;
  const ref = storageRef(reformaStorage, path);
  await uploadBytes(ref, file);
  return getDownloadURL(ref);
}

export async function uploadComprovante(gastoId: string, parcelaId: string, file: File): Promise<string> {
  const path = `reforma/comprovantes/${gastoId}/${parcelaId}/${file.name}`;
  const ref = storageRef(reformaStorage, path);
  await uploadBytes(ref, file);
  return getDownloadURL(ref);
}
