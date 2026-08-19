#!/bin/bash
# SessionStart hook — prepara o projeto nas sessões do Claude Code na web.
# Deixa `npm run lint` e `npm run build` prontos para rodar assim que a sessão abre.
set -euo pipefail

# Só roda em ambiente remoto (nuvem). No notebook, o setup local é o seu.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# Idempotente: o npm install é um no-op rápido quando já está tudo instalado.
echo "Instalando dependências (npm install)..."
npm install --no-fund --no-audit

# O Next.js gera next-env.d.ts (fora do Git) — sem ele o TypeScript acusa erro.
# `next build` cria o arquivo; aqui garantimos que exista antes de qualquer typecheck.
if [ ! -f next-env.d.ts ]; then
  echo "Gerando next-env.d.ts..."
  npx --no-install next telemetry disable >/dev/null 2>&1 || true
  cat > next-env.d.ts << 'TYPES'
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
TYPES
fi

echo "Ambiente pronto: npm run lint / npm run build / npm run dev"
