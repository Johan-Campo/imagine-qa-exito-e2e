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
    // The react-select inputs expose no accessible name, so they are addressed by order.
    this.cityCombobox = this.dialog.getByRole('combobox').nth(0);
    this.storeCombobox = this.dialog.getByRole('combobox').nth(1);
    this.confirmButton = this.dialog.getByRole('button', { name: 'Confirmar' });
  }

  async choosePickupLocation(location: PickupLocation): Promise<void> {
    await this.selectOption(this.cityCombobox, location.city);
    await expect(this.storeCombobox).toBeEnabled();
    await this.selectOption(this.storeCombobox, location.storeName);
    await this.confirmButton.click();
  }

  private async selectOption(combobox: Locator, optionText: string): Promise<void> {
    await combobox.click();
    await this.dialog.getByRole('option', { name: optionText }).first().click();
  }
}
