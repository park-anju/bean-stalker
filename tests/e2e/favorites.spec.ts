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
      googleMapsUri: 'https://maps.google.com/?cid=1',
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

// Each Playwright test runs in a fresh browser context, so localStorage starts
// empty for every test.

test.describe('favourites — local persistence', () => {
  test('a favourite survives a page reload and appears on the Favorites page', async ({ page }) => {
    await blockGoogleMaps(page);
    const search = await stubSearch(page);

    await page.goto('/');
    await setManualLocation(page);
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();

    await page.getByRole('button', { name: 'Add Kopi Kenangan to favourites' }).click();
    await expect(
      page.getByRole('button', { name: 'Remove Kopi Kenangan from favourites' }),
    ).toHaveAttribute('aria-pressed', 'true');

    // Reload Discovery: re-entering the location is a genuine new search, but
    // the favourite persisted through the reload.
    await page.reload();
    await setManualLocation(page);
    await expect(
      page.getByRole('button', { name: 'Remove Kopi Kenangan from favourites' }),
    ).toHaveAttribute('aria-pressed', 'true');

    // From here, no favourites interaction may cause a provider request.
    const countBeforeFavourites = search.count;

    await page.getByRole('link', { name: 'Favorites' }).click();
    await expect(
      page.getByRole('list', { name: 'Saved cafes' }).getByText('Kopi Kenangan', { exact: true }),
    ).toBeVisible();

    await page.reload(); // reloading /favorites still renders the persisted snapshot
    await expect(
      page.getByRole('list', { name: 'Saved cafes' }).getByText('Kopi Kenangan', { exact: true }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Discover' }).click();

    expect(search.count).toBe(countBeforeFavourites);
  });

  test('removing the last favourite returns the empty state; favourite ops cause no search', async ({
    page,
  }) => {
    await blockGoogleMaps(page);
    const search = await stubSearch(page);

    await page.goto('/');
    await setManualLocation(page);
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();

    const add = page.getByRole('button', { name: 'Add Kopi Kenangan to favourites' });
    await add.click();
    await page.getByRole('button', { name: 'Remove Kopi Kenangan from favourites' }).click();
    await add.click();

    await page.getByRole('link', { name: 'Favorites' }).click();
    await page.getByRole('button', { name: 'Remove Kopi Kenangan from favourites' }).click();
    await expect(page.getByText(/no favourites saved yet/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /find cafes to save/i })).toBeVisible();

    expect(search.count).toBe(1);
  });

  test('the Favorites page works with no location set and no map', async ({ page }) => {
    await blockGoogleMaps(page);
    await stubSearch(page);

    await page.goto('/favorites');

    await expect(page.getByRole('heading', { level: 1, name: 'Favorites' })).toBeVisible();
    await expect(page.getByText(/no favourites saved yet/i)).toBeVisible();
    await expect(page.getByLabel('Latitude')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Map' })).toHaveCount(0);
  });

  test('favourite controls remain usable at 375px', async ({ page }) => {
    await blockGoogleMaps(page);
    await stubSearch(page);
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await setManualLocation(page);

    await page.getByRole('button', { name: 'Add Kopi Kenangan to favourites' }).click();
    await expect(
      page.getByRole('button', { name: 'Remove Kopi Kenangan from favourites' }),
    ).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
