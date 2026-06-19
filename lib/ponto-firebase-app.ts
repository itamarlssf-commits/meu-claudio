// Instância Firebase DEDICADA ao módulo de Ponto Eletrônico.
//
// O ponto NÃO compartilha mais o projeto Firebase do CRM. Ele usa uma instância
// própria (`initializeApp(config, 'ponto')`) configurada pelas variáveis de
// ambiente NEXT_PUBLIC_PONTO_FIREBASE_*. Assim os dados, a autenticação e o
// armazenamento das selfies ficam num projeto Firebase separado.
//
// Enquanto o projeto dedicado não estiver configurado (envs ausentes), caímos
// no projeto do CRM como fallback para o app não travar em dev/preview. Basta
// preencher as envs na Vercel para o ponto passar a usar o projeto próprio.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfigValues } from '@/lib/firebase';

// Config própria do ponto. Se as envs dedicadas não existirem, reaproveita a do
// CRM (fallback) — útil em dev/preview antes de criar o projeto separado.
const pontoConfig = {
  apiKey: process.env.NEXT_PUBLIC_PONTO_FIREBASE_API_KEY || firebaseConfigValues.apiKey,
  authDomain:
    process.env.NEXT_PUBLIC_PONTO_FIREBASE_AUTH_DOMAIN || firebaseConfigValues.authDomain,
  projectId:
    process.env.NEXT_PUBLIC_PONTO_FIREBASE_PROJECT_ID || firebaseConfigValues.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_PONTO_FIREBASE_STORAGE_BUCKET || firebaseConfigValues.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_PONTO_FIREBASE_MESSAGING_SENDER_ID ||
    firebaseConfigValues.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_PONTO_FIREBASE_APP_ID || firebaseConfigValues.appId,
};

export const pontoConfigValues = pontoConfig;

// `true` quando o ponto está realmente usando um projeto Firebase próprio.
export const usandoProjetoDedicado = Boolean(
  process.env.NEXT_PUBLIC_PONTO_FIREBASE_PROJECT_ID,
);

const PONTO_APP_NAME = 'ponto';

export const pontoApp: FirebaseApp =
  getApps().find((a) => a.name === PONTO_APP_NAME) ??
  initializeApp(pontoConfig, PONTO_APP_NAME);

export const pontoAuth = getAuth(pontoApp);
export const pontoDb = getFirestore(pontoApp);

// Storage inicializado sob demanda (evita erro no load do módulo se o bucket
// não estiver configurado).
let _pontoStorage: FirebaseStorage | null = null;
export function getPontoStorageLazy(): FirebaseStorage {
  if (!_pontoStorage) _pontoStorage = getStorage(pontoApp);
  return _pontoStorage;
}

export async function signInPonto(email: string, senha: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(pontoAuth, email, senha);
  return cred.user;
}

export async function signOutPonto(): Promise<void> {
  await signOut(pontoAuth);
}
