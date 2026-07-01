# Boletins Médicos Semanais — Ginecologia & Obstetrícia

Atualizações semanais baseadas em evidências das principais fontes da especialidade, para (1) apoiar a atualização de protocolos clínicos e (2) alimentar conteúdo para pacientes/Instagram.

> **Este é o local único e oficial do boletim.** Havia 4 tentativas paralelas e divergentes deste mesmo boletim neste repositório (PRs #1, #7, #11, #13), cada uma recriando a estrutura do zero em um local diferente, nenhuma delas mesclada ao `main`. Isso indica que mais de um gatilho (trigger) semanal estava configurado para a mesma tarefa. Ver seção "Consolidação" abaixo.

## Estrutura de cada edição

- **Destaques da semana** — tabela com os achados mais relevantes e nível de impacto
- **Obstetrícia / MFM** — RCF, prematuridade, pré-eclâmpsia, HPP, trabalho de parto
- **Ginecologia** — endometriose (diferencial clínico do consultório), mioma, rastreamento cervical, DIU/LARC
- **Oncologia Ginecológica** — colo, ovário, endométrio, vulva
- **Reprodução Humana** — infertilidade, FIV, anovulação, SOP
- **Menopausa / Saúde da Mulher** — TRH, saúde óssea, cardiovascular, sexual
- **Em radar** — achados menores/emergentes, sem aprofundamento
- **Resumo executivo** — tabela de ações práticas por área
- **Fontes** — links diretos para todos os artigos e diretrizes citados

Cada tópico de destaque traz duas camadas: **camada clínica** (fonte, nível de evidência, implicação prática) e **camada paciente/Instagram** (texto pronto, linguagem acessível).

## Fontes monitoradas

**Diretrizes:** ACOG (Practice Advisory / Committee Statement / Clinical Practice Update), RCOG (Green-top), FIGO, SOGC, NICE, ISUOG, SMFM (Consult Series / Special Statements)
**Periódicos:** NEJM, Obstetrics & Gynecology (Green Journal), AJOG, AJOG MFM, BJOG, Human Reproduction, Fertility & Sterility, Ultrasound in Obstetrics & Gynecology (White Journal), Gynecologic Oncology, J Maternal-Fetal & Neonatal Medicine, Journal of Perinatology, Seminars in Fetal and Neonatal Medicine
**Complementares:** OpenEvidence, UpToDate, PubMed (busca ampla por período)

Critério de seleção: só entra como **destaque** o que muda conduta, é diretriz nova/atualizada de sociedade major, ou é achado de alto impacto potencial. Achados menores vão para "Em radar".

## Frequência e dia do gatilho

**Toda sexta-feira, pela manhã** (recomendação atual — ver justificativa abaixo). Cada edição cobre as publicações da semana anterior (sáb–sex).

### Por que sexta-feira (e não quinta, como tentativas anteriores sugeriram)

- Tentativas anteriores (PR #11, #13) recomendaram **quinta-feira**, alinhado à publicação semanal do NEJM. Mas quinta é dia de consultório/plantão do Dr. Itamar (CLAUDE.md: dias livres = seg e sex) — o boletim chegaria em dia cheio, com baixa chance de leitura e zero chance de virar conteúdo no mesmo dia.
- **Sexta é dia livre.** O boletim publicado na sexta de manhã (a) ainda captura o NEJM de quinta e a maioria dos comunicados de sociedades (que não seguem dia fixo, mas concentram-se em dias úteis), e (b) dá o fim de semana inteiro + a segunda-feira livre para o Dr. Itamar revisar com calma e transformar os achados em Reels/carrossel para a semana seguinte — encaixando na cadência de 3 Reels/semana do plano de conteúdo.
- Conclusão: **sexta > quinta** para este caso de uso específico (uso duplo: protocolo clínico + insumo de conteúdo), mesmo captando o NEJM com 1 dia de folga a mais.

**Ação necessária fora deste repositório:** o agendamento do gatilho semanal é configurado na aba de Triggers do Claude Code on the web, não neste arquivo. Ajustar lá para sexta-feira, e **consolidar em um único trigger apontando para este repositório** (ver "Consolidação").

## Consolidação (o que foi corrigido nesta edição)

Antes desta edição existiam **4 PRs de boletim abertos e nunca mesclados**, cada um recriando a estrutura do zero:

| PR | Local criado | Data |
|----|--------------|------|
| #1 | `boletim-semanal/` | 20 mai 2026 |
| #7 | `boletim-go-001.html` (arquivo único, formato impressão) | 29 mai 2026 |
| #11 | `boletins/` | 18 jun 2026 |
| #13 | `boletins-medicos/` (**adotado como oficial**) | 25 jun 2026 |

Isso só acontece se **mais de um gatilho semanal estiver configurado** (o mesmo prompt aparece duplicado em `itamar-marketing-os/Semanais/` como dois arquivos quase idênticos — "Novidades semanais GO.md" e "Atualizações semanais GO.md" — reforçando a suspeita de triggers duplicados/renomeados ao longo do tempo).

**Ação recomendada:** no painel de Triggers, manter **apenas um** gatilho semanal, apontando para `itamarlssf-commits/meu-claudio`, pasta `boletins-medicos/`, disparando sexta-feira de manhã. Os PRs #1, #7, #11 e #13 foram fechados como duplicados/superados por esta edição — o trabalho de cada um está preservado nas respectivas branches, caso algum formato (ex.: o PDF de impressão do PR #7) valha a pena revisitar como *formato de distribuição* no futuro.

## Arquivo de edições

| Edição | Data | Destaques |
|--------|------|-----------|
| [002](./2026-07-01.md) | 01 jul 2026 | SOGC Guideline #468 (endometriose) · SMFM checklist pré-eclâmpsia/AAS atualizado · ISUOG guideline de ultrassom intraparto · ACOG: morbidade materna grave |
| [001](./2026-06-25.md) | 25 jun 2026 | FDA remove alertas TRH · Autocoleta HPV · RCF diretrizes · Cerclagem + progesterona · ENDO-205 · CA Ovário multi-ômico |
