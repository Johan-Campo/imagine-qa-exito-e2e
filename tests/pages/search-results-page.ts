import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class SearchResultsPage extends BasePage {
  readonly productCards: Locator;
  readonly firstProduct: Locator;
  readonly firstProductName: Locator;
  readonly firstProductAddButton: Locator;
  readonly firstProductQuantity: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards = page.locator('article');
    this.firstProduct = this.productCards.first();
    this.firstProductName = this.firstProduct.getByRole('heading').first();
    this.firstProductAddButton = this.firstProduct.getByRole('button', {
      name: 'Agregar',
      exact: true,
    });
    this.firstProductQuantity = this.firstProduct.getByRole('textbox');
  }

  async waitForResultsFor(term: string): Promise<void> {
    await expect(this.firstProductName).toContainText(new RegExp(term, 'i'));
  }

  productCardByName(name: RegExp): Locator {
    return this.productCards.filter({ hasText: name });
  }

  async addFirstProductToCart(): Promise<void> {
    await this.firstProductAddButton.click();
  }
}
