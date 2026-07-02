import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  writeBatch,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { AppData, Paciente } from '@/types/paciente';

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

// Cache persistente (IndexedDB): edições feitas offline ficam guardadas no
// dispositivo e sincronizam sozinhas quando a conexão volta — nada se perde,
// mesmo fechando o navegador. Multi-tab permite médico e secretária com
// várias abas abertas sem conflito.
let _db: Firestore;
try {
  _db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
} catch {
  // Fast Refresh / já inicializado
  _db = getFirestore(app);
}
export const db = _db;

// Um documento POR PACIENTE. Salvar a paciente A nunca toca na paciente B —
// duas pessoas editando ao mesmo tempo não sobrescrevem o trabalho uma da outra.
const PACIENTES_COL = collection(db, 'pacientes');

// Documento antigo (banco inteiro em um blob) — mantido só para migração/leitura.
const LEGACY_DOC = doc(db, 'consultorio', 'principal');

export async function signIn(email: string, senha: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, senha);
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export interface SnapshotMeta {
  fromCache: boolean;
  hasPendingWrites: boolean;
  empty: boolean;
}

export function subscribePacientes(
  cb: (pacientes: Paciente[], meta: SnapshotMeta) => void,
  onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    PACIENTES_COL,
    { includeMetadataChanges: true },
    (snap) => {
      const pacientes = snap.docs.map((d) => {
        const { _updatedAt, _updatedBy, ...rest } = d.data() as Paciente & {
          _updatedAt?: unknown;
          _updatedBy?: string;
        };
        return rest as Paciente;
      });
      cb(pacientes, {
        fromCache: snap.metadata.fromCache,
        hasPendingWrites: snap.metadata.hasPendingWrites,
        empty: snap.empty,
      });
    },
    (err) => onError?.(err as Error),
  );
}

const BATCH_LIMIT = 400; // limite do Firestore é 500 ops por batch

export async function savePacientes(
  changed: Paciente[],
  deleted: string[],
  userEmail: string,
): Promise<void> {
  type Op = { kind: 'set'; p: Paciente } | { kind: 'del'; id: string };
  const ops: Op[] = [
    ...changed.map((p) => ({ kind: 'set' as const, p })),
    ...deleted.map((id) => ({ kind: 'del' as const, id })),
  ];
  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const op of ops.slice(i, i + BATCH_LIMIT)) {
      if (op.kind === 'set') {
        batch.set(doc(PACIENTES_COL, op.p.id), {
          ...op.p,
          _updatedAt: serverTimestamp(),
          _updatedBy: userEmail,
        });
      } else {
        batch.delete(doc(PACIENTES_COL, op.id));
      }
    }
    await batch.commit();
  }
}

// Lê o banco no formato antigo (blob único) para migração automática.
export async function fetchLegacyData(): Promise<AppData | null> {
  try {
    const snap = await getDoc(LEGACY_DOC);
    if (snap.exists()) return (snap.data()?.payload as AppData) ?? null;
  } catch {
    /* sem acesso ou inexistente */
  }
  return null;
}

// Backup diário automático: uma foto completa do banco por dia em backups/AAAA-MM-DD.
export async function saveDailyBackup(pacientes: Paciente[]): Promise<void> {
  const key = new Date().toISOString().split('T')[0];
  await setDoc(doc(db, 'backups', key), {
    pacientes,
    total: pacientes.length,
    criadoEm: serverTimestamp(),
  });
}
