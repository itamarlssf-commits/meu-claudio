import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Controle Consultório · Dr. Itamar Santana',
  description: 'Painel de gestão do consultório',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
