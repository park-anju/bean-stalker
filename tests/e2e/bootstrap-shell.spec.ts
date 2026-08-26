import { expect, test } from '@playwright/test';

test('discovery shell renders and favorites route navigates', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bean Stalker' })).toBeVisible();

  await page.getByRole('link', { name: 'Favorites' }).click();
  await expect(page.getByRole('heading', { name: 'Favorites' })).toBeVisible();
});
