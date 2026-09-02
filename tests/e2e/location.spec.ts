import { expect, test } from '@playwright/test';

test.describe('location resolution — current location granted', () => {
  test.use({
    geolocation: { latitude: 1.5535, longitude: 110.3593 },
    permissions: ['geolocation'],
  });

  test('resolves current location and shows it in the status region', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Use my current location' }).click();
    await expect(page.getByRole('status', { name: 'Location status' })).toHaveText(
      'Using your current location (1.5535, 110.3593).',
    );
  });
});

test.describe('location resolution — no permission granted', () => {
  test('falls back to a fully usable manual form when location permission is denied', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Use my current location' }).click();
    await expect(page.getByRole('alert')).toContainText(/permission was denied/i);

    await page.getByLabel('Latitude').fill('1.55');
    await page.getByLabel('Longitude').fill('110.36');
    await page.getByRole('button', { name: 'Use this location' }).click();
    await expect(page.getByRole('status', { name: 'Location status' })).toHaveText(
      'Using a custom location (1.5500, 110.3600).',
    );
  });

  test('manual location works standalone, without ever touching geolocation', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Latitude').fill('1.55');
    await page.getByLabel('Longitude').fill('110.36');
    await page.getByLabel('Label (optional)').fill('Home');
    await page.getByRole('button', { name: 'Use this location' }).click();
    await expect(page.getByRole('status', { name: 'Location status' })).toHaveText(
      'Using Home (1.5500, 110.3600).',
    );
  });

  test('remains usable at a mobile viewport with no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Use my current location' })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('T03 navigation is unaffected: /favorites still loads directly', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page.getByRole('heading', { level: 1, name: 'Favorites' })).toBeVisible();
  });
});
