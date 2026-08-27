import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { EMPTY_FAVORITE_STORE } from '@bean-stalker/domain';
import { App } from './App';
import { FavoritesProvider } from './favorites/FavoritesProvider';

afterEach(() => localStorage.clear());

function renderApp(initialPath: string) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider initialStore={EMPTY_FAVORITE_STORE}>
        <MemoryRouter initialEntries={[initialPath]}>
          <App />
        </MemoryRouter>
      </FavoritesProvider>
    </QueryClientProvider>,
  );
}

describe('App shell', () => {
  it('renders the primary landmarks on every route', () => {
    renderApp('/');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('provides a skip link to the main content', () => {
    renderApp('/');
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main-content',
    );
  });
});

describe('routing', () => {
  it('renders the discovery page at /', () => {
    renderApp('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Bean Stalker' })).toBeInTheDocument();
  });

  it('renders the favorites page at /favorites', () => {
    renderApp('/favorites');
    expect(screen.getByRole('heading', { level: 1, name: 'Favorites' })).toBeInTheDocument();
  });

  it('renders a not-found page for an unknown route', () => {
    renderApp('/does-not-exist');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('lets the user return home from the not-found page', async () => {
    const user = userEvent.setup();
    renderApp('/does-not-exist');
    await user.click(screen.getByRole('link', { name: /return to bean stalker/i }));
    expect(screen.getByRole('heading', { level: 1, name: 'Bean Stalker' })).toBeInTheDocument();
  });
});

describe('navigation', () => {
  it('navigates between routes via the nav links', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(screen.getByRole('link', { name: 'Favorites' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Favorites' })).toBeInTheDocument();
  });

  it('marks the current route with aria-current in the navigation', () => {
    renderApp('/favorites');
    expect(screen.getByRole('link', { name: 'Favorites' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Discover' })).not.toHaveAttribute('aria-current');
  });

  it('is keyboard operable: pressing Enter while a nav link is focused activates it', async () => {
    const user = userEvent.setup();
    renderApp('/');
    screen.getByRole('link', { name: 'Favorites' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { level: 1, name: 'Favorites' })).toBeInTheDocument();
  });
});
