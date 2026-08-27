import { expect, test, type Page } from '@playwright/test';

const RESPONSE = {
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
    {
      placeId: 'places/old-town',
      name: 'Old Town Cafe',
      location: { latitude: 1.5525, longitude: 110.3465 },
      rating: 4.2,
      userRatingCount: 210,
      openStatus: 'CLOSED',
      distanceMeters: 900,
    },
    {
      placeId: 'places/unrated',
      name: 'Unrated Roastery',
      location: { latitude: 1.556, longitude: 110.351 },
      openStatus: 'UNKNOWN',
      distanceMeters: 700,
    },
  ],
};

async function blockGoogleMaps(page: Page) {
  await page.route(/maps\.googleapis\.com/, (route) => route.abort());
}

/** Routes the search endpoint and returns a live request counter. */
async function stubSearch(page: Page) {
  const counter = { count: 0 };
  await page.route('**/api/v1/cafes/search', async (route) => {
    counter.count += 1;
    await route.fulfill({ json: RESPONSE });
  });
  return counter;
}

async function setManualLocation(page: Page) {
  await page.getByLabel('Latitude').fill('1.55');
  await page.getByLabel('Longitude').fill('110.36');
  await page.getByRole('button', { name: 'Use this location' }).click();
}

function cardNames(page: Page) {
  return page
    .getByRole('region', { name: 'Cafe results' })
    .getByRole('listitem')
    .locator('button[aria-pressed]')
    .allInnerTexts();
}

test.describe('local filtering & sorting', () => {
  test('rating filter, Open Now and sort each change the list with zero extra API requests', async ({
    page,
  }) => {
    await blockGoogleMaps(page);
    const search = await stubSearch(page);

    await page.goto('/');
    await setManualLocation(page);
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();
    expect(await cardNames(page)).toEqual(['Unrated Roastery', 'Old Town Cafe', 'Kopi Kenangan']);
    expect(search.count).toBe(1);

    await page.getByLabel('Minimum rating').selectOption('4.5+');
    await expect(page.getByRole('button', { name: /Kopi Kenangan/ })).toBeVisible();
    expect(await cardNames(page)).toEqual(['Kopi Kenangan']);

    await page.getByLabel('Minimum rating').selectOption('Any rating');
    await page.getByLabel('Open now only').check();
    expect(await cardNames(page)).toEqual(['Kopi Kenangan']);
    await page.getByLabel('Open now only').uncheck();

    await page.getByLabel('Sort by').selectOption('Rating');
    expect(await cardNames(page)).toEqual(['Kopi Kenangan', 'Old Town Cafe', 'Unrated Roastery']);

    await page.getByRole('button', { name: 'Reset filters' }).click();
    expect(await cardNames(page)).toEqual(['Unrated Roastery', 'Old Town Cafe', 'Kopi Kenangan']);

    expect(search.count).toBe(1);
  });

  test('a filter that hides everything shows the filtered-empty message, not the API-empty one', async ({
    page,
  }) => {
    await blockGoogleMaps(page);
    await page.route('**/api/v1/cafes/search', (route) =>
      route.fulfill({
        json: {
          ...RESPONSE,
          cafes: RESPONSE.cafes.map((c) => ({ ...c, rating: 4.0, openStatus: 'OPEN' })),
        },
      }),
    );

    await page.goto('/');
    await setManualLocation(page);
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();

    await page.getByLabel('Minimum rating').selectOption('4.5+');
    await expect(page.getByText(/no cafes match your current filters/i)).toBeVisible();
    await expect(page.getByText(/no cafes were found near this location/i)).toHaveCount(0);
  });

  test('controls remain usable at 375px with no horizontal overflow', async ({ page }) => {
    await blockGoogleMaps(page);
    await stubSearch(page);
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await setManualLocation(page);
    await expect(page.getByLabel('Minimum rating')).toBeVisible();
    await page.getByLabel('Open now only').check();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
