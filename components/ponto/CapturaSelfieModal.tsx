'use client';

import { useEffect, useRef, useState } from 'react';
import { TOKENS } from '@/lib/tokens';
import { Btn } from '@/components/ui';

// Guia oval mostrado na tela (px) — usado tanto pro overlay visual quanto
// pra recortar a foto final, então só o rosto (e não o fundo do ambiente)
// fica salvo.
const GUIA_LARGURA = 260;
const GUIA_ALTURA = 330;

interface CapturaSelfieModalProps {
  onCapturar: (file: File) => void;
  onCancelar: () => void;
}

export default function CapturaSelfieModal({ onCapturar, onCancelar }: CapturaSelfieModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [erro, setErro] = useState('');
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let ativo = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        if (!ativo) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setPronto(true);
        }
      })
      .catch(() => setErro('Não foi possível abrir a câmera. Verifique a permissão do navegador.'));

    return () => {
      ativo = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function fecharStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function capturar() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const container = video.parentElement;
    const cw = container?.clientWidth ?? video.clientWidth;
    const ch = container?.clientHeight ?? video.clientHeight;
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Mapeia o guia (em px de tela, sobre um vídeo em object-fit: cover)
    // para a região correspondente no frame nativo do vídeo.
    const escala = Math.max(cw / vw, ch / vh);
    const guiaVideoW = GUIA_LARGURA / escala;
    const guiaVideoH = GUIA_ALTURA / escala;
    const srcX = vw / 2 - guiaVideoW / 2;
    const srcY = vh / 2 - guiaVideoH / 2;

    const outW = 360;
    const outH = Math.round((outW * GUIA_ALTURA) / GUIA_LARGURA);
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fundo sólido primeiro, depois só o recorte oval do vídeo por cima —
    // assim o que estiver atrás da pessoa não aparece na foto salva.
    ctx.fillStyle = TOKENS.bg;
    ctx.fillRect(0, 0, outW, outH);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(outW / 2, outH / 2, outW / 2, outH / 2, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(video, srcX, srcY, guiaVideoW, guiaVideoH, 0, 0, outW, outH);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        fecharStream();
        onCapturar(new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.85,
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {erro ? (
          <div style={{ color: '#fff', textAlign: 'center', padding: 24, fontSize: 14 }}>
            <div style={{ marginBottom: 16 }}>{erro}</div>
            <label
              style={{
                display: 'inline-block',
                background: TOKENS.accent,
                color: '#1a1f2e',
                borderRadius: 10,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Usar câmera do aparelho
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onCapturar(file);
                }}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
              }}
            />
            {pronto && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: GUIA_LARGURA,
                  height: GUIA_ALTURA,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  border: '3px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                  pointerEvents: 'none',
                }}
              />
            )}
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 0,
                right: 0,
                textAlign: 'center',
                color: '#fff',
                fontSize: 12,
                padding: '0 24px',
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              }}
            >
              Encaixe o rosto no oval. Só essa área fica salva — confirma que foi você quem
              bateu o ponto, sem reconhecimento facial.
            </div>
          </>
        )}
      </div>

      <div
        style={{
          padding: 20,
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          background: '#111',
        }}
      >
        <Btn variant="ghost" size="lg" onClick={() => { fecharStream(); onCancelar(); }}>
          Cancelar
        </Btn>
        {!erro && (
          <Btn variant="primary" size="lg" disabled={!pronto} onClick={capturar}>
            📸 Capturar
          </Btn>
        )}
      </div>
    </div>
  );
}
