# Modelos de documentos

Modelos em HTML prontos para impressão em A4 (abrir no navegador → **Imprimir → Salvar como PDF**).

## Laudo gestacional para salário-maternidade

`laudo-gestacional-salario-maternidade.html` — laudo médico para instruir o requerimento
de salário-maternidade junto ao INSS (Lei nº 8.213/91, art. 71; Decreto nº 3.048/99, art. 93).
Os campos variáveis estão marcados como `{{CAMPO}}`.

### Como preencher

1. Copie `dados-exemplo.json` para um arquivo fora do controle de versão, por exemplo
   `documentos/gerados/ingrid.json` (a pasta `documentos/gerados/` está no `.gitignore`).
2. Preencha os campos.
3. Gere o laudo:

   ```bash
   node documentos/modelos/gerar-laudo.mjs documentos/gerados/ingrid.json documentos/gerados/ingrid-laudo.html
   ```

4. Abra o HTML gerado no navegador, confira, imprima em PDF, assine e carimbe.

Campos não preenchidos aparecem em vermelho no documento, como `[preencher: CAMPO]`.

### Privacidade

**Este repositório é público.** Nenhum arquivo com nome, CPF, NIT, diagnóstico ou qualquer
outro dado de paciente deve ser commitado — só os modelos em branco. Os documentos
preenchidos ficam em `documentos/gerados/`, ignorada pelo Git.
