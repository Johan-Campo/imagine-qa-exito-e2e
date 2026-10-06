import { errors } from '@playwright/test';
import type { Page } from '@playwright/test';

const POPUP_TIMEOUT_MS = 8_000;

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async dismissPromoPopup(): Promise<void> {
    const popup = this.page.locator('[role="dialog"]:visible').first();
    try {
      await popup.waitFor({ state: 'visible', timeout: POPUP_TIMEOUT_MS });
      await this.page.keyboard.press('Escape');
      await popup.waitFor({ state: 'hidden' });
    } catch (error) {
      // The promo pop-up is intermittent, so its absence is not a failure.
      if (!(error instanceof errors.TimeoutError)) {
        throw error;
      }
    }
  }
}
