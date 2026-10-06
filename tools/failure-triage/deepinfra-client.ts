import type { ChatMessage } from './prompt.ts';

const ENDPOINT = 'https://api.deepinfra.com/v1/openai/chat/completions';
const MODEL = 'deepseek-ai/DeepSeek-V4-Flash-0731';
const PLACEHOLDER_KEY = 'your_key_here';
const MAX_ERROR_BODY_CHARS = 200;

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

interface ChatCompletion {
  choices?: { message?: { content?: unknown } }[];
}

function readApiKey(): string {
  const key = process.env.DEEPINFRA_API_KEY;
  if (!key || key === PLACEHOLDER_KEY) {
    throw new Error('DEEPINFRA_API_KEY is missing or still the placeholder. Set it in .env.');
  }
  return key;
}

function extractContent(payload: ChatCompletion): string {
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('DeepInfra response has no assistant content');
  }
  return content;
}

export async function requestTriage(
  messages: ChatMessage[],
  fetchImpl: FetchLike = fetch,
): Promise<string> {
  const key = readApiKey();
  const response = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    // No `response_format`: with this model its JSON mode answered `{}` in 5 of 5 calls on the
    // same input, while plain mode returned all four fields. The validator checks the JSON.
    body: JSON.stringify({ model: MODEL, messages, temperature: 0, max_tokens: 400 }),
  });

  if (!response.ok) {
    const body = (await response.text()).slice(0, MAX_ERROR_BODY_CHARS);
    throw new Error(`DeepInfra request failed with status ${response.status}: ${body}`);
  }
  return extractContent((await response.json()) as ChatCompletion);
}
