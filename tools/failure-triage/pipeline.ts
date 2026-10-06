import { requestTriage } from './deepinfra-client.ts';
import { guardInput } from './privacy-guard.ts';
import { buildMessages } from './prompt.ts';
import type { ChatMessage } from './prompt.ts';
import { validateTriage } from './validator.ts';
import type { TriageDraft } from './validator.ts';

export const OUTCOMES = {
  ACCEPTED: 'accepted',
  REJECTED_BY_VALIDATOR: 'rejected_by_validator',
  BLOCKED_BY_PRIVACY_GUARD: 'blocked_by_privacy_guard',
  ERROR: 'error',
} as const;

export type Outcome = (typeof OUTCOMES)[keyof typeof OUTCOMES];

export interface Accepted {
  outcome: typeof OUTCOMES.ACCEPTED;
  draft: TriageDraft;
}

export interface Rejected {
  outcome: typeof OUTCOMES.REJECTED_BY_VALIDATOR;
  errors: string[];
}

export interface Blocked {
  outcome: typeof OUTCOMES.BLOCKED_BY_PRIVACY_GUARD;
  reason: string;
}

export type PipelineResult = Accepted | Rejected | Blocked;

export type TriageRequest = (messages: ChatMessage[]) => Promise<string>;

export async function runPipeline(
  failureText: string,
  request: TriageRequest = requestTriage,
): Promise<PipelineResult> {
  const guarded = guardInput(failureText);
  if (!guarded.ok) {
    return { outcome: OUTCOMES.BLOCKED_BY_PRIVACY_GUARD, reason: guarded.reason };
  }

  const raw = await request(buildMessages(guarded.text));
  const validation = validateTriage(raw, guarded.text);
  if (!validation.ok) {
    return { outcome: OUTCOMES.REJECTED_BY_VALIDATOR, errors: validation.errors };
  }
  return { outcome: OUTCOMES.ACCEPTED, draft: validation.value };
}
