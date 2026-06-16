/* Executor das verificações. Rodar: npx tsx app/plantao/data/checks.run.ts */
import { runChecks } from './checks';

const results = runChecks();
let failed = 0;
for (const r of results) {
  const mark = r.pass ? '✓' : '✗';
  if (!r.pass) failed++;
  // eslint-disable-next-line no-console
  console.log(`${mark} ${r.name} — ${r.detail}`);
}
// eslint-disable-next-line no-console
console.log(`\n${results.length - failed}/${results.length} ok`);
process.exit(failed ? 1 : 0);
