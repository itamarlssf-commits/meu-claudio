'use client';

import { useState } from 'react';
import { CENAS, buscarCena } from '@/lib/educacao/registry';
import CenaPlayer from '@/components/educacao/CenaPlayer';
import { Card, SectionHeader, Chip } from '@/components/ui';
import { TOKENS } from '@/lib/tokens';

export default function EducacaoView() {
  const [cenaId, setCenaId] = useState<string | null>(null);
  const cena = cenaId ? buscarCena(cenaId) : undefined;

  if (cena) {
    return <CenaPlayer cena={cena} onVoltar={() => setCenaId(null)} />;
  }

  return (
    <div style={{ padding: '28px 32px 40px' }}>
      <SectionHeader
        title="Educação"
        subtitle="Explicações visuais para mostrar à paciente durante a consulta"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {CENAS.map((c) => (
          <Card key={c.id} clickable padding={0}>
            <button
              onClick={() => setCenaId(c.id)}
              style={{
                display: 'block',
                width: '100%',
                background: 'none',
                border: 'none',
                padding: 20,
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#fef9ec',
                  border: `1px solid #fde68a`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: TOKENS.accent,
                  marginBottom: 14,
                }}
              >
                {c.icone}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TOKENS.primary, marginBottom: 4 }}>
                {c.titulo}
              </div>
              <div style={{ fontSize: 12, color: TOKENS.muted, lineHeight: 1.5, marginBottom: 12 }}>
                {c.subtitulo}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.modo === 'timeline' && (
                  <Chip color="blue" size="xs">{`${c.etapas?.length ?? 0} etapas`}</Chip>
                )}
                {c.camadas && c.camadas.length > 0 && (
                  <Chip color="purple" size="xs">{`${c.camadas.length} camadas`}</Chip>
                )}
              </div>
            </button>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 24, fontSize: 11.5, color: TOKENS.muted, lineHeight: 1.6, maxWidth: 620 }}>
        As ilustrações são esquemáticas e servem de apoio à explicação clínica. Use o botão
        <strong style={{ color: TOKENS.ink2 }}> Modo apresentação </strong>
        para abrir em tela cheia sem expor os dados do consultório.
      </div>
    </div>
  );
}
