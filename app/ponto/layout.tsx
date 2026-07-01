import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Ponto Eletrônico',
  description: 'Registro de jornada de trabalho',
  manifest: '/ponto-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ponto',
  },
  icons: {
    icon: '/ponto-icon.svg',
    apple: '/ponto-icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#1f3a5f',
  width: 'device-width',
  initialScale: 1,
};

// App protegido por login e dependente do Firebase no cliente — não há valor
// em pré-renderizar estaticamente; evita também erro de build sem env vars.
export const dynamic = 'force-dynamic';

export default function PontoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
