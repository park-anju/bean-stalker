import type { ComponentProps, ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Cafe } from '@bean-stalker/contracts';
import { FavoritesProvider } from '../favorites/FavoritesProvider.js';
import { EMPTY_FAVORITE_STORE } from '@bean-stalker/domain';
import { CafeList } from './CafeList.js';

const cafes: Cafe[] = [
  {
    placeId: 'places/kopi',
    name: 'Kopi Kenangan',
    location: { latitude: 1.5551, longitude: 110.3489 },
    formattedAddress: '12 Jalan Padungan',
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
];

afterEach(() => localStorage.clear());

function wrap(node: ReactNode) {
  return <FavoritesProvider initialStore={EMPTY_FAVORITE_STORE}>{node}</FavoritesProvider>;
}

/** The card <li> whose name span matches `text`. */
function cardFor(text: string): HTMLElement {
  const li = screen.getByText(text, { selector: '.cafe-card__name' }).closest('li');
  if (!li) throw new Error('cafe card <li> not found');
  return li;
}

function selectButton(text: string): HTMLElement {
  // A string `name` is an exact match in RTL, so this hits the select button
  // ("Kopi Kenangan"), not the favourite button ("Add Kopi Kenangan to …").
  return screen.getByRole('button', { name: text });
}

function renderList(props: Partial<ComponentProps<typeof CafeList>> = {}) {
  const onSelectCafe = vi.fn();
  render(
    wrap(<CafeList cafes={cafes} selectedCafeId={null} onSelectCafe={onSelectCafe} {...props} />),
  );
  return { onSelectCafe };
}

describe('CafeList', () => {
  it('renders every cafe as a list item with a count heading', () => {
    renderList();
    expect(screen.getByRole('heading', { name: '2 cafes found' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows honest labels for missing data', () => {
    renderList();
    const unrated = cardFor('Unrated Roastery');
    expect(within(unrated).getByText('No rating data')).toBeInTheDocument();
    expect(within(unrated).getByText('Hours unavailable')).toBeInTheDocument();
    expect(within(unrated).queryByText('Closed')).not.toBeInTheDocument();
    // No address and no Maps link when the provider gave neither.
    expect(within(unrated).queryByRole('link')).not.toBeInTheDocument();
  });

  it('only renders a Google Maps link when a URI is available', () => {
    renderList();
    const kopi = cardFor('Kopi Kenangan');
    expect(within(kopi).getByRole('link', { name: /open in google maps/i })).toHaveAttribute(
      'href',
      'https://maps.google.com/?cid=1',
    );
  });

  it('the favourite button is a sibling of the select button, not nested inside it', () => {
    renderList();
    const select = selectButton('Kopi Kenangan');
    expect(within(select).queryByRole('button')).not.toBeInTheDocument();
    const favorite = screen.getByRole('button', { name: 'Add Kopi Kenangan to favourites' });
    expect(select.contains(favorite)).toBe(false);
    expect(favorite.contains(select)).toBe(false);
  });

  it('reports selection through onSelectCafe and reflects it with aria-pressed', async () => {
    const user = userEvent.setup();
    const onSelectCafe = vi.fn();
    render(wrap(<CafeList cafes={cafes} selectedCafeId={null} onSelectCafe={onSelectCafe} />));

    await user.click(selectButton('Kopi Kenangan'));
    expect(onSelectCafe).toHaveBeenCalledWith('places/kopi');
  });

  it('marks the selected card with aria-pressed and a non-colour cue, and toggles off on re-click', async () => {
    const user = userEvent.setup();
    const onSelectCafe = vi.fn();
    render(
      wrap(<CafeList cafes={cafes} selectedCafeId="places/kopi" onSelectCafe={onSelectCafe} />),
    );

    const selected = selectButton('Kopi Kenangan');
    expect(selected).toHaveAttribute('aria-pressed', 'true');
    expect(within(cardFor('Kopi Kenangan')).getByText('Selected')).toBeInTheDocument();

    await user.click(selected);
    expect(onSelectCafe).toHaveBeenCalledWith(null);
  });
});
