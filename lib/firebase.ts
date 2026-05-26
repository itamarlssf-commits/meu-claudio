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
import type { AppData } from '@/types/paciente';
import type { ReformaData } from '@/types/reforma';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const DOC_REF = doc(db, 'consultorio', 'principal');
export const REFORMA_REF = doc(db, 'consultorio', 'reforma');

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

export async function saveReforma(data: ReformaData, userEmail: string): Promise<void> {
  await setDoc(REFORMA_REF, {
    payload: data,
    updatedAt: serverTimestamp(),
    updatedBy: userEmail,
  });
}
