import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const RESPONSE = {
  searchCenter: { latitude: 1.55, longitude: 110.36 },
  fetchedAt: '2026-09-19T01:00:00.000Z',
  cafes: [
    {
      placeId: 'places/kopi',
      name: 'Kopi Kenangan',
      location: { latitude: 1.5551, longitude: 110.3489 },
      openStatus: 'OPEN',
      distanceMeters: 1160,
    },
  ],
};

async function blockGoogleMaps(page: Page) {
  await page.route(/maps\.googleapis\.com/, (route) => route.abort());
}

async function mockGeolocationError(context: BrowserContext, code: number, message: string) {
  await context.addInitScript(
    ({ errorCode, errorMessage }) => {
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition: (_success: PositionCallback, error?: PositionErrorCallback | null) =>
            error?.({ code: errorCode, message: errorMessage } as GeolocationPositionError),
        },
      });
    },
    { errorCode: code, errorMessage: message },
  );
}

async function countGeolocationCalls(context: BrowserContext) {
  await context.addInitScript(() => {
    const original = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
    const state = window as Window & { __beanStalkerGeolocationCalls?: number };
    state.__beanStalkerGeolocationCalls = 0;
    navigator.geolocation.getCurrentPosition = (...args) => {
      state.__beanStalkerGeolocationCalls = (state.__beanStalkerGeolocationCalls ?? 0) + 1;
      return original(...args);
    };
  });
}

async function geolocationCallCount(page: Page) {
  return page.evaluate(
    () =>
      (window as Window & { __beanStalkerGeolocationCalls?: number })
        .__beanStalkerGeolocationCalls ?? 0,
  );
}

test.describe('automatic location resolution', () => {
  test('requests current location and starts exactly one cafe search without a Search click', async ({
    context,
    page,
  }) => {
    await countGeolocationCalls(context);
    await blockGoogleMaps(page);
    let searchCount = 0;
    await page.route('**/api/v1/cafes/search', async (route) => {
      searchCount += 1;
      expect(route.request().postDataJSON()).toMatchObject({
        center: { latitude: 1.55, longitude: 110.36 },
      });
      await route.fulfill({ json: RESPONSE });
    });

    await page.goto('/');

    await expect
      .poll(() =>
        page.evaluate(
          async () => (await navigator.permissions.query({ name: 'geolocation' })).state,
        ),
      )
      .toBe('granted');
    await expect(page.getByRole('status', { name: 'Location status' })).toHaveText(
      'Location found.',
    );
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();
    expect(await geolocationCallCount(page)).toBe(1);
    expect(searchCount).toBe(1);
    await expect(page.getByRole('button', { name: /search/i })).toHaveCount(0);
  });

  test('permission prompt state stays pending until Web Geolocation resolves', async ({
    context,
    page,
  }) => {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'permissions', {
        configurable: true,
        value: {
          query: async () => ({ state: 'prompt' }),
        },
      });
      const state = window as Window & { __beanStalkerGeolocationCalls?: number };
      state.__beanStalkerGeolocationCalls = 0;
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition: (success: PositionCallback) => {
            state.__beanStalkerGeolocationCalls = (state.__beanStalkerGeolocationCalls ?? 0) + 1;
            window.setTimeout(
              () =>
                success({
                  coords: { latitude: 1.55, longitude: 110.36 },
                } as GeolocationPosition),
              100,
            );
          },
        },
      });
    });
    let searchCount = 0;
    await page.route('**/api/v1/cafes/search', async (route) => {
      searchCount += 1;
      await route.fulfill({ json: RESPONSE });
    });

    await page.goto('/');

    await expect(page.getByRole('status', { name: 'Location status' })).toContainText(
      /finding your location/i,
    );
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();
    expect(await geolocationCallCount(page)).toBe(1);
    expect(searchCount).toBe(1);
  });

  test('does not require the Permissions API when Web Geolocation succeeds', async ({
    context,
    page,
  }) => {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'permissions', {
        configurable: true,
        value: undefined,
      });
    });
    await blockGoogleMaps(page);
    let searchCount = 0;
    await page.route('**/api/v1/cafes/search', async (route) => {
      searchCount += 1;
      await route.fulfill({ json: RESPONSE });
    });

    await page.goto('/');

    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();
    expect(searchCount).toBe(1);
  });

  test('does not expose raw latitude or longitude fields', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('Latitude')).toHaveCount(0);
    await expect(page.getByLabel('Longitude')).toHaveCount(0);
    await expect(page.getByRole('spinbutton')).toHaveCount(0);
  });

  test('remains usable at a mobile viewport with no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.getByRole('status', { name: 'Location status' })).toHaveText(
      'Location found.',
    );
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('Favorites route does not request location', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page.getByRole('heading', { level: 1, name: 'Favorites' })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Location status' })).toHaveCount(0);
  });
});

test.describe('location failures', () => {
  test('known denied permission shows settings guidance, retry, and performs no search', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      geolocation: { latitude: 1.55, longitude: 110.36 },
      permissions: [],
    });
    await countGeolocationCalls(context);
    const page = await context.newPage();
    let searchCount = 0;
    await page.route('**/api/v1/cafes/search', (route) => {
      searchCount += 1;
      return route.fulfill({ json: RESPONSE });
    });

    await page.goto('/');

    await expect
      .poll(() =>
        page.evaluate(
          async () => (await navigator.permissions.query({ name: 'geolocation' })).state,
        ),
      )
      .toBe('denied');
    await expect(page.getByRole('alert')).toContainText(/browser settings/i);
    await expect(page.getByRole('button', { name: 'Try location again' })).toBeVisible();
    expect(await geolocationCallCount(page)).toBe(1);
    await page.waitForTimeout(100);
    expect(await geolocationCallCount(page)).toBe(1);
    expect(searchCount).toBe(0);
    await context.close();
  });

  test('explicit retry succeeds after permission is granted in browser settings', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      geolocation: { latitude: 1.55, longitude: 110.36 },
      permissions: [],
    });
    const page = await context.newPage();
    await blockGoogleMaps(page);
    let searchCount = 0;
    await page.route('**/api/v1/cafes/search', async (route) => {
      searchCount += 1;
      await route.fulfill({ json: RESPONSE });
    });
    await page.goto('/');
    await expect(page.getByRole('alert')).toBeVisible();

    await context.grantPermissions(['geolocation']);
    await page.getByRole('button', { name: 'Try location again' }).click();

    await expect(page.getByRole('region', { name: 'Cafe results' })).toBeVisible();
    expect(searchCount).toBe(1);
    await context.close();
  });

  for (const scenario of [
    { code: 2, expected: /could not access your device location/i },
    { code: 3, expected: /took too long/i },
    { code: 99, expected: /could not access your device location/i },
  ]) {
    test(`geolocation error ${scenario.code} leaves loading and does not search`, async ({
      context,
      page,
    }) => {
      await mockGeolocationError(context, scenario.code, 'raw browser detail');
      let searchCount = 0;
      await page.route('**/api/v1/cafes/search', (route) => {
        searchCount += 1;
        return route.fulfill({ json: RESPONSE });
      });

      await page.goto('/');

      await expect(page.getByRole('alert')).toContainText(scenario.expected);
      await expect(page.getByRole('alert')).not.toContainText('raw browser detail');
      await expect(page.getByRole('status', { name: 'Location status' })).toBeEmpty();
      expect(searchCount).toBe(0);
    });
  }

  test('unsupported geolocation shows a bounded non-retryable state', async ({ context, page }) => {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: undefined,
      });
    });
    await page.goto('/');
    await expect(page.getByRole('alert')).toContainText(/isn't available in this browser/i);
    await expect(page.getByRole('button', { name: 'Try location again' })).toHaveCount(0);
  });

  test('insecure context is not misreported as permission denial', async ({ context, page }) => {
    await context.addInitScript(() => {
      Object.defineProperty(window, 'isSecureContext', {
        configurable: true,
        value: false,
      });
    });
    let searchCount = 0;
    await page.route('**/api/v1/cafes/search', (route) => {
      searchCount += 1;
      return route.fulfill({ json: RESPONSE });
    });

    await page.goto('/');

    await expect(page.getByRole('alert')).toContainText(/secure connection/i);
    await expect(page.getByRole('alert')).toContainText(/HTTPS/i);
    await expect(page.getByRole('alert')).not.toContainText(/browser settings/i);
    await expect(page.getByRole('button', { name: 'Try location again' })).toHaveCount(0);
    expect(searchCount).toBe(0);
  });
});
