import { appendFileSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { OUTCOMES, runPipeline } from './pipeline.ts';
import type { Outcome } from './pipeline.ts';

const RUNS_LOG = 'tools/failure-triage/runs.log.jsonl';
const EXIT_REJECTED = 1;
const EXIT_BLOCKED = 2;

function logRun(file: string, outcome: Outcome, category?: string): void {
  const entry = { timestamp: new Date().toISOString(), file: basename(file), outcome, category };
  appendFileSync(RUNS_LOG, `${JSON.stringify(entry)}\n`);
}

async function main(): Promise<number> {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: triage.ts <path-to-error-context.md>');
    return EXIT_REJECTED;
  }

  try {
    const result = await runPipeline(readFileSync(file, 'utf8'));

    if (result.outcome === OUTCOMES.BLOCKED_BY_PRIVACY_GUARD) {
      console.error(`Refused: ${result.reason}. Nothing was sent to the model.`);
      logRun(file, result.outcome);
      return EXIT_BLOCKED;
    }
    if (result.outcome === OUTCOMES.REJECTED_BY_VALIDATOR) {
      console.error('The model answer failed validation and is discarded:');
      for (const error of result.errors) console.error(`- ${error}`);
      logRun(file, result.outcome);
      return EXIT_REJECTED;
    }

    const { draft } = result;
    console.log(
      [
        `=== ${draft.status} ===`,
        `Category:  ${draft.category}`,
        `Reason:    ${draft.reason}`,
        `Evidence:  "${draft.evidence}"`,
        `Next step: ${draft.next_step_for_human}`,
        '',
        'This is a proposal. A person decides.',
      ].join('\n'),
    );
    logRun(file, result.outcome, draft.category);
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Unexpected error');
    logRun(file, OUTCOMES.ERROR);
    return EXIT_REJECTED;
  }
}

main().then((code) => {
  process.exitCode = code;
});
