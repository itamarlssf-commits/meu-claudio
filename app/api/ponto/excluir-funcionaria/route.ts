import { NextResponse } from 'next/server';
import { getPontoAdminAuth, getPontoAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// Exclui uma funcionária por completo: conta de login (Firebase Auth) +
// perfil (ponto_usuarios) + cadastro (ponto_funcionarias). Os registros de
// ponto (ponto_registros) ficam guardados como histórico/respaldo.
export async function POST(request: Request) {
  const idToken = (request.headers.get('authorization') ?? '').replace('Bearer ', '');
  if (!idToken) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  const auth = getPontoAdminAuth();
  const db = getPontoAdminDb();

  let uidChamador: string;
  try {
    uidChamador = (await auth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ erro: 'Token inválido' }, { status: 401 });
  }

  const perfilChamador = await db.collection('ponto_usuarios').doc(uidChamador).get();
  if (perfilChamador.data()?.papel !== 'admin') {
    return NextResponse.json(
      { erro: 'Apenas administradores podem excluir funcionárias' },
      { status: 403 },
    );
  }

  const { funcionariaId } = await request.json();
  if (!funcionariaId || typeof funcionariaId !== 'string') {
    return NextResponse.json({ erro: 'funcionariaId ausente' }, { status: 400 });
  }

  await Promise.all([
    db.collection('ponto_funcionarias').doc(funcionariaId).delete(),
    db.collection('ponto_usuarios').doc(funcionariaId).delete(),
    auth.deleteUser(funcionariaId).catch(() => {}),
  ]);

  return NextResponse.json({ ok: true });
}
