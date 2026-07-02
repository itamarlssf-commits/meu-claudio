// Firebase Admin SDK — usado SOMENTE em rotas de servidor (ex.: cron do
// relatório mensal). Nunca importar isto em código de cliente.
//
// Credenciais: gere em Firebase Console → Configurações do projeto →
// Contas de serviço → Gerar nova chave privada, no projeto "Ponto-eletronico".
// Copie os 3 valores do JSON gerado para o .env.local / Vercel:
//   PONTO_FIREBASE_ADMIN_PROJECT_ID   (campo "project_id")
//   PONTO_FIREBASE_ADMIN_CLIENT_EMAIL (campo "client_email")
//   PONTO_FIREBASE_ADMIN_PRIVATE_KEY  (campo "private_key", com as \n)
// Essas variáveis NÃO têm o prefixo NEXT_PUBLIC_ — ficam só no servidor.

import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const ADMIN_APP_NAME = 'ponto-admin';

function criarAdminApp(): App {
  const projectId = process.env.PONTO_FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.PONTO_FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.PONTO_FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Credenciais do Firebase Admin ausentes. Preencha PONTO_FIREBASE_ADMIN_PROJECT_ID, ' +
        'PONTO_FIREBASE_ADMIN_CLIENT_EMAIL e PONTO_FIREBASE_ADMIN_PRIVATE_KEY (ver lib/firebase-admin.ts).',
    );
  }

  return initializeApp(
    { credential: cert({ projectId, clientEmail, privateKey }) },
    ADMIN_APP_NAME,
  );
}

export function getPontoAdminApp(): App {
  return getApps().find((a) => a.name === ADMIN_APP_NAME) ?? criarAdminApp();
}

export function getPontoAdminDb() {
  return getFirestore(getPontoAdminApp());
}

export function getPontoAdminAuth() {
  return getAuth(getPontoAdminApp());
}
