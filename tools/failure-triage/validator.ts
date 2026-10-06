import { isCategory } from './categories.ts';
import type { Category } from './categories.ts';

export const DRAFT_STATUS = 'DRAFT_HUMAN_DECISION_REQUIRED';

export interface TriageDraft {
  status: typeof DRAFT_STATUS;
  category: Category;
  reason: string;
  evidence: string;
  next_step_for_human: string;
}

export interface ValidTriage {
  ok: true;
  value: TriageDraft;
}

export interface InvalidTriage {
  ok: false;
  errors: string[];
}

export type TriageValidation = ValidTriage | InvalidTriage;

const EXPECTED_KEYS = ['category', 'reason', 'evidence', 'next_step_for_human'];
const MAX_TEXT_LENGTH = 400;
const MAX_EVIDENCE_LENGTH = 200;

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkText(value: unknown, field: string, max: number, errors: string[]): void {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${field} must be a non-empty string`);
  } else if (value.length > max) {
    errors.push(`${field} must be at most ${max} characters`);
  }
}

export function validateTriage(raw: string, sourceText: string): TriageValidation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, errors: ['answer is not valid JSON'] };
  }
  if (!isRecord(parsed)) {
    return { ok: false, errors: ['answer must be a JSON object'] };
  }

  const errors: string[] = [];
  const extraKeys = Object.keys(parsed).filter((key) => !EXPECTED_KEYS.includes(key));
  if (extraKeys.length > 0) errors.push(`unexpected keys: ${extraKeys.join(', ')}`);

  const { category, reason, evidence, next_step_for_human: nextStep } = parsed;
  if (!isCategory(category)) errors.push('category is not one of the allowed values');
  checkText(reason, 'reason', MAX_TEXT_LENGTH, errors);
  checkText(nextStep, 'next_step_for_human', MAX_TEXT_LENGTH, errors);
  checkText(evidence, 'evidence', MAX_EVIDENCE_LENGTH, errors);

  if (typeof evidence === 'string' && evidence.trim() !== '') {
    const quote = collapseWhitespace(evidence);
    if (!collapseWhitespace(sourceText).includes(quote)) {
      errors.push('evidence is not a verbatim quote of the failure text');
    }
  }

  if (
    errors.length > 0 ||
    !isCategory(category) ||
    typeof reason !== 'string' ||
    typeof evidence !== 'string' ||
    typeof nextStep !== 'string'
  ) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: { status: DRAFT_STATUS, category, reason, evidence, next_step_for_human: nextStep },
  };
}
