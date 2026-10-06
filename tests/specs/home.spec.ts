import { expect, test } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { attachScreenshot } from '../support/evidence';

const SEARCH_TERM = 'arroz';

test.describe('Home', () => {
  test(
    'search box finds products',
    {
      tag: ['@smoke', '@e2e', '@home'],
      annotation: [
        {
          type: 'case',
          description: 'Smoke · validates setup and selectors, not a scored scenario',
        },
      ],
    },
    async ({ page }) => {
      const home = new HomePage(page);

      await test.step('Open the home page', async () => {
        await home.open();
        await expect(home.searchBox).toBeVisible();
      });

      await test.step(`Search for "${SEARCH_TERM}"`, async () => {
        await home.search(SEARCH_TERM);
      });

      await test.step('Check the results page lists products', async () => {
        await expect(page).toHaveURL(new RegExp(`[?&]q=${SEARCH_TERM}`));
        await expect(home.productCards.first()).toBeVisible();
        await attachScreenshot(page, 'Search results');
      });
    },
  );
});
