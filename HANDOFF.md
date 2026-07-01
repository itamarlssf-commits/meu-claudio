# 📦 HANDOFF — Contexto completo para continuar em sessão LOCAL

> **Para que serve este arquivo:** você pediu para levar todo o contexto e continuar
> num Claude Code rodando **no seu PC local** (não na nuvem). Este documento tem tudo:
> o que já foi feito, o que falta, os 3 cliques que **só você** consegue fazer, e como
> retomar. Basta clonar a branch, abrir o Claude Code local e dizer: **"leia o HANDOFF.md
> e continue"**.

---

## 1. O que é o projeto

- App **Next.js 14 + TypeScript + Tailwind + Firebase**, repositório `meu-claudio`.
- Rota `/` → **CRM do consultório** (já existia, intacto).
- Rota `/ponto` → **Ponto Eletrônico** (o que construímos): funcionária bate ponto com
  **selfie obrigatória + GPS**; empregador (admin) administra e vê relatórios.

## 2. Decisões já combinadas (não precisa rediscutir)

1. ✅ O ponto usa um **projeto Firebase SEPARADO** do CRM (não misturar os dados).
2. ✅ **Selfie é obrigatória** — não dá para registrar ponto sem foto.
3. ✅ Foto passa por **detecção de rosto** leve no navegador (confirma que há um rosto;
   **não** é biometria / não identifica quem é a pessoa).
4. ✅ Mantido o **visual atual do código** (não o do Claude Design).
5. ⏳ **Fase 2 (a fazer):** relatório mensal por funcionária, enviado por e-mail no fim do
   mês, em **PDF + planilha (CSV)**. Serviço de e-mail recomendado: **Resend**.

## 3. Status atual

- **Fase 1 = COMPLETA e no ar** (build + lint passam). Está na branch
  `claude/inspiring-mccarthy-muc3jr`, PR **#12** (rascunho), preview da Vercel "Ready".
- Preview: `https://meu-claudio-git-claude-inspiri-3b94ab-itamar-santana-s-projects.vercel.app/ponto`
- PR: https://github.com/itamarlssf-commits/meu-claudio/pull/12

Enquanto você não criar o projeto Firebase dedicado, o ponto **funciona com fallback** no
Firebase do CRM (não quebra). Assim que preencher as variáveis, ele passa a usar o projeto
separado automaticamente.

---

## 4. 🔑 O que SÓ VOCÊ pode fazer (3 cliques — exige seu login Google)

Nenhum assistente (nem local nem nuvem) faz isso por você, porque abre **logado na sua
conta Google** e o Claude não deve ter sua senha. Leva ~5 min:

1. **Criar projeto Firebase** em https://console.firebase.google.com → "Adicionar projeto"
   → nome sugerido `ponto-eletronico`.
2. **Ativar 3 serviços** (o assistente ✨ **Gemini dentro do Firebase** te guia — cole o
   prompt da seção 7):
   - **Authentication** → método **E-mail/senha**.
   - **Firestore Database** → modo produção → região **`southamerica-east1`**.
   - **Storage** → mesma região.
3. **Registrar um App Web** (ícone `</>`) → o Firebase mostra **6 valores de config**.
   Copie-os (não são segredo, vão no navegador mesmo).
4. Em **Authentication → Users**, crie **1 usuário admin** (email + senha). ⚠️ **A senha do
   admin é SÓ SUA — nunca cole a senha no chat com o assistente.**

## 5. Onde colar os 6 valores

### Local (`.env.local` na raiz do projeto — copie de `.env.example`):
```
NEXT_PUBLIC_PONTO_FIREBASE_API_KEY=...
NEXT_PUBLIC_PONTO_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_PONTO_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_PONTO_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_PONTO_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_PONTO_FIREBASE_APP_ID=...
```
### Produção (Vercel → Project → Settings → Environment Variables): as mesmas 6 variáveis.

---

## 6. Como retomar no PC LOCAL

```bash
git clone https://github.com/itamarlssf-commits/meu-claudio.git
cd meu-claudio
git checkout claude/inspiring-mccarthy-muc3jr
npm install
cp .env.example .env.local     # preencha os NEXT_PUBLIC_PONTO_FIREBASE_* da seção 5
npm run dev                     # abre http://localhost:3000/ponto
# verificação:
npm run build && npm run lint
```
Depois, abra o **Claude Code no seu PC**, na pasta do projeto, e diga:
> "Leia o HANDOFF.md e continue de onde paramos."

Se no local você tiver um MCP de navegador (Chrome DevTools / Playwright), o assistente pode
**ajudar a dirigir** um Chrome que **você** já deixou logado na sua conta Google — mas o
login continua sendo seu.

---

## 7. Prompt pronto para o Gemini-no-Firebase (✨ no console)

Cole isto no assistente Gemini dentro do console do Firebase:

> Estou montando um app de ponto eletrônico. Neste projeto, por favor me guie para:
> 1) Ativar Authentication com provedor E-mail/senha;
> 2) Criar o Firestore Database em modo produção na região southamerica-east1;
> 3) Ativar o Storage na mesma região;
> 4) Registrar um App Web e me mostrar os 6 valores de configuração (apiKey, authDomain,
>    projectId, storageBucket, messagingSenderId, appId);
> 5) Escrever regras de segurança do Firestore e do Storage onde: um usuário admin lê/escreve
>    tudo; cada funcionária lê/escreve apenas os próprios registros (coleções: ponto_funcionarias,
>    ponto_registros, ponto_usuarios). Me explique cada passo com cliques.

---

## 8. Mapa dos arquivos da Fase 1 (já prontos)

| Arquivo | Papel |
|---|---|
| `lib/ponto-firebase-app.ts` | Instância Firebase **dedicada** do ponto (lê `NEXT_PUBLIC_PONTO_FIREBASE_*`, com fallback no CRM). Exporta `pontoAuth`, `pontoDb`, `getPontoStorageLazy`, `signInPonto`, `signOutPonto`. |
| `lib/face-check.ts` | Detecção de rosto no cliente (`@vladmandic/face-api`, `tinyFaceDetector`). Nunca lança erro; retorna `{temRosto, verificado}`. |
| `lib/ponto-firebase.ts` | Acesso Firestore/Storage do ponto (coleções `ponto_*`), agora apontando para o app dedicado. |
| `lib/ponto-logic.ts` | Pareia entrada/saída, calcula horas do dia/mês. |
| `types/ponto.ts` | Tipos `Funcionaria`, `RegistroPonto`, etc. |
| `store/use-ponto-store.ts` | Store Zustand isolado do ponto. |
| `hooks/usePontoAuth.ts` / `usePontoSync.ts` / `useBaterPonto.ts` | Auth, sincronização e ação de bater ponto (selfie + GPS). |
| `components/ponto/PontoLogin.tsx` | Tela de login e-mail/senha. |
| `components/ponto/BaterPontoView.tsx` | Tela da funcionária: botão Entrada/Saída, **selfie obrigatória** + detecção de rosto. |
| `components/ponto/AdminView.tsx` | Painel do empregador (funcionárias, registros, relatório). |
| `components/ponto/HistoricoView.tsx` | Histórico e total de horas da própria funcionária. |
| `app/ponto/page.tsx` / `layout.tsx` | Entrypoint e metadata do ponto. |
| `.env.example` | Documenta os 2 grupos de env (CRM + ponto). |

---

## 9. 🚧 Fase 2 — o que falta implementar (relatório mensal por e-mail)

Objetivo: no fim de cada mês, enviar por e-mail um **relatório por funcionária** em **PDF +
CSV** com as horas trabalhadas.

**Plano técnico proposto:**
- **Resend** para envio de e-mail (criar conta em resend.com, gerar API key → guardar em
  `RESEND_API_KEY` no `.env.local`/Vercel; verificar um domínio ou usar o remetente de teste).
- **Vercel Cron** para disparar no fim do mês (ex.: `0 9 28-31 * *` + checagem de "último dia").
- **Geração de arquivos:** CSV montado a partir de `lib/ponto-logic.ts`; PDF com uma lib leve
  (ex.: `pdf-lib` ou `@react-pdf/renderer`) no route handler.
- **Rota:** `app/api/relatorio-mensal/route.ts` (server) — lê `ponto_registros` do mês, agrega
  por funcionária, gera PDF+CSV e envia via Resend para o e-mail do empregador
  (`itamarlssf@gmail.com`) e/ou de cada funcionária.

**Decisões pendentes com o usuário antes de codar a Fase 2:**
- Confirmar **Resend** como serviço (ou preferência por outro).
- Para quem vai o relatório: só para o empregador, ou também para cada funcionária?
- Um PDF/CSV por funcionária, ou um consolidado com todas?

---

## 10. Regras operacionais desta branch (para o assistente)

- Trabalhar **somente** na branch `claude/inspiring-mccarthy-muc3jr`; nunca fazer push em
  outra branch sem permissão; após push, manter/abrir **PR em rascunho**.
- `git push -u origin claude/inspiring-mccarthy-muc3jr`; em erro de rede, retry com backoff.
- Repositório: `itamarlssf-commits/meu-claudio`.
- Os 6 valores do Firebase web **não são segredo** (vão no cliente). A **senha do admin é do
  usuário** e nunca deve ser enviada ao assistente.

---

_Resumo de uma linha: código da Fase 1 pronto e no ar; falta você fazer os 3 cliques no
Firebase (seção 4) e preencher as 6 variáveis (seção 5); depois seguimos para a Fase 2
(relatório PDF+CSV por e-mail via Resend)._
