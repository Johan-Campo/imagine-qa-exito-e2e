import { expect, test } from '@playwright/test';
import { validateTriage } from '../../tools/failure-triage/validator.ts';

const SOURCE =
  'TimeoutError: locator.click: Timeout 15000ms exceeded.\n  intercepts pointer events';

function answer(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    category: 'test_code_issue',
    reason: 'The click is blocked by another element.',
    evidence: 'intercepts pointer events',
    next_step_for_human: 'Check the locator.',
    ...overrides,
  });
}

test.describe('validateTriage', () => {
  test('accepts a well-formed answer with a verbatim quote', () => {
    const result = validateTriage(answer(), SOURCE);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe('DRAFT_HUMAN_DECISION_REQUIRED');
  });

  test('accepts evidence that differs only in whitespace', () => {
    const result = validateTriage(
      answer({ evidence: 'exceeded.   intercepts\npointer events' }),
      SOURCE,
    );

    expect(result.ok).toBe(true);
  });

  test('rejects evidence that is not in the source', () => {
    const result = validateTriage(answer({ evidence: 'the server returned 500' }), SOURCE);

    expect(result.ok).toBe(false);
  });

  test('rejects a category outside the closed list', () => {
    const result = validateTriage(answer({ category: 'flaky' }), SOURCE);

    expect(result.ok).toBe(false);
  });

  test('rejects extra keys', () => {
    const result = validateTriage(answer({ confidence: 0.9 }), SOURCE);

    expect(result.ok).toBe(false);
  });

  test('rejects an answer that is not JSON', () => {
    const result = validateTriage('The category is test_code_issue', SOURCE);

    expect(result.ok).toBe(false);
  });

  test('rejects an empty reason', () => {
    const result = validateTriage(answer({ reason: '  ' }), SOURCE);

    expect(result.ok).toBe(false);
  });

  test('rejects evidence longer than 200 characters', () => {
    const longSource = 'a '.repeat(150);
    const result = validateTriage(answer({ evidence: longSource.trim() }), longSource);

    expect(result.ok).toBe(false);
  });
});
