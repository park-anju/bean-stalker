import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Cafe } from '@bean-stalker/contracts';
import { FavoritesProvider } from './FavoritesProvider.js';
import { FavoritePersistenceNotice } from './FavoritePersistenceNotice.js';
import { FavoriteButton } from './FavoriteButton.js';
import { readFavoriteStore } from './favoritesStorage.js';

const cafe: Cafe = {
  placeId: 'places/kopi',
  name: 'Kopi Kenangan',
  location: { latitude: 1.5551, longitude: 110.3489 },
  openStatus: 'OPEN',
  distanceMeters: 1160,
};

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

function App() {
  return (
    <FavoritesProvider>
      <FavoritePersistenceNotice />
      <FavoriteButton cafe={cafe} />
    </FavoritesProvider>
  );
}

describe('FavoritesProvider', () => {
  it('hydrates from localStorage on mount (once), so a favourite survives a remount', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole('button', { name: /add kopi/i }));
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    first.unmount();

    render(<App />);
    // fresh provider reads the same localStorage → already favourited
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('when the write fails, it does not claim the favourite is saved and shows a bounded notice', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /add kopi/i }));

    // UI did not flip to "saved"
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    // storage genuinely unchanged
    expect(readFavoriteStore().cafes).toHaveLength(0);
    // a favourite-specific alert, not a search error
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be saved in this browser/i);
  });
});
