import { expect, test } from '@playwright/test';
import { OUTCOMES, runPipeline } from '../../tools/failure-triage/pipeline.ts';

const FAILURE_TEXT = 'Error: element(s) not found while waiting for the Confirmar button';

const VALID_ANSWER = JSON.stringify({
  category: 'test_code_issue',
  reason: 'The locator never matches.',
  evidence: 'element(s) not found',
  next_step_for_human: 'Review the locator.',
});

function scriptedRequest(answer: string) {
  let calls = 0;
  const request = async (): Promise<string> => {
    calls += 1;
    return answer;
  };
  return { request, callCount: () => calls };
}

test.describe('runPipeline', () => {
  test('accepts a valid answer and asks the model once', async () => {
    const model = scriptedRequest(VALID_ANSWER);

    const result = await runPipeline(FAILURE_TEXT, model.request);

    expect(result.outcome).toBe(OUTCOMES.ACCEPTED);
    expect(model.callCount()).toBe(1);
  });

  test('rejects an empty object without retrying', async () => {
    const model = scriptedRequest('{}');

    const result = await runPipeline(FAILURE_TEXT, model.request);

    expect(result.outcome).toBe(OUTCOMES.REJECTED_BY_VALIDATOR);
    expect(model.callCount()).toBe(1);
  });

  test('rejects evidence that is not in the failure text', async () => {
    const invented = JSON.stringify({
      category: 'test_code_issue',
      reason: 'The locator never matches.',
      evidence: 'a sentence that is not in the failure text',
      next_step_for_human: 'Review the locator.',
    });

    const result = await runPipeline(FAILURE_TEXT, scriptedRequest(invented).request);

    expect(result.outcome).toBe(OUTCOMES.REJECTED_BY_VALIDATOR);
  });

  test('never calls the model when the privacy guard blocks the input', async () => {
    const model = scriptedRequest(VALID_ANSWER);

    const result = await runPipeline('contact someone@example.com about this', model.request);

    expect(result.outcome).toBe(OUTCOMES.BLOCKED_BY_PRIVACY_GUARD);
    expect(model.callCount()).toBe(0);
  });
});
