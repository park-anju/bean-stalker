import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cafe, CafeSearchResponse } from '@bean-stalker/contracts';
import { DiscoveryPage } from './DiscoveryPage.js';
import { searchCafes } from '../search/apiClient.js';

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

function renderPage() {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return render(<DiscoveryPage />, { wrapper });
}

async function resolveLocation(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Latitude'), '1.55');
  await user.type(screen.getByLabelText('Longitude'), '110.36');
  await user.click(screen.getByRole('button', { name: 'Use this location' }));
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
    .map((li) => idOf(within(li).getByRole('button').textContent ?? ''));
}

function mapIds(): string[] {
  const text = screen.getByTestId('map-markers').textContent ?? '';
  return text ? text.split(',') : [];
}

beforeEach(() => {
  searchCafesMock.mockReset();
});

afterEach(() => vi.clearAllMocks());

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

    await user.click(screen.getByRole('button', { name: /Old Town Cafe/ }));
    expect(screen.getByTestId('map-selected')).toHaveTextContent('o');

    await user.click(screen.getByLabelText('Open now only'));
    expect(listIds()).toEqual(['k']); // Old Town hidden
    expect(screen.getByTestId('map-selected')).toHaveTextContent('none');

    await user.click(screen.getByLabelText('Open now only')); // relax
    expect(listIds().slice().sort()).toEqual(['k', 'o']);
    expect(screen.getByTestId('map-selected')).toHaveTextContent('none'); // not auto-reselected
    expect(
      within(screen.getByRole('button', { name: /Old Town Cafe/ })).queryByText('Selected'),
    ).not.toBeInTheDocument();

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
