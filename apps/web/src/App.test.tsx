import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from './App';

function renderApp(initialPath: string) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('App', () => {
  it('renders the discovery route at /', () => {
    renderApp('/');
    expect(screen.getByRole('heading', { name: 'Bean Stalker' })).toBeInTheDocument();
  });

  it('renders the favorites route at /favorites', () => {
    renderApp('/favorites');
    expect(screen.getByRole('heading', { name: 'Favorites' })).toBeInTheDocument();
  });
});
