import type { APIRequestContext } from '@playwright/test';

interface LimitRule {
  category: string;
  quantity: string;
}

interface LimitRulesResponse {
  rules: LimitRule[];
}

function isLimitRule(value: unknown): value is LimitRule {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).category === 'string' &&
    typeof (value as Record<string, unknown>).quantity === 'string'
  );
}

function isLimitRulesResponse(value: unknown): value is LimitRulesResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const rules = (value as Record<string, unknown>).rules;
  return Array.isArray(rules) && rules.every(isLimitRule);
}

export async function fetchCategoryLimit(
  request: APIRequestContext,
  categoryFragment: string,
): Promise<number> {
  const response = await request.get('/api/limitQuantity/rules');
  const body: unknown = await response.json();
  if (!isLimitRulesResponse(body)) {
    throw new Error('Unexpected shape in /api/limitQuantity/rules response');
  }
  const rule = body.rules.find((candidate) => candidate.category.includes(categoryFragment));
  if (!rule) {
    throw new Error(`No quantity limit rule found for category "${categoryFragment}"`);
  }
  return Number(rule.quantity);
}
