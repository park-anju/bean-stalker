import { expect, test } from '@playwright/test';

test.describe('application shell', () => {
  test('discovery page loads with header, nav, and main landmarks', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Bean Stalker' })).toBeVisible();
  });

  test('navigates to favorites and back via the nav links', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Favorites' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Favorites' })).toBeVisible();

    await page.getByRole('link', { name: 'Discover' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Bean Stalker' })).toBeVisible();
  });

  test('supports a direct load of the favorites route', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page.getByRole('heading', { level: 1, name: 'Favorites' })).toBeVisible();
  });

  test('shows a not-found page for an unknown route and can return home', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

    await page.getByRole('link', { name: /return to bean stalker/i }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Bean Stalker' })).toBeVisible();
  });

  test('remains usable at a mobile viewport with no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
