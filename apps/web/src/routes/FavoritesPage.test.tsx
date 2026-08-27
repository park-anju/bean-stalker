import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import type { Cafe, FavoriteStore } from '@bean-stalker/contracts';
import { EMPTY_FAVORITE_STORE } from '@bean-stalker/domain';
import { FavoritesPage } from './FavoritesPage.js';
import { FavoritesProvider } from '../favorites/FavoritesProvider.js';

function record(cafe: Cafe, savedAt = '2026-08-20T09:00:00.000Z') {
  return { placeId: cafe.placeId, savedAt, snapshot: cafe };
}

const KOPI: Cafe = {
  placeId: 'places/kopi',
  name: 'Kopi Kenangan',
  location: { latitude: 1.5551, longitude: 110.3489 },
  formattedAddress: '12 Jalan Padungan',
  rating: 4.8,
  userRatingCount: 342,
  openStatus: 'OPEN',
  distanceMeters: 1160,
};
const RIVER: Cafe = {
  placeId: 'places/river',
  name: 'River Cafe',
  location: { latitude: 1.5601, longitude: 110.3441 },
  openStatus: 'UNKNOWN',
  distanceMeters: 500,
};

afterEach(() => localStorage.clear());

function renderPage(store: FavoriteStore) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <FavoritesProvider initialStore={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </FavoritesProvider>
  );
  return render(<FavoritesPage />, { wrapper });
}

describe('FavoritesPage', () => {
  it('shows an accessible empty state with a route back to Discovery when nothing is saved', () => {
    renderPage(EMPTY_FAVORITE_STORE);
    expect(screen.getByText(/no favourites saved yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /find cafes to save/i })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders saved snapshots as a semantic list, with a local-only / staleness note', () => {
    renderPage({ version: 1, cafes: [record(KOPI), record(RIVER)] });

    expect(screen.getByText(/saved on this browser\/device only/i)).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Saved cafes' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText('Kopi Kenangan')).toBeInTheDocument();
    expect(within(list).getByText('4.8 ★ (342)')).toBeInTheDocument();
    // no distance on the favourites page (no reference point)
    expect(within(list).queryByText(/km away|m away/)).not.toBeInTheDocument();
  });

  it('removes a favourite in place; removing the last one returns the empty state', async () => {
    const user = userEvent.setup();
    renderPage({ version: 1, cafes: [record(KOPI), record(RIVER)] });

    await user.click(screen.getByRole('button', { name: 'Remove River Cafe from favourites' }));
    expect(screen.queryByText('River Cafe')).not.toBeInTheDocument();
    expect(screen.getByText('Kopi Kenangan')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Kopi Kenangan from favourites' }));
    expect(screen.getByText(/no favourites saved yet/i)).toBeInTheDocument();
  });

  it('does not render a map or require a location', () => {
    renderPage({ version: 1, cafes: [record(KOPI)] });
    expect(screen.queryByRole('region', { name: 'Map' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Latitude')).not.toBeInTheDocument();
  });
});
