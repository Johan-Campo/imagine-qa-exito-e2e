import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.searchBox = page.getByRole('textbox', { name: 'search' });
    this.searchButton = page.getByRole('button', { name: 'Submit Search' });
    this.productCards = page.locator('article');
  }

  async open(): Promise<void> {
    await this.goto('/');
    await this.dismissPromoPopup();
  }

  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
    await this.searchButton.click();
  }
}
