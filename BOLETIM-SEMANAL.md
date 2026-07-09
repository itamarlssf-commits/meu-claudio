# Boletim Semanal OB/GYN — mudou de repositório

Este repositório (`meu-claudio`) é o **CRM do consultório** (pacientes, agenda, ponto eletrônico). O boletim científico semanal de Ginecologia & Obstetrícia **nunca deveria ter sido escrito aqui** — foi um efeito colateral de gatilho(s) duplicado(s) na aba **Triggers** do Claude Code on the web, que dispararam o mesmo prompt de configuração repetidas vezes, ora contra este repositório, ora contra `itamar-marketing-os`.

## Local canônico

**`itamar-marketing-os` → `Semanais/README.md`** (índice) e `Semanais/edicoes/*.md` (edições).

## PRs órfãos neste repositório (superados, recomenda-se fechar)

Nenhum foi mesclado. Todos recriam a mesma estrutura do zero, em pastas/formatos diferentes, sem se referenciar entre si:

| PR | Título | Pasta usada |
|---|---|---|
| #1 | boletim semanal OB/GYN — estrutura + edição #1 | `boletim-semanal/` |
| #7 | weekly scientific bulletin GO Insights — Edição 001 | raiz (HTML avulso) |
| #11 | boletim semanal GO — estrutura + edição #001 | `boletins/` |
| #13 | Boletim Médico Semanal — OB/GYN (Edição 001) | `boletins-medicos/` |
| #14 | consolidar boletim médico semanal — edição 002 | `boletins-medicos/` |
| #15 | Boletim semanal GO 28.05.26 + roteiros de Reels | raiz (HTML avulso) |

Nenhum tem conteúdo que não esteja, de forma mais completa, no local canônico acima.

## Ação pendente (fora deste repositório)

O agendamento do gatilho semanal vive na aba **Triggers** do Claude Code on the web, não em nenhum repositório. Enquanto não for corrigido manualmente lá — mantendo **um único gatilho**, sexta-feira 8h, apontando para `itamar-marketing-os` — cada disparo novo continuará gerando uma sessão isolada que recria esta mesma confusão. Detalhes da recomendação completa em `itamar-marketing-os/Semanais/README.md` §4 e §7.
