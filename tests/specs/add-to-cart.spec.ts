import { expect, test } from '@playwright/test';
import { CartPanel } from '../pages/cart-panel';
import { HomePage } from '../pages/home-page';
import { LocationModal } from '../pages/location-modal';
import { SearchResultsPage } from '../pages/search-results-page';
import { attachScreenshot } from '../support/evidence';
import { fetchCategoryLimit } from '../support/limit-rules';
import { BOGOTA_CHAPINERO } from '../support/locations';

const SEARCH_TERM = 'arroz';

test.describe('Add to cart', () => {
  test(
    'adds a product after choosing a pickup location',
    {
      tag: ['@critical', '@e2e', '@cart', '@TC-07'],
      annotation: [
        { type: 'case', description: 'TC-07 · Happy path · see the test document' },
        { type: 'priority', description: 'High' },
      ],
    },
    async ({ page }) => {
      const home = new HomePage(page);
      const results = new SearchResultsPage(page);
      const locationModal = new LocationModal(page);
      const cart = new CartPanel(page);
      let productName = '';

      await test.step('Open the home page', async () => {
        await home.open();
      });

      await test.step(`Search for "${SEARCH_TERM}"`, async () => {
        await home.search(SEARCH_TERM);
        await results.waitForResultsFor(SEARCH_TERM);
        productName = (await results.firstProductName.innerText()).trim();
      });

      await test.step('Add the first product without a location', async () => {
        await results.addFirstProductToCart();
      });

      await test.step('Choose Bogotá / Chapinero as pickup location', async () => {
        await locationModal.choosePickupLocation(BOGOTA_CHAPINERO);
        await expect(locationModal.dialog).toBeHidden();
        await expect(page.getByRole('button', { name: /Compra y Recoge/ }).first()).toContainText(
          BOGOTA_CHAPINERO.storeName,
        );
        await attachScreenshot(page, 'Pickup location confirmed');
      });

      await test.step('Add the first product again', async () => {
        await results.addFirstProductToCart();
        await expect(results.firstProductQuantity).toHaveValue('1', { timeout: 30_000 });
        await expect(cart.toggleButton).toContainText('1');
        await attachScreenshot(page, 'Product added to the cart');
      });

      await test.step('Open the cart and check the line item and subtotal', async () => {
        await cart.open();
        await expect(cart.heading).toBeVisible();
        await expect(cart.lineItems).toHaveCount(1);
        await expect(cart.lineItems.first()).toContainText(productName);
        expect(await cart.badgeCount()).toBe(1);
        expect(await cart.subtotal()).toBe(await cart.firstLinePrice());
        await attachScreenshot(page, 'Cart panel with subtotal');
      });
    },
  );

  test(
    'asks for a city and a store before adding a grocery product',
    {
      tag: ['@critical', '@e2e', '@cart', '@TC-05'],
      annotation: [
        { type: 'case', description: 'TC-05 · Negative · see the test document' },
        { type: 'priority', description: 'High' },
      ],
    },
    async ({ page }) => {
      const home = new HomePage(page);
      const results = new SearchResultsPage(page);
      const locationModal = new LocationModal(page);
      const cart = new CartPanel(page);

      await test.step('Open the home page', async () => {
        await home.open();
      });

      await test.step(`Search for "${SEARCH_TERM}"`, async () => {
        await home.search(SEARCH_TERM);
        await results.waitForResultsFor(SEARCH_TERM);
      });

      await test.step('Add the first product without a location and check the modal blocks it', async () => {
        await results.addFirstProductToCart();
        await expect(locationModal.dialog).toBeVisible();
        await expect(locationModal.storeCombobox).toBeDisabled();
        await expect(locationModal.confirmButton).toHaveCSS('pointer-events', 'none');
        await attachScreenshot(page, 'Modal blocked before choosing a city');
      });

      await test.step('Choose only a city and check the store is still required', async () => {
        await locationModal.chooseCity(BOGOTA_CHAPINERO.city);
        await expect(locationModal.storeCombobox).toBeEnabled();
        await expect(locationModal.confirmButton).toHaveCSS('pointer-events', 'none');
        await attachScreenshot(page, 'City chosen, store still pending');
      });

      await test.step('Close the modal and check nothing was added', async () => {
        await locationModal.close();
        await expect(locationModal.dialog).toBeHidden();
        await expect(cart.toggleButton).not.toContainText(/\d/);
        await expect(results.firstProductQuantity).toHaveCount(0);
        await expect(results.firstProductAddButton).toBeVisible();
        await attachScreenshot(page, 'Modal closed, cart still empty');
      });
    },
  );

  test(
    'does not allow more units than the category limit',
    {
      tag: ['@critical', '@e2e', '@cart', '@TC-09'],
      annotation: [
        { type: 'case', description: 'TC-09 · Additional case · see the test document' },
        { type: 'priority', description: 'High' },
      ],
    },
    async ({ page }) => {
      const home = new HomePage(page);
      const results = new SearchResultsPage(page);
      const cart = new CartPanel(page);
      const limit = await test.step('Read the category limit from the site rules', async () =>
        fetchCategoryLimit(page.request, 'NETFLIX'));

      await test.step('Open the home page', async () => {
        await home.open();
      });

      await test.step('Search for "netflix"', async () => {
        await home.search('netflix');
      });

      const pinCard = results.productCardByName(/Pin virtual POSA/i).first();

      await test.step('Find the Netflix pin card', async () => {
        await expect(pinCard, 'the Netflix pin card should be in the results').toBeVisible();
      });

      const quantity = pinCard.getByText(`${limit} und.`);

      await test.step('Add the pin up to the category limit', async () => {
        await pinCard.getByRole('button', { name: 'Agregar', exact: true }).click();
        await expect(quantity).toBeVisible({ timeout: 30_000 });
        await expect(cart.toggleButton).toContainText(String(limit));
        await expect(pinCard.getByText(new RegExp(`Máximo ${limit} unidad`))).toBeVisible();
        await attachScreenshot(page, 'Product at its limit with the message visible');
      });

      await test.step('Check the quantity cannot be increased past the limit', async () => {
        const increase = pinCard.getByRole('button').last();
        await expect(increase).toBeDisabled();
        await increase.click({ force: true });
        await expect(quantity).toBeVisible();
      });
    },
  );
});
