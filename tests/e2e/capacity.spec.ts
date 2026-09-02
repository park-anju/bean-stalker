import { expect, test, type Page } from '@playwright/test';

const HAPPY = {
  searchCenter: { latitude: 1.55, longitude: 110.36 },
  fetchedAt: '2026-08-28T02:00:00.000Z',
  cafes: [
    {
      placeId: 'places/kopi',
      name: 'Kopi Kenangan',
      location: { latitude: 1.5551, longitude: 110.3489 },
      rating: 4.8,
      userRatingCount: 342,
      openStatus: 'OPEN',
      distanceMeters: 1160,
    },
  ],
};

async function blockGoogleMaps(page: Page) {
  await page.route(/maps\.googleapis\.com/, (route) => route.abort());
}

async function setManualLocation(page: Page) {
  await page.getByLabel('Latitude').fill('1.55');
  await page.getByLabel('Longitude').fill('110.36');
  await page.getByRole('button', { name: 'Use this location' }).click();
}

test.describe('graceful rate / capacity exhaustion (H05)', () => {
  test('a 429 RATE_LIMITED shows a bounded "too quickly" message, never auto-retries, and retry works', async ({
    page,
  }) => {
    await blockGoogleMaps(page);
    let count = 0;
    await page.route('**/api/v1/cafes/search', async (route) => {
      count += 1;
      if (count === 1) {
        await route.fulfill({
          status: 429,
          headers: { 'retry-after': '30' },
          json: { error: { code: 'RATE_LIMITED', message: 'ip over limit', requestId: 'r1' } },
        });
      } else {
        await route.fulfill({ json: HAPPY });
      }
    });

    await page.goto('/');
    await setManualLocation(page);

    const alert = page.getByRole('alert');
    await expect(alert).toContainText(/too quickly/i);
    await expect(alert).not.toContainText(/ip over limit/);

    // no automatic retry
    await page.waitForTimeout(300);
    expect(count).toBe(1);

    // favourites/local UI unaffected — the location is retained
    await expect(page.getByLabel('Latitude')).toHaveValue('1.55');

    await page.getByRole('button', { name: /retry search/i }).click();
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();
    expect(count).toBe(2);
  });

  test('a 503 PROVIDER_CAPACITY_EXHAUSTED degrades gracefully and does not crash the app', async ({
    page,
  }) => {
    await blockGoogleMaps(page);
    let count = 0;
    await page.route('**/api/v1/cafes/search', async (route) => {
      count += 1;
      await route.fulfill({
        status: 503,
        json: {
          error: {
            code: 'PROVIDER_CAPACITY_EXHAUSTED',
            message: 'monthly cap reached',
            requestId: 'r2',
          },
        },
      });
    });

    await page.goto('/');
    await setManualLocation(page);

    const alert = page.getByRole('alert');
    await expect(alert).toContainText(/temporarily unavailable/i);
    await expect(alert).not.toContainText(/monthly cap/);

    // no crash, no loop, favourites route still reachable
    await page.waitForTimeout(300);
    expect(count).toBe(1);
    await page.getByRole('link', { name: 'Favorites' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Favorites' })).toBeVisible();
  });
});
