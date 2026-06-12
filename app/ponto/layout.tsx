import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ponto Eletrônico',
  description: 'Registro de jornada de trabalho',
};

// App protegido por login e dependente do Firebase no cliente — não há valor
// em pré-renderizar estaticamente; evita também erro de build sem env vars.
export const dynamic = 'force-dynamic';

export default function PontoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
