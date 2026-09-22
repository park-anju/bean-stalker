import { StrictMode, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cafe, CafeSearchResponse } from '@bean-stalker/contracts';
import { EMPTY_FAVORITE_STORE } from '@bean-stalker/domain';
import { DiscoveryPage } from './DiscoveryPage.js';
import { FavoritesProvider } from '../favorites/FavoritesProvider.js';
import { searchCafes } from '../search/apiClient.js';
import { LocationProvider } from '../location/LocationProvider.js';
import type { GeolocationAdapter } from '../location/browserGeolocation.js';

vi.mock('../search/apiClient.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../search/apiClient.js')>();
  return { ...actual, searchCafes: vi.fn() };
});

// Stub the map so these tests need no google.maps global; it echoes the props
// that must stay in sync with the list.
vi.mock('../map/CafeMap.js', () => ({
  CafeMap: ({
    cafes,
    selectedCafeId,
  }: {
    cafes: { placeId: string }[];
    selectedCafeId: string | null;
  }) => (
    <div data-testid="map">
      <span data-testid="map-markers">{cafes.map((c) => c.placeId).join(',')}</span>
      <span data-testid="map-selected">{selectedCafeId ?? 'none'}</span>
    </div>
  ),
}));

const searchCafesMock = vi.mocked(searchCafes);

function response(cafes: Cafe[]): CafeSearchResponse {
  return {
    searchCenter: { latitude: 1.55, longitude: 110.36 },
    fetchedAt: '2026-08-28T02:00:00.000Z',
    cafes,
  };
}

const KOPI: Cafe = {
  placeId: 'k',
  name: 'Kopi Kenangan',
  location: { latitude: 1.5551, longitude: 110.3489 },
  rating: 4.8,
  userRatingCount: 342,
  openStatus: 'OPEN',
  distanceMeters: 1160,
};
const UNRATED: Cafe = {
  placeId: 'u',
  name: 'Unrated Roastery',
  location: { latitude: 1.556, longitude: 110.351 },
  openStatus: 'UNKNOWN',
  distanceMeters: 940,
};
const OLD_TOWN: Cafe = {
  placeId: 'o',
  name: 'Old Town Cafe',
  location: { latitude: 1.5525, longitude: 110.3465 },
  rating: 4.2,
  userRatingCount: 210,
  openStatus: 'CLOSED',
  distanceMeters: 1430,
};

const POSITION = {
  coords: { latitude: 1.55, longitude: 110.36 },
} as GeolocationPosition;

function makeAdapter(options?: {
  secure?: boolean;
  getCurrentPosition?: GeolocationAdapter['getCurrentPosition'];
}): GeolocationAdapter {
  return {
    isSecureContext: vi.fn(() => options?.secure ?? true),
    isSupported: vi.fn(() => true),
    getCurrentPosition: vi.fn(options?.getCurrentPosition ?? (() => Promise.resolve(POSITION))),
  };
}

function renderPage(options?: {
  adapter?: GeolocationAdapter;
  initialCenter?: { latitude: number; longitude: number };
  strict?: boolean;
}) {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <FavoritesProvider initialStore={EMPTY_FAVORITE_STORE}>
        <LocationProvider
          adapter={options?.adapter ?? makeAdapter()}
          initialCenter={options?.initialCenter}
        >
          <MemoryRouter>{children}</MemoryRouter>
        </LocationProvider>
      </FavoritesProvider>
    </QueryClientProvider>
  );
  return render(
    options?.strict ? (
      <StrictMode>
        <DiscoveryPage />
      </StrictMode>
    ) : (
      <DiscoveryPage />
    ),
    {
      wrapper,
    },
  );
}

async function resolveLocation(_user: ReturnType<typeof userEvent.setup>) {
  await screen.findByText('Location found.');
}

function idOf(name: string): string {
  if (name.includes('Kopi')) return 'k';
  if (name.includes('Unrated')) return 'u';
  if (name.includes('Old Town')) return 'o';
  return '?';
}

function listIds(): string[] {
  const region = screen.queryByRole('region', { name: 'Cafe results' });
  if (!region) return [];
  return within(region)
    .getAllByRole('listitem')
    .map((li) => idOf(li.querySelector('.cafe-card__name')?.textContent ?? ''));
}

function selectButton(name: string): HTMLElement {
  // A string `name` is an exact match — hits the select button, not the
  // favourite button whose name is "Add <cafe> to favourites".
  return screen.getByRole('button', { name });
}

function mapIds(): string[] {
  const text = screen.getByTestId('map-markers').textContent ?? '';
  return text ? text.split(',') : [];
}

beforeEach(() => {
  searchCafesMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('DiscoveryPage — automatic location acquisition', () => {
  it('requests location, commits it, automatically searches, and renders results', async () => {
    searchCafesMock.mockResolvedValue(response([KOPI]));
    const adapter = makeAdapter();

    renderPage({ adapter });

    expect(screen.getByRole('status', { name: 'Location status' })).toHaveTextContent(
      /finding your location/i,
    );
    await screen.findByRole('region', { name: 'Cafe results' });
    expect(adapter.getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(searchCafesMock).toHaveBeenCalledTimes(1);
    expect(searchCafesMock.mock.calls[0]?.[0].center).toEqual({
      latitude: 1.55,
      longitude: 110.36,
    });
  });

  it('uses an already-available center without duplicate acquisition or search', async () => {
    searchCafesMock.mockResolvedValue(response([KOPI]));
    const adapter = makeAdapter();

    const rendered = renderPage({
      adapter,
      initialCenter: { latitude: 1.55, longitude: 110.36 },
    });
    await screen.findByRole('region', { name: 'Cafe results' });
    rendered.rerender(<DiscoveryPage />);

    expect(adapter.isSecureContext).not.toHaveBeenCalled();
    expect(adapter.getCurrentPosition).not.toHaveBeenCalled();
    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });

  it('shows a denied state with retry and does not search without a location', async () => {
    const adapter = makeAdapter({
      getCurrentPosition: () => Promise.reject({ code: 1 }),
    });
    renderPage({ adapter });

    expect(await screen.findByRole('alert')).toHaveTextContent(/browser settings/i);
    expect(screen.getByRole('button', { name: 'Try location again' })).toBeVisible();
    expect(searchCafesMock).not.toHaveBeenCalled();
    expect(adapter.getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('keeps the finding state while first-visit geolocation is pending', async () => {
    let resolvePosition!: (position: GeolocationPosition) => void;
    const getCurrentPosition = vi.fn(
      () => new Promise<GeolocationPosition>((resolve) => (resolvePosition = resolve)),
    );
    searchCafesMock.mockResolvedValue(response([KOPI]));
    renderPage({ adapter: makeAdapter({ getCurrentPosition }) });

    expect(screen.getByRole('status', { name: 'Location status' })).toHaveTextContent(
      /finding your location/i,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(searchCafesMock).not.toHaveBeenCalled();

    resolvePosition(POSITION);
    await screen.findByRole('region', { name: 'Cafe results' });
    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    [2, /could not access your device location/i],
    [3, /took too long/i],
  ] as const)(
    'leaves loading and does not search after geolocation error %s',
    async (code, copy) => {
      const adapter = makeAdapter({
        getCurrentPosition: () => Promise.reject({ code }),
      });
      renderPage({ adapter });

      expect(await screen.findByRole('alert')).toHaveTextContent(copy);
      expect(screen.getByRole('status', { name: 'Location status' })).toBeEmptyDOMElement();
      expect(searchCafesMock).not.toHaveBeenCalled();
    },
  );

  it('retries only after user action, then automatically discovers cafes on success', async () => {
    searchCafesMock.mockResolvedValue(response([KOPI]));
    const getCurrentPosition = vi
      .fn<GeolocationAdapter['getCurrentPosition']>()
      .mockRejectedValueOnce({ code: 3 })
      .mockResolvedValueOnce(POSITION);
    const adapter = makeAdapter({ getCurrentPosition });
    const user = userEvent.setup();
    renderPage({ adapter });

    await screen.findByText(/took too long/i);
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(searchCafesMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Try location again' }));
    await screen.findByRole('region', { name: 'Cafe results' });
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });

  it('protects the initial location and cafe requests from Strict Mode and rerenders', async () => {
    searchCafesMock.mockResolvedValue(response([KOPI]));
    const adapter = makeAdapter();
    const rendered = renderPage({ adapter, strict: true });

    await screen.findByRole('region', { name: 'Cafe results' });
    rendered.rerender(
      <StrictMode>
        <DiscoveryPage />
      </StrictMode>,
    );

    expect(adapter.getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });

  it('does not expose raw latitude or longitude inputs', () => {
    renderPage({
      adapter: makeAdapter({ getCurrentPosition: () => Promise.reject({ code: 1 }) }),
    });
    expect(screen.queryByLabelText(/latitude/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/longitude/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });
});

describe('DiscoveryPage — local filtering & sorting (RM0: zero extra requests)', () => {
  it('transforms the fetched cafes locally; list and map stay in sync; one request total', async () => {
    searchCafesMock.mockResolvedValue(response([KOPI, UNRATED, OLD_TOWN]));
    const user = userEvent.setup();
    renderPage();
    await resolveLocation(user);
    await screen.findByRole('region', { name: 'Cafe results' });

    expect(listIds()).toEqual(['u', 'k', 'o']); // distance asc
    expect(mapIds()).toEqual(['u', 'k', 'o']);

    await user.selectOptions(screen.getByLabelText('Minimum rating'), '4.5+');
    expect(listIds()).toEqual(['k']);
    expect(mapIds()).toEqual(['k']);

    await user.selectOptions(screen.getByLabelText('Minimum rating'), 'Any rating');
    await user.click(screen.getByLabelText('Open now only'));
    expect(listIds()).toEqual(['k']); // only OPEN
    await user.click(screen.getByLabelText('Open now only'));

    await user.selectOptions(screen.getByLabelText('Sort by'), 'Rating');
    expect(listIds()).toEqual(['k', 'o', 'u']); // rating desc, unrated last
    expect(mapIds().slice().sort()).toEqual(['k', 'o', 'u']); // same marker set

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(listIds()).toEqual(['u', 'k', 'o']);

    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });

  it('distinguishes filtered-empty from API-empty, and issues no request for it', async () => {
    // Two cafes, both rating 4.0 — no "4.5+" match.
    searchCafesMock.mockResolvedValue(
      response([
        { ...KOPI, rating: 4.0 },
        { ...OLD_TOWN, rating: 4.0, openStatus: 'OPEN' },
      ]),
    );
    const user = userEvent.setup();
    renderPage();
    await resolveLocation(user);
    await screen.findByRole('region', { name: 'Cafe results' });

    await user.selectOptions(screen.getByLabelText('Minimum rating'), '4.5+');

    expect(screen.getByText(/no cafes match your current filters/i)).toBeInTheDocument();
    expect(screen.queryByText(/no cafes were found near this location/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Cafe results' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });

  it('clears a selection when a filter hides it, and does not re-select it when the filter is relaxed', async () => {
    searchCafesMock.mockResolvedValue(response([KOPI, OLD_TOWN])); // OLD_TOWN is CLOSED
    const user = userEvent.setup();
    renderPage();
    await resolveLocation(user);
    await screen.findByRole('region', { name: 'Cafe results' });

    await user.click(selectButton('Old Town Cafe'));
    expect(screen.getByTestId('map-selected')).toHaveTextContent('o');

    await user.click(screen.getByLabelText('Open now only'));
    expect(listIds()).toEqual(['k']); // Old Town hidden
    expect(screen.getByTestId('map-selected')).toHaveTextContent('none');

    await user.click(screen.getByLabelText('Open now only')); // relax
    expect(listIds().slice().sort()).toEqual(['k', 'o']);
    expect(screen.getByTestId('map-selected')).toHaveTextContent('none'); // not auto-reselected
    expect(screen.queryByText('Selected')).not.toBeInTheDocument();

    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });

  it('does not render the filter bar before a search has results', async () => {
    searchCafesMock.mockResolvedValue(response([]));
    const user = userEvent.setup();
    renderPage();
    await resolveLocation(user);

    await screen.findByText(/no cafes were found near this location/i);
    expect(screen.queryByRole('group', { name: 'Filter and sort cafes' })).not.toBeInTheDocument();
  });
});

describe('DiscoveryPage — favourites integration (RM0: zero extra requests)', () => {
  it('favouriting a result persists membership across filter/sort without a search, and does not select the cafe', async () => {
    searchCafesMock.mockResolvedValue(response([KOPI, UNRATED, OLD_TOWN]));
    const user = userEvent.setup();
    renderPage();
    await resolveLocation(user);
    await screen.findByRole('region', { name: 'Cafe results' });

    await user.click(screen.getByRole('button', { name: 'Add Old Town Cafe to favourites' }));
    expect(
      screen.getByRole('button', { name: 'Remove Old Town Cafe from favourites' }),
    ).toHaveAttribute('aria-pressed', 'true');
    // favouriting did not select the cafe / pan the map
    expect(screen.getByTestId('map-selected')).toHaveTextContent('none');

    // hide Old Town (4.2) with a rating filter — the favourite persists ...
    await user.selectOptions(screen.getByLabelText('Minimum rating'), '4.5+');
    expect(listIds()).toEqual(['k']);
    // ... and comes back still favourited when the filter is relaxed
    await user.selectOptions(screen.getByLabelText('Minimum rating'), 'Any rating');
    await user.selectOptions(screen.getByLabelText('Sort by'), 'Rating');
    expect(
      screen.getByRole('button', { name: 'Remove Old Town Cafe from favourites' }),
    ).toHaveAttribute('aria-pressed', 'true');

    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });

  it('add / remove / re-add a favourite issues no cafe-search request', async () => {
    searchCafesMock.mockResolvedValue(response([KOPI]));
    const user = userEvent.setup();
    renderPage();
    await resolveLocation(user);
    await screen.findByRole('region', { name: 'Cafe results' });

    const add = () => screen.getByRole('button', { name: 'Add Kopi Kenangan to favourites' });
    const remove = () =>
      screen.getByRole('button', { name: 'Remove Kopi Kenangan from favourites' });

    await user.click(add());
    await user.click(remove());
    await user.click(add());

    expect(remove()).toHaveAttribute('aria-pressed', 'true');
    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });
});
