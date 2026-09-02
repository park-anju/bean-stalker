import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Automated WCAG scanning with axe-core. This SUPPLEMENTS the manual
 * keyboard / mobile / screen-reader review recorded in the H08 handoff — a
 * clean axe run is not a claim of full accessibility, only that a known set
 * of machine-detectable issues is absent.
 *
 * The Google Maps canvas is third-party and injected outside Bean Stalker's
 * control; nodes inside `.cafe-map__surface` are excluded so Google's own
 * DOM cannot produce meaningless failures. The rest of the map region
 * (Bean Stalker's status text and container) is still scanned.
 */
const RESPONSE = {
  searchCenter: { latitude: 1.55, longitude: 110.36 },
  fetchedAt: '2026-08-28T02:00:00.000Z',
  cafes: [
    {
      placeId: 'places/kopi',
      name: 'Kopi Kenangan',
      location: { latitude: 1.5551, longitude: 110.3489 },
      formattedAddress: '12 Jalan Padungan, Kuching, Sarawak',
      rating: 4.8,
      userRatingCount: 342,
      priceLevel: 'PRICE_LEVEL_MODERATE',
      openStatus: 'OPEN',
      googleMapsUri: 'https://maps.google.com/?cid=1',
      distanceMeters: 1160,
    },
    {
      placeId: 'places/unrated',
      name: 'Unrated Roastery',
      location: { latitude: 1.556, longitude: 110.351 },
      openStatus: 'UNKNOWN',
      distanceMeters: 940,
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

function scan(page: Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .exclude('.cafe-map__surface');
}

test.describe('accessibility (axe-core) — representative states', () => {
  test('Discovery initial state', async ({ page }) => {
    await blockGoogleMaps(page);
    await page.goto('/');
    const results = await scan(page).analyze();
    expect(results.violations).toEqual([]);
  });

  test('Discovery with results, at a 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await blockGoogleMaps(page);
    await page.route('**/api/v1/cafes/search', (route) => route.fulfill({ json: RESPONSE }));
    await page.goto('/');
    await setManualLocation(page);
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();
    const results = await scan(page).analyze();
    expect(results.violations).toEqual([]);
  });

  test('filtered-to-empty state', async ({ page }) => {
    await blockGoogleMaps(page);
    // Every cafe rated below the filter threshold so the filter hides them all.
    await page.route('**/api/v1/cafes/search', (route) =>
      route.fulfill({
        json: { ...RESPONSE, cafes: RESPONSE.cafes.map((c) => ({ ...c, rating: 3.9 })) },
      }),
    );
    await page.goto('/');
    await setManualLocation(page);
    await page.getByLabel('Minimum rating').selectOption('4.5+');
    await expect(page.getByText(/no cafes match your current filters/i)).toBeVisible();
    const results = await scan(page).analyze();
    expect(results.violations).toEqual([]);
  });

  test('empty search result', async ({ page }) => {
    await blockGoogleMaps(page);
    await page.route('**/api/v1/cafes/search', (route) =>
      route.fulfill({ json: { ...RESPONSE, cafes: [] } }),
    );
    await page.goto('/');
    await setManualLocation(page);
    await expect(page.getByText(/no cafes were found/i)).toBeVisible();
    const results = await scan(page).analyze();
    expect(results.violations).toEqual([]);
  });

  test('search error state', async ({ page }) => {
    await blockGoogleMaps(page);
    await page.route('**/api/v1/cafes/search', (route) =>
      route.fulfill({
        status: 503,
        json: { error: { code: 'PROVIDER_UNAVAILABLE', message: 'down', requestId: 'r' } },
      }),
    );
    await page.goto('/');
    await setManualLocation(page);
    await expect(page.getByRole('alert')).toBeVisible();
    const results = await scan(page).analyze();
    expect(results.violations).toEqual([]);
  });

  test('location error state (invalid manual coordinates)', async ({ page }) => {
    await blockGoogleMaps(page);
    await page.goto('/');
    await page.getByLabel('Latitude').fill('999');
    await page.getByLabel('Longitude').fill('0');
    await page.getByRole('button', { name: 'Use this location' }).click();
    await expect(page.getByRole('alert')).toContainText(/enter a valid latitude/i);
    const results = await scan(page).analyze();
    expect(results.violations).toEqual([]);
  });

  test('Favorites page with a saved record', async ({ page }) => {
    await blockGoogleMaps(page);
    await page.route('**/api/v1/cafes/search', (route) => route.fulfill({ json: RESPONSE }));
    await page.goto('/');
    await setManualLocation(page);
    await page.getByRole('button', { name: 'Add Kopi Kenangan to favourites' }).click();
    await page.getByRole('link', { name: 'Favorites' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Favorites' })).toBeVisible();
    const results = await scan(page).analyze();
    expect(results.violations).toEqual([]);
  });

  test('Favorites page empty state', async ({ page }) => {
    await page.goto('/favorites');
    const results = await scan(page).analyze();
    expect(results.violations).toEqual([]);
  });

  test('404 page', async ({ page }) => {
    await page.goto('/no-such-route');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    const results = await scan(page).analyze();
    expect(results.violations).toEqual([]);
  });
});
