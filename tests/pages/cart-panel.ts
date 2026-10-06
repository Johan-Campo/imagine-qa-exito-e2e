import type { Locator, Page } from '@playwright/test';
import { parsePesos } from '../support/currency';

export class CartPanel {
  readonly toggleButton: Locator;
  readonly heading: Locator;
  readonly closeButton: Locator;
  readonly lineItems: Locator;
  readonly subtotalLine: Locator;

  constructor(page: Page) {
    this.toggleButton = page.getByRole('button', { name: 'Cart toggle button' });
    this.heading = page.getByText('Agregados al carrito');
    this.closeButton = page.getByRole('button', { name: 'Cerrar minicart' });
    // The panel has no landmark role, and the product grid behind it also has list items with a
    // quantity textbox. Scope to the panel root, two levels above its heading.
    const panel = this.heading.locator('xpath=../..');
    this.lineItems = panel.getByRole('listitem');
    // The amount sits next to the label, so the label's parent holds both.
    this.subtotalLine = page.getByText('Subtotal:').locator('..');
  }

  async open(): Promise<void> {
    await this.toggleButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async badgeCount(): Promise<number> {
    return Number.parseInt(await this.toggleButton.innerText(), 10);
  }

  async subtotal(): Promise<number> {
    return parsePesos(await this.subtotalLine.innerText());
  }

  async firstLinePrice(): Promise<number> {
    return parsePesos(await this.lineItems.first().getByText(/^\$/).innerText());
  }
}
