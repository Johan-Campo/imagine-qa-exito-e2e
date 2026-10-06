export interface GuardAllowed {
  ok: true;
  text: string;
}

export interface GuardBlocked {
  ok: false;
  reason: string;
}

export type GuardResult = GuardAllowed | GuardBlocked;

interface BlockRule {
  name: string;
  pattern: RegExp;
}

const BLOCK_RULES: readonly BlockRule[] = [
  { name: 'email address', pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { name: 'phone number', pattern: /(?<!\d)(?:\+?57[\s-]?)?3\d{9}(?!\d)/ },
  { name: 'bearer token', pattern: /Bearer\s+[A-Za-z0-9._~+/=-]{16,}/i },
  { name: 'credential assignment', pattern: /(?:api[_-]?key|secret|password)\s*[=:]\s*\S+/i },
  { name: 'long alphanumeric token', pattern: /(?<![A-Za-z0-9])[A-Za-z0-9]{32,}(?![A-Za-z0-9])/ },
];

const PATH_PATTERNS: readonly RegExp[] = [
  /[A-Za-z]:\\(?:[^\\\s'"`<>|:]+\\?)+/g,
  /\/(?:home|Users)\/[^\s'"`<>|:]+/g,
];

export function guardInput(text: string): GuardResult {
  const redacted = PATH_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, '<path>'), text);

  for (const rule of BLOCK_RULES) {
    if (rule.pattern.test(redacted)) {
      return { ok: false, reason: `Input blocked by privacy rule: ${rule.name}` };
    }
  }
  return { ok: true, text: redacted };
}
