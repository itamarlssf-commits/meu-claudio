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
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import type { AppData } from '@/types/paciente';
import type { Lead } from '@/types/lead';

// Config pública do app web do Firebase. Estes valores NÃO são segredos —
// já são embutidos no bundle do cliente e a segurança é feita pelas Regras do
// Firestore/Storage. Por isso usamos um fallback fixo: se as envs
// NEXT_PUBLIC_FIREBASE_* não estiverem definidas (ex.: ambiente de Preview da
// Vercel sem variáveis), o app continua funcionando em vez de travar na tela
// "Carregando…". As envs, quando presentes, têm prioridade.
const FIREBASE_FALLBACK = {
  apiKey: 'AIzaSyAi0ONd5v_6O4B-HawP9avuC-eqHw1RM7s',
  authDomain: 'financeiro-pacientes.firebaseapp.com',
  projectId: 'financeiro-pacientes',
  storageBucket: 'financeiro-pacientes.firebasestorage.app',
  messagingSenderId: '1014848958468',
  appId: '1:1014848958468:web:c5963e5db6bdcb6c1d0551',
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FIREBASE_FALLBACK.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FIREBASE_FALLBACK.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FIREBASE_FALLBACK.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FIREBASE_FALLBACK.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FIREBASE_FALLBACK.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FIREBASE_FALLBACK.appId,
};

export const firebaseConfigValues = firebaseConfig;

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const DOC_REF = doc(db, 'consultorio', 'principal');

// Storage é inicializado sob demanda: getStorage() lança erro no carregamento do
// módulo se o storageBucket não estiver configurado, o que quebraria o app inteiro.
let _storage: FirebaseStorage | null = null;
export function getStorageLazy(): FirebaseStorage {
  if (!_storage) _storage = getStorage(app);
  return _storage;
}

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

// ── Leads collection ───────────────────────────────────────────────

const LEADS_COL = collection(db, 'leads');

export function subscribeLeads(cb: (leads: Lead[]) => void): () => void {
  const q = query(LEADS_COL, orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Lead)));
  });
}

export async function saveLead(lead: Lead, userEmail: string): Promise<void> {
  const { id, ...rest } = lead;
  await setDoc(doc(db, 'leads', id), {
    ...rest,
    updatedAt: serverTimestamp(),
    updatedBy: userEmail,
  });
}

export async function deleteLead(id: string): Promise<void> {
  await deleteDoc(doc(db, 'leads', id));
}
