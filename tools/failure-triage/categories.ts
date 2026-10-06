export const CATEGORIES = {
  PRODUCT_BUG: 'product_bug',
  TEST_CODE_ISSUE: 'test_code_issue',
  TIMING_OR_RACE: 'timing_or_race',
  SITE_OR_ENVIRONMENT: 'site_or_environment',
  UNDETERMINED: 'undetermined',
} as const;

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];

const CATEGORY_VALUES: readonly string[] = Object.values(CATEGORIES);

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && CATEGORY_VALUES.includes(value);
}
