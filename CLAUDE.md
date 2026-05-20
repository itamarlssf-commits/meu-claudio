# CLAUDE.md — Projeto: Boletim Semanal OB/GYN

## Contexto do projeto

Este repositório pertence a um ginecologista e obstetra que produz um **boletim semanal de atualização científica** com dupla finalidade:
1. Atualização clínica pessoal para revisão de protocolos
2. Conteúdo acessível para pacientes e Instagram

## Tarefa principal recorrente: Boletim Semanal

**Quando chamado para produzir o boletim** (toda sexta-feira, ou quando solicitado), execute as seguintes etapas:

### 1. Busca de publicações (últimos 7 dias)

Varrer obrigatoriamente:
- **Guidelines:** ACOG (acog.org/clinical), SMFM (publications.smfm.org), RCOG (rcog.org.uk/guidance), FIGO (figo.org), ISUOG (isuog.org/clinical-resources), NICE (nice.org.uk), SOGC (jogc.com)
- **Periódicos:** Green Journal (journals.lww.com/greenjournal), AJOG (ajog.org), AJOG MFM, BJOG (obgyn.onlinelibrary.wiley.com), Human Reproduction (academic.oup.com/humrep), Fertility & Sterility (fertstert.org), UOG (obgyn.onlinelibrary.wiley.com/journal/14690705), Gynecologic Oncology (sciencedirect.com/journal/gynecologic-oncology), NEJM (nejm.org)

### 2. Estrutura obrigatória (ver TEMPLATE completo em boletim-semanal/TEMPLATE.md)

```
BLOCO A — CLÍNICO
  1. DESTAQUE DA SEMANA         (1 item mais relevante)
  2. DIRETRIZES & PROTOCOLOS    (guidelines novas/atualizadas)
  3. MEDICINA MATERNO-FETAL     (USG, rastreamentos, complicações)
  4. ONCOLOGIA GINECOLÓGICA     (cânceres ginecológicos)
  5. REPRODUÇÃO & ENDOCRINOLOGIA
  6. EM RADAR                   (tabela de estudos relevantes)

BLOCO B — PARA PACIENTES
  7. PARA A CONSULTA            (linguagem acessível)
  8. SUGESTÃO DE POST/STORIES   (caption pronta + hashtags)
```

### 3. Salvar e publicar

- Salvar a edição em: `boletim-semanal/edicoes/edicao-NNN-YYYY-MM-DD.md`
- Incrementar o número da edição (verificar última edição na pasta)
- Fazer commit e push para a branch de desenvolvimento
- Criar PR se não existir

### 4. Convenções

- Sempre indicar nível de evidência (A/B/C/GPP)
- Sinalizar quando um achado contradiz guideline vigente — com aviso explícito
- Sinalizar estudos brasileiros/latino-americanos quando existirem
- Não incluir preprints sem aviso explícito
- Posts de Instagram: português, tom acessível, sem jargão médico

## Histórico de edições

| Edição | Data | Destaques principais |
|---|---|---|
| #1 | 20/05/2026 | SMFM #75 NIHF, SMFM #76 Câncer na Gravidez, ACOG CPG #11 Endometriose, ISUOG POCUS, Queda eficiência FIV |

## Estrutura do repositório

```
meu-claudio/
├── CLAUDE.md                        ← este arquivo
├── README.md
├── boletim-semanal/
│   ├── TEMPLATE.md                  ← estrutura padrão de cada edição
│   └── edicoes/
│       ├── edicao-001-2026-05-20.md
│       └── ...
└── Guia da Gestação                 ← recurso existente
```
