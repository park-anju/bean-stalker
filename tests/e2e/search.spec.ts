import { expect, test, type Page } from '@playwright/test';

// Bean Stalker-shaped CafeSearchResponse (not Google-shaped) — the frontend
// consumes this contract, never raw provider JSON.
const HAPPY_RESPONSE = {
  searchCenter: { latitude: 1.55, longitude: 110.36 },
  fetchedAt: '2026-08-28T02:00:00.000Z',
  cafes: [
    {
      placeId: 'places/kopi-kenangan',
      name: 'Kopi Kenangan',
      location: { latitude: 1.5551, longitude: 110.3489 },
      formattedAddress: '12 Jalan Padungan, Kuching, Sarawak',
      rating: 4.8,
      userRatingCount: 342,
      priceLevel: 'PRICE_LEVEL_MODERATE',
      openStatus: 'OPEN',
      googleMapsUri: 'https://maps.google.com/?cid=1111111111111111111',
      distanceMeters: 1160,
    },
    {
      placeId: 'places/unrated-roastery',
      name: 'Unrated Roastery',
      location: { latitude: 1.556, longitude: 110.351 },
      openStatus: 'UNKNOWN',
      distanceMeters: 940,
    },
  ],
};

const EMPTY_RESPONSE = {
  searchCenter: { latitude: 1.55, longitude: 110.36 },
  fetchedAt: '2026-08-28T02:00:00.000Z',
  cafes: [],
};

/** Block the billable Google Maps JS script so no e2e run ever loads it. */
async function blockGoogleMaps(page: Page) {
  await page.route(/maps\.googleapis\.com/, (route) => route.abort());
}

async function setManualLocation(page: Page) {
  await page.getByLabel('Latitude').fill('1.55');
  await page.getByLabel('Longitude').fill('110.36');
  await page.getByRole('button', { name: 'Use this location' }).click();
}

test.describe('cafe search — results journey', () => {
  test('resolves a location, issues one Bean Stalker request, and renders an accessible list', async ({
    page,
  }) => {
    await blockGoogleMaps(page);

    const requests: string[] = [];
    await page.route('**/api/v1/cafes/search', async (route) => {
      requests.push(route.request().method());
      const body = route.request().postDataJSON();
      expect(body).toMatchObject({ center: { latitude: 1.55, longitude: 110.36 } });
      await route.fulfill({ json: HAPPY_RESPONSE });
    });

    await page.goto('/');
    await setManualLocation(page);

    const list = page.getByRole('region', { name: 'Cafe results' });
    await expect(list.getByRole('heading', { name: '2 cafes found' })).toBeVisible();
    await expect(list.getByText('4.8 ★ (342)')).toBeVisible();
    await expect(list.getByText('1.2 km away')).toBeVisible();
    await expect(list.getByText('No rating data')).toBeVisible();
    await expect(list.getByText('Hours unavailable')).toBeVisible();
    await expect(list.getByRole('link', { name: /open in google maps/i }).first()).toHaveAttribute(
      'href',
      /maps\.google\.com/,
    );

    expect(requests).toEqual(['POST']);
  });

  test('card selection is keyboard operable and does not issue another search', async ({
    page,
  }) => {
    await blockGoogleMaps(page);
    let searchCount = 0;
    await page.route('**/api/v1/cafes/search', async (route) => {
      searchCount += 1;
      await route.fulfill({ json: HAPPY_RESPONSE });
    });

    await page.goto('/');
    await setManualLocation(page);

    const card = page.getByRole('button', { name: 'Kopi Kenangan', exact: true });
    await card.focus();
    await page.keyboard.press('Enter');
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Selected')).toBeVisible();

    expect(searchCount).toBe(1);
  });

  test('the results list still works when the map cannot load', async ({ page }) => {
    await blockGoogleMaps(page);
    await page.route('**/api/v1/cafes/search', (route) => route.fulfill({ json: HAPPY_RESPONSE }));

    await page.goto('/');
    await setManualLocation(page);

    await expect(page.getByRole('status', { name: 'Map status' })).toContainText(
      /map is unavailable/i,
    );
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Kopi Kenangan', exact: true })).toBeVisible();
  });

  test('an empty result is shown as empty, not as an error', async ({ page }) => {
    await blockGoogleMaps(page);
    await page.route('**/api/v1/cafes/search', (route) => route.fulfill({ json: EMPTY_RESPONSE }));

    await page.goto('/');
    await setManualLocation(page);

    await expect(page.getByText(/no cafes were found/i)).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Cafe results' })).toHaveCount(0);
  });

  test('a provider error shows a retryable alert; retry issues exactly one more request', async ({
    page,
  }) => {
    await blockGoogleMaps(page);
    let searchCount = 0;
    await page.route('**/api/v1/cafes/search', async (route) => {
      searchCount += 1;
      if (searchCount === 1) {
        await route.fulfill({
          status: 503,
          json: { error: { code: 'PROVIDER_UNAVAILABLE', message: 'down', requestId: 'r1' } },
        });
      } else {
        await route.fulfill({ json: HAPPY_RESPONSE });
      }
    });

    await page.goto('/');
    await setManualLocation(page);

    const alert = page.getByRole('alert');
    await expect(alert).toContainText(/temporarily unavailable/i);
    await page.getByRole('button', { name: /retry search/i }).click();

    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();
    expect(searchCount).toBe(2);
  });

  test('remains usable at a 375px viewport with no horizontal overflow', async ({ page }) => {
    await blockGoogleMaps(page);
    await page.route('**/api/v1/cafes/search', (route) => route.fulfill({ json: HAPPY_RESPONSE }));

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await setManualLocation(page);
    await expect(page.getByRole('button', { name: 'Kopi Kenangan', exact: true })).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
