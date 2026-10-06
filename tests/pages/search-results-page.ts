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
    // "exact" avoids the wishlist button, whose label also contains "agregar".
    this.firstProductAddButton = this.firstProduct.getByRole('button', {
      name: 'Agregar',
      exact: true,
    });
    // The stepper input has no accessible name; it is the only textbox in the card.
    this.firstProductQuantity = this.firstProduct.getByRole('textbox');
  }

  // The list is re-rendered while the page hydrates, so the first card can briefly be an
  // unrelated product. Wait until it matches the search term before interacting with it.
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
