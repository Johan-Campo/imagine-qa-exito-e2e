import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isCategory } from './categories.ts';
import type { Category } from './categories.ts';
import { OUTCOMES, runPipeline } from './pipeline.ts';

const FIXTURES_DIR = 'tools/failure-triage/fixtures';
const RESULTS_FILE = 'tools/failure-triage/results/latest.md';

interface Label {
  file: string;
  expected: Category;
  why: string;
}

interface Row {
  file: string;
  expected: Category;
  got: string;
  accepted: boolean;
  match: boolean;
}

function parseLabels(json: string): Label[] {
  const parsed: unknown = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error('labels.json must be an array');
  return parsed.map((item: Record<string, unknown>) => {
    if (typeof item.file !== 'string' || !isCategory(item.expected)) {
      throw new Error('labels.json has an invalid entry');
    }
    return { file: item.file, expected: item.expected, why: String(item.why) };
  });
}

const yesNo = (value: boolean): string => (value ? 'yes' : 'no');

function renderTable(rows: Row[]): string {
  const header = '| fixture | expected | got | validator accepted | match |\n|---|---|---|---|---|';
  const lines = rows.map(
    (r) => `| ${r.file} | ${r.expected} | ${r.got} | ${yesNo(r.accepted)} | ${yesNo(r.match)} |`,
  );
  return [header, ...lines].join('\n');
}

function renderTotals(rows: Row[]): string {
  const total = rows.length;
  const accepted = rows.filter((r) => r.accepted).length;
  const correct = rows.filter((r) => r.match).length;
  const lines = [`Accepted by validator: ${accepted}/${total}`, `Correct: ${correct}/${total}`, ''];
  lines.push('Per expected category:');
  for (const category of new Set(rows.map((r) => r.expected))) {
    const group = rows.filter((r) => r.expected === category);
    lines.push(`- ${category}: ${group.filter((r) => r.match).length}/${group.length} correct`);
  }
  return lines.join('\n');
}

async function main(): Promise<void> {
  const labels = parseLabels(readFileSync(join(FIXTURES_DIR, 'labels.json'), 'utf8'));
  const rows: Row[] = [];

  for (const label of labels) {
    const result = await runPipeline(readFileSync(join(FIXTURES_DIR, label.file), 'utf8'));
    const accepted = result.outcome === OUTCOMES.ACCEPTED;
    const got = accepted ? result.draft.category : `(${result.outcome})`;
    rows.push({
      file: label.file,
      expected: label.expected,
      got,
      accepted,
      match: got === label.expected,
    });
  }

  const table = renderTable(rows);
  const totals = renderTotals(rows);
  console.log(`${table}\n\n${totals}`);

  const header = [
    '# Failure triage evaluation',
    '',
    `Sample size: ${rows.length}. Single run, temperature 0. Answers can still vary between runs.`,
    'Fixtures are reconstructed excerpts of real failures, NOT a general accuracy figure.',
    '',
  ].join('\n');
  mkdirSync('tools/failure-triage/results', { recursive: true });
  writeFileSync(RESULTS_FILE, `${header}\n${table}\n\n${totals}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Unexpected error');
  process.exitCode = 1;
});
