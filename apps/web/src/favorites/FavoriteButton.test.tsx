import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import type { Cafe } from '@bean-stalker/contracts';
import { EMPTY_FAVORITE_STORE } from '@bean-stalker/domain';
import { FavoriteButton } from './FavoriteButton.js';
import { FavoritesProvider } from './FavoritesProvider.js';
import { readFavoriteStore } from './favoritesStorage.js';

const cafe: Cafe = {
  placeId: 'places/kopi',
  name: 'Kopi Kenangan',
  location: { latitude: 1.5551, longitude: 110.3489 },
  openStatus: 'OPEN',
  distanceMeters: 1160,
};

afterEach(() => localStorage.clear());

function renderButton(node: ReactNode = <FavoriteButton cafe={cafe} />) {
  return render(<FavoritesProvider initialStore={EMPTY_FAVORITE_STORE}>{node}</FavoritesProvider>);
}

describe('FavoriteButton', () => {
  it('starts unpressed with an "add" accessible name', () => {
    renderButton();
    const button = screen.getByRole('button', { name: 'Add Kopi Kenangan to favourites' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveTextContent('Save');
  });

  it('toggles aria-pressed and accessible name on activation, and back on a second activation', async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Add Kopi Kenangan to favourites' }));
    const pressed = screen.getByRole('button', { name: 'Remove Kopi Kenangan from favourites' });
    expect(pressed).toHaveAttribute('aria-pressed', 'true');
    expect(pressed).toHaveTextContent('Saved');

    await user.click(pressed);
    expect(screen.getByRole('button', { name: 'Add Kopi Kenangan to favourites' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('is keyboard operable', async () => {
    const user = userEvent.setup();
    renderButton();
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('persists the change to localStorage through the storage boundary', async () => {
    const user = userEvent.setup();
    renderButton();
    await user.click(screen.getByRole('button'));

    const stored = readFavoriteStore();
    expect(stored.cafes.map((r) => r.placeId)).toEqual(['places/kopi']);
    expect(stored.cafes[0]?.snapshot).toEqual(cafe);
  });

  it('keeps two buttons for the same cafe in sync and stores exactly one record', async () => {
    const user = userEvent.setup();
    renderButton(
      <>
        <FavoriteButton cafe={cafe} />
        <FavoriteButton cafe={cafe} />
      </>,
    );
    const [first, second] = screen.getAllByRole('button');
    await user.click(first as HTMLElement);

    expect(first).toHaveAttribute('aria-pressed', 'true');
    expect(second).toHaveAttribute('aria-pressed', 'true'); // shared state
    expect(readFavoriteStore().cafes).toHaveLength(1); // no [kopi, kopi]
  });
});
