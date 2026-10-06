import { expect, test } from '@playwright/test';
import { HomePage } from '../pages/home-page';

const SEARCH_TERM = 'arroz';

test.describe('Home', () => {
  test('search box finds products', { tag: ['@smoke', '@e2e', '@home'] }, async ({ page }) => {
    const home = new HomePage(page);

    await home.open();
    await expect(home.searchBox).toBeVisible();

    await home.search(SEARCH_TERM);

    await expect(page).toHaveURL(new RegExp(`[?&]q=${SEARCH_TERM}`));
    await expect(home.productCards.first()).toBeVisible();
  });
});
