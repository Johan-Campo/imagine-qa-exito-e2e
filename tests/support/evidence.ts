import { test } from '@playwright/test';
import type { Page } from '@playwright/test';

export async function attachScreenshot(page: Page, name: string): Promise<void> {
  const body = await page.screenshot();
  await test.info().attach(name, { body, contentType: 'image/png' });
}
