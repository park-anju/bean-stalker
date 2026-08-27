import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CafeSearchError } from '../search/apiClient.js';
import type { CafeSearchView } from '../search/useCafeSearch.js';
import { SearchStatePanel } from './SearchStatePanel.js';

function renderPanel(view: CafeSearchView) {
  const onRetry = vi.fn();
  render(<SearchStatePanel view={view} onRetry={onRetry} />);
  return { onRetry };
}

describe('SearchStatePanel', () => {
  it('prompts for a location before any search', () => {
    renderPanel({ status: 'no-location' });
    expect(screen.getByText(/choose a location above/i)).toBeInTheDocument();
  });

  it('announces loading via a live region', () => {
    renderPanel({ status: 'loading' });
    expect(screen.getByRole('status')).toHaveTextContent(/searching for nearby cafes/i);
  });

  it('distinguishes an empty successful result from an error', () => {
    renderPanel({ status: 'success', cafes: [], fetchedAt: 'now', isEmpty: true });
    expect(screen.getByText(/no cafes were found/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders nothing for a non-empty success (the list owns that state)', () => {
    const { container } = render(
      <SearchStatePanel
        view={{ status: 'success', cafes: [], fetchedAt: 'now', isEmpty: false }}
        onRetry={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows an alert with retry for a retryable provider error', async () => {
    const user = userEvent.setup();
    const { onRetry } = renderPanel({
      status: 'error',
      error: new CafeSearchError('PROVIDER_RATE_LIMITED', 'quota'),
      canRetry: true,
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/busy right now/i);
    expect(alert).not.toHaveTextContent(/quota/); // raw provider text is not surfaced

    await user.click(screen.getByRole('button', { name: /retry search/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('omits the retry button for a non-retryable error', () => {
    renderPanel({
      status: 'error',
      error: new CafeSearchError('VALIDATION_ERROR', 'bad'),
      canRetry: false,
    });
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });
});
