import { expect, test } from '@playwright/test';
import { guardInput } from '../../tools/failure-triage/privacy-guard.ts';

test.describe('guardInput', () => {
  test('blocks an email address', () => {
    expect(guardInput('user is maria.lopez@example.com here').ok).toBe(false);
  });

  test('blocks a Colombian phone number', () => {
    expect(guardInput('call +57 3001234567 now').ok).toBe(false);
    expect(guardInput('call 3001234567 now').ok).toBe(false);
  });

  test('blocks a Bearer token', () => {
    expect(guardInput('Authorization: Bearer abcdefghijklmnop1234567890').ok).toBe(false);
  });

  test('blocks an api_key assignment', () => {
    expect(guardInput('config api_key=abc123 loaded').ok).toBe(false);
  });

  test('redacts a Windows path', () => {
    const result = guardInput(String.raw`at C:\Users\someone\project\file.ts:12`);

    expect(result).toEqual({ ok: true, text: 'at <path>:12' });
  });

  test('redacts a Unix path', () => {
    const result = guardInput('at /home/someone/project/file.ts failed');

    expect(result).toEqual({ ok: true, text: 'at <path> failed' });
  });

  test('passes clean text unchanged', () => {
    const text = "Locator: getByRole('button', { name: 'Agregar' })";

    expect(guardInput(text)).toEqual({ ok: true, text });
  });

  test('never includes the matched value in the refusal reason', () => {
    const result = guardInput('contact maria.lopez@example.com');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).not.toContain('maria.lopez');
  });
});
