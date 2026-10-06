import { expect, test } from '@playwright/test';
import { requestTriage } from '../../tools/failure-triage/deepinfra-client.ts';
import type { FetchLike } from '../../tools/failure-triage/deepinfra-client.ts';

const FAKE_KEY = 'test-key-123';
const MESSAGES = [{ role: 'user' as const, content: 'hello' }];

interface Captured {
  url?: string;
  init?: RequestInit;
}

function fakeFetch(response: Response, captured: Captured = {}): FetchLike {
  return async (url, init) => {
    captured.url = url;
    captured.init = init;
    return response;
  };
}

test.describe('requestTriage', () => {
  let originalKey: string | undefined;

  test.beforeEach(() => {
    originalKey = process.env.DEEPINFRA_API_KEY;
    process.env.DEEPINFRA_API_KEY = FAKE_KEY;
  });

  test.afterEach(() => {
    if (originalKey === undefined) delete process.env.DEEPINFRA_API_KEY;
    else process.env.DEEPINFRA_API_KEY = originalKey;
  });

  test('sends the bearer header and a deterministic request without JSON mode', async () => {
    const captured: Captured = {};
    const body = JSON.stringify({ choices: [{ message: { content: '{}' } }] });

    await requestTriage(MESSAGES, fakeFetch(new Response(body), captured));

    expect(captured.init?.headers).toMatchObject({ Authorization: `Bearer ${FAKE_KEY}` });
    const sent: unknown = JSON.parse(String(captured.init?.body));
    expect(sent).toMatchObject({ temperature: 0 });
    expect(sent).not.toHaveProperty('response_format');
  });

  test('returns the assistant content', async () => {
    const body = JSON.stringify({ choices: [{ message: { content: '{"category":"x"}' } }] });

    const content = await requestTriage(MESSAGES, fakeFetch(new Response(body)));

    expect(content).toBe('{"category":"x"}');
  });

  test('throws on a non-2xx status without leaking the key', async () => {
    const failure = new Response('unauthorized', { status: 401 });

    const error = await requestTriage(MESSAGES, fakeFetch(failure)).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('401');
    expect((error as Error).message).not.toContain(FAKE_KEY);
  });

  test('throws when the API key is missing', async () => {
    delete process.env.DEEPINFRA_API_KEY;

    await expect(requestTriage(MESSAGES, fakeFetch(new Response('{}')))).rejects.toThrow(
      'DEEPINFRA_API_KEY',
    );
  });
});
