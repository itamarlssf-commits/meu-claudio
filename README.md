# meu-claudio

Aplicativo em **Next.js 14 + TypeScript + Tailwind + Firebase** com duas áreas:

- **/** — CRM do consultório (pacientes, agenda, atendimentos, financeiro).
- **/ponto** — **Ponto eletrônico** para registro de jornada das funcionárias.

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie o arquivo de variáveis de ambiente a partir do exemplo:
   ```bash
   cp .env.local.example .env.local
   ```
   e preencha com os dados do seu projeto Firebase (Firebase Console → Configurações do projeto → app web). Esses valores são públicos do Firebase web.
3. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```
   - Consultório: http://localhost:3000
   - Ponto: http://localhost:3000/ponto

> As variáveis `NEXT_PUBLIC_FIREBASE_*` são **opcionais**: o código já traz um *fallback* com a config pública do projeto (`lib/firebase.ts`), então o app funciona em qualquer ambiente da Vercel mesmo sem configurá-las. Para apontar para **outro** projeto Firebase, defina essas variáveis (elas têm prioridade sobre o fallback) em todos os ambientes (Production, Preview e Development).

## Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — checagem do ESLint

## Ponto eletrônico (`/ponto`)

Ferramenta de controle interno (sem certificação legal / Portaria 671).

- **Funcionária:** login → registra **Entrada / Saída para intervalo / Volta do intervalo / Saída**, com **selfie** (câmera) e **GPS**. Vê o histórico mensal com total de horas (o intervalo é descontado automaticamente).
- **Empregador (admin):** cadastra funcionárias (cria o login de cada uma), corrige registros e gera relatório mensal de horas.

### Perfis de acesso
- Quem loga com um e-mail listado em `NEXT_PUBLIC_PONTO_ADMIN_EMAILS` entra como **admin**.
- As demais contas são **funcionárias** (perfil em `ponto_usuarios/{uid}`), criadas pelo admin.

### Coleções Firestore
- `ponto_funcionarias` — cadastro das funcionárias
- `ponto_registros` — batidas de ponto
- `ponto_usuarios` — perfil/papel de cada usuário

As selfies são salvas no **Firebase Storage** (`ponto/selfies/...`). É necessário habilitar o Storage no projeto; sem ele, use a opção **"registrar sem foto"**.

### Regras de segurança
Os arquivos `firestore.rules` e `storage.rules` restringem cada funcionária aos próprios dados e o CRM ao administrador. Publique-os (ajustando o e-mail de admin) com:
```bash
firebase deploy --only firestore:rules,storage
```
