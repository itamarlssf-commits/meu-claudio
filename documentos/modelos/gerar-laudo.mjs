#!/usr/bin/env node
/**
 * Preenche o modelo de laudo com os dados de uma paciente.
 *
 *   node documentos/modelos/gerar-laudo.mjs dados-paciente.json laudo.html
 *
 * O JSON com os dados da paciente NÃO deve ser versionado (este repositório é
 * público). Mantenha-o fora da pasta do projeto ou use a pasta `documentos/gerados/`,
 * que está no .gitignore.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const MODELO = resolve(AQUI, 'laudo-gestacional-salario-maternidade.html');

const [entrada, saida] = process.argv.slice(2);
if (!entrada || !saida) {
  console.error('uso: node gerar-laudo.mjs <dados.json> <saida.html>');
  process.exit(1);
}

const dados = JSON.parse(readFileSync(resolve(process.cwd(), entrada), 'utf8'));
const listas = new Set(['DIAGNOSTICOS', 'CONDUTA']);

const html = readFileSync(MODELO, 'utf8').replace(/\{\{(\w+)\}\}/g, (_, chave) => {
  const valor = dados[chave];
  if (valor == null) return `<span style="color:#b00">[preencher: ${chave}]</span>`;
  if (Array.isArray(valor)) {
    const itens = valor.map((i) => `<li>${i}</li>`).join('\n    ');
    return listas.has(chave) ? itens : valor.join(' ');
  }
  return String(valor);
});

writeFileSync(resolve(process.cwd(), saida), html);
console.log(`laudo gerado em ${saida}`);
