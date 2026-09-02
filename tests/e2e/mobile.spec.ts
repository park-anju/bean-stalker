import { expect, test, type Page } from '@playwright/test';

// A Bean Stalker-shaped response with deliberately hostile content: a very
// long name, a very long non-ASCII address, an unknown open status and a
// missing rating — the 320px layout must survive all of it.
const STRESS_RESPONSE = {
  searchCenter: { latitude: 1.55, longitude: 110.36 },
  fetchedAt: '2026-08-28T02:00:00.000Z',
  cafes: [
    {
      placeId: 'places/short',
      name: 'Kopi Kenangan',
      location: { latitude: 1.5551, longitude: 110.3489 },
      formattedAddress: '12 Jalan Padungan, Kuching',
      rating: 4.8,
      userRatingCount: 342,
      openStatus: 'OPEN',
      googleMapsUri: 'https://maps.google.com/?cid=1',
      distanceMeters: 1160,
    },
    {
      placeId: 'places/long',
      name: 'Warung Kopi Ñoño 北京咖啡 — A Very Long Cafe Name That Keeps Going Well Past The Edge Of A Narrow Phone Screen Indeed',
      location: { latitude: 1.556, longitude: 110.351 },
      formattedAddress:
        'Lot 99999, Jalan Batu Kawa–Matang Yang Sangat Panjang Sekali Namanya Sampai Tak Muat, Taman Perindustrian Demak Laut Fasa 3, 93050 Kuching, Sarawak, Malaysia',
      openStatus: 'UNKNOWN',
      distanceMeters: 12450,
    },
  ],
};

async function blockGoogleMaps(page: Page) {
  await page.route(/maps\.googleapis\.com/, (route) => route.abort());
}

async function noPageOverflow(page: Page) {
  // A 1px tolerance absorbs legitimate sub-pixel rounding.
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1,
  );
}

async function setManualLocation(page: Page) {
  await page.getByLabel('Latitude').fill('1.55');
  await page.getByLabel('Longitude').fill('110.36');
  await page.getByRole('button', { name: 'Use this location' }).click();
}

test.describe('mobile — 320px core flow', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('location → search → filter → favourite → favourites page, with no horizontal overflow', async ({
    page,
  }) => {
    await blockGoogleMaps(page);
    let searchCount = 0;
    await page.route('**/api/v1/cafes/search', async (route) => {
      searchCount += 1;
      await route.fulfill({ json: STRESS_RESPONSE });
    });

    await page.goto('/');
    expect(await noPageOverflow(page)).toBe(true);

    await setManualLocation(page);
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();
    expect(await noPageOverflow(page)).toBe(true);

    // A local filter change must not issue another provider request.
    await page.getByLabel('Minimum rating').selectOption('4+');
    await expect(page.getByRole('button', { name: 'Kopi Kenangan', exact: true })).toBeVisible();
    expect(await noPageOverflow(page)).toBe(true);

    // The "Open now only" checkbox meets the WCAG 2.2 target-size minimum.
    const checkboxBox = await page.getByLabel('Open now only').boundingBox();
    expect(checkboxBox?.width ?? 0).toBeGreaterThanOrEqual(23.5);
    expect(checkboxBox?.height ?? 0).toBeGreaterThanOrEqual(23.5);
    await page.getByLabel('Open now only').check();

    await page.getByRole('button', { name: 'Add Kopi Kenangan to favourites' }).click();
    await expect(
      page.getByRole('button', { name: 'Remove Kopi Kenangan from favourites' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Favorites' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Favorites' })).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Saved cafes' }).getByText('Kopi Kenangan').first(),
    ).toBeVisible();
    expect(await noPageOverflow(page)).toBe(true);

    expect(searchCount).toBe(1);
  });

  test('long / non-ASCII / missing-data content does not cause page overflow', async ({ page }) => {
    await blockGoogleMaps(page);
    await page.route('**/api/v1/cafes/search', (route) => route.fulfill({ json: STRESS_RESPONSE }));

    await page.goto('/');
    await setManualLocation(page);

    await expect(page.getByText(/A Very Long Cafe Name/)).toBeVisible();
    await expect(page.getByText(/Taman Perindustrian Demak Laut/)).toBeVisible();
    await expect(page.getByText('Hours unavailable')).toBeVisible();
    await expect(page.getByText('No rating data')).toBeVisible();

    expect(await noPageOverflow(page)).toBe(true);
  });
});

test.describe('mobile — geolocation denied fallback', () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test('a denied permission surfaces an assertive alert and the manual form still works', async ({
    page,
  }) => {
    await blockGoogleMaps(page);
    await page.route('**/api/v1/cafes/search', (route) => route.fulfill({ json: STRESS_RESPONSE }));

    await page.goto('/');
    // No geolocation permission granted → getCurrentPosition rejects.
    await page.getByRole('button', { name: 'Use my current location' }).click();

    const alert = page.getByRole('alert');
    await expect(alert).toContainText(/permission was denied/i);

    // GPS denial must not trap the user — manual entry remains fully usable.
    await setManualLocation(page);
    await expect(page.getByRole('status', { name: 'Location status' })).toHaveText(
      'Using a custom location (1.5500, 110.3600).',
    );
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();
    expect(await noPageOverflow(page)).toBe(true);
  });
});

test.describe('keyboard-only operation', () => {
  test('a keyboard user can set a location, search, select a card and favourite it', async ({
    page,
  }) => {
    await blockGoogleMaps(page);
    let searchCount = 0;
    await page.route('**/api/v1/cafes/search', async (route) => {
      searchCount += 1;
      await route.fulfill({ json: STRESS_RESPONSE });
    });

    await page.goto('/');

    // Tab from the document start reaches the skip link first.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

    // Reach the coordinate fields by keyboard and fill them.
    await page.getByLabel('Latitude').focus();
    await page.keyboard.type('1.55');
    await page.keyboard.press('Tab');
    await page.keyboard.type('110.36');
    await page.getByRole('button', { name: 'Use this location' }).focus();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();

    // Select the first card with the keyboard.
    const card = page.getByRole('button', { name: 'Kopi Kenangan', exact: true });
    await card.focus();
    await page.keyboard.press('Enter');
    await expect(card).toHaveAttribute('aria-pressed', 'true');

    // Tab moves to that card's favourite button; Space toggles it.
    await page.keyboard.press('Tab');
    const fav = page.getByRole('button', { name: 'Add Kopi Kenangan to favourites' });
    await expect(fav).toBeFocused();
    await page.keyboard.press('Space');
    await expect(
      page.getByRole('button', { name: 'Remove Kopi Kenangan from favourites' }),
    ).toBeVisible();

    // Selecting and favouriting never issued another search.
    expect(searchCount).toBe(1);
  });

  test('keyboard focus lands on controls with a visible focus outline', async ({ page }) => {
    await blockGoogleMaps(page);
    await page.route('**/api/v1/cafes/search', (route) => route.fulfill({ json: STRESS_RESPONSE }));

    await page.goto('/');
    await setManualLocation(page);
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();

    // Tab through the whole page from the top; every focus stop that is one
    // of our own interactive controls must paint a non-zero outline
    // (keyboard navigation reliably triggers :focus-visible).
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    let checked = 0;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const tag = el.tagName;
        if (!['A', 'BUTTON', 'INPUT', 'SELECT'].includes(tag)) return null;
        // Ignore focus that has entered the third-party Google map canvas.
        if (el.closest('.cafe-map__surface')) return null;
        const s = getComputedStyle(el);
        return { outline: `${s.outlineStyle} ${s.outlineWidth}`, w: parseFloat(s.outlineWidth) };
      });
      if (!info) continue;
      expect(info.outline).not.toContain('none');
      expect(info.w).toBeGreaterThanOrEqual(1);
      checked += 1;
    }
    expect(checked).toBeGreaterThanOrEqual(6);
  });
});
