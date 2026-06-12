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
import { getStorage } from 'firebase/storage';
import type { AppData } from '@/types/paciente';
import type { Lead } from '@/types/lead';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigValues = firebaseConfig;

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const DOC_REF = doc(db, 'consultorio', 'principal');

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
