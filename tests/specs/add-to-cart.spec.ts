import { expect, test } from '@playwright/test';
import { CartPanel } from '../pages/cart-panel';
import { HomePage } from '../pages/home-page';
import { LocationModal } from '../pages/location-modal';
import { SearchResultsPage } from '../pages/search-results-page';
import { BOGOTA_CHAPINERO } from '../support/locations';

const SEARCH_TERM = 'arroz';

test.describe('Add to cart', () => {
  test(
    'adds a product after choosing a pickup location',
    { tag: ['@critical', '@e2e', '@cart', '@TC-07'] },
    async ({ page }) => {
      const home = new HomePage(page);
      const results = new SearchResultsPage(page);
      const locationModal = new LocationModal(page);
      const cart = new CartPanel(page);

      await home.open();
      await home.search(SEARCH_TERM);
      await results.waitForResultsFor(SEARCH_TERM);
      const productName = (await results.firstProductName.innerText()).trim();

      // Without a saved location the first click only opens the location modal.
      await results.addFirstProductToCart();
      await locationModal.choosePickupLocation(BOGOTA_CHAPINERO);
      await expect(locationModal.dialog).toBeHidden();
      await expect(page.getByRole('button', { name: /Compra y Recoge/ }).first()).toContainText(
        BOGOTA_CHAPINERO.storeName,
      );

      // The location confirmation does not add the product, so add it again.
      await results.addFirstProductToCart();
      // The add button shows a spinner while the cart is validated server-side, which can be slow.
      await expect(results.firstProductQuantity).toHaveValue('1', { timeout: 30_000 });
      await expect(cart.toggleButton).toContainText('1');

      await cart.open();
      await expect(cart.heading).toBeVisible();
      await expect(cart.lineItems).toHaveCount(1);
      await expect(cart.lineItems.first()).toContainText(productName);
      expect(await cart.badgeCount()).toBe(1);
      expect(await cart.subtotal()).toBe(await cart.firstLinePrice());
    },
  );

  test(
    'asks for a city and a store before adding a grocery product',
    { tag: ['@critical', '@e2e', '@cart', '@TC-05'] },
    async ({ page }) => {
      const home = new HomePage(page);
      const results = new SearchResultsPage(page);
      const locationModal = new LocationModal(page);
      const cart = new CartPanel(page);

      await home.open();
      await home.search(SEARCH_TERM);
      await results.waitForResultsFor(SEARCH_TERM);

      await results.addFirstProductToCart();
      await expect(locationModal.dialog).toBeVisible();
      await expect(locationModal.storeCombobox).toBeDisabled();
      // The site blocks "Confirmar" with CSS only (no disabled attribute), so check the style.
      await expect(locationModal.confirmButton).toHaveCSS('pointer-events', 'none');

      await locationModal.chooseCity(BOGOTA_CHAPINERO.city);
      await expect(locationModal.storeCombobox).toBeEnabled();
      await expect(locationModal.confirmButton).toHaveCSS('pointer-events', 'none');

      await locationModal.close();
      await expect(locationModal.dialog).toBeHidden();
      await expect(cart.toggleButton).not.toContainText(/\d/);
      await expect(results.firstProductQuantity).toHaveCount(0);
      await expect(results.firstProductAddButton).toBeVisible();
    },
  );
});
