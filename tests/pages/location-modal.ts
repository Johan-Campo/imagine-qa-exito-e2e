import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import type { PickupLocation } from '../support/locations';

export class LocationModal {
  readonly dialog: Locator;
  readonly cityCombobox: Locator;
  readonly storeCombobox: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    // Several dialogs live in the DOM, so the title identifies this one.
    this.dialog = page.getByRole('dialog').filter({ hasText: '¿Cómo quieres recibir tu pedido?' });
    // The react-select inputs have no accessible name and, while disabled, are left out of
    // role queries, so they are addressed by their ARIA role attribute and order.
    const selects = this.dialog.locator('input[role="combobox"]');
    this.cityCombobox = selects.nth(0);
    this.storeCombobox = selects.nth(1);
    this.confirmButton = this.dialog.getByRole('button', { name: 'Confirmar' });
  }

  async choosePickupLocation(location: PickupLocation): Promise<void> {
    await this.chooseCity(location.city);
    await this.selectOption(this.storeCombobox, location.storeName);
    await this.confirmButton.click();
  }

  async chooseCity(city: string): Promise<void> {
    await this.selectOption(this.cityCombobox, city);
    await expect(this.storeCombobox).toBeEnabled();
  }

  // The close icon has no accessible name, so Escape dismisses the modal without confirming.
  async close(): Promise<void> {
    await this.dialog.press('Escape');
  }

  private async selectOption(combobox: Locator, optionText: string): Promise<void> {
    await combobox.click();
    await this.dialog.getByRole('option', { name: optionText }).first().click();
  }
}
