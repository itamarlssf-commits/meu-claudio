import type { Metadata, Viewport } from 'next';
import SwRegister from './sw-register';

// Metadados específicos do app de plantão (sobrescrevem os do layout raiz).
// O <link rel="manifest"> só aparece em /plantao, então apenas este app é
// instalável — o painel do consultório segue como site normal.
export const metadata: Metadata = {
  title: 'Plantão Obstétrico',
  description:
    'Ferramentas de bolso para o plantão obstétrico — IG/DPP, peso fetal, Doppler e estadiamento de RCF. Funciona offline.',
  applicationName: 'Plantão Obstétrico',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Plantão',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0E4B5A',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function PlantaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SwRegister />
    </>
  );
}
