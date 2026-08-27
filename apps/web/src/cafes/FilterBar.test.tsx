import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterBar } from './FilterBar.js';
import { DEFAULT_DISCOVERY_FILTERS, type DiscoveryFilters } from './filterState.js';

function renderBar(filters: DiscoveryFilters = DEFAULT_DISCOVERY_FILTERS) {
  const onChange = vi.fn();
  render(<FilterBar filters={filters} onChange={onChange} />);
  return { onChange };
}

describe('FilterBar', () => {
  it('renders labelled native controls', () => {
    renderBar();
    expect(screen.getByRole('group', { name: 'Filter and sort cafes' })).toBeInTheDocument();
    expect(screen.getByLabelText('Minimum rating')).toBeInstanceOf(HTMLSelectElement);
    expect(screen.getByLabelText('Open now only')).toHaveProperty('type', 'checkbox');
    expect(screen.getByLabelText('Sort by')).toBeInstanceOf(HTMLSelectElement);
  });

  it('reports a minimum-rating change as a number', async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();
    await user.selectOptions(screen.getByLabelText('Minimum rating'), '4.5');
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DISCOVERY_FILTERS, minRating: 4.5 });
  });

  it('reports an Open Now toggle', async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();
    await user.click(screen.getByLabelText('Open now only'));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DISCOVERY_FILTERS, openNowOnly: true });
  });

  it('reports a sort change', async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();
    await user.selectOptions(screen.getByLabelText('Sort by'), 'Rating');
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DISCOVERY_FILTERS, sortBy: 'RATING' });
  });

  it('disables Reset at defaults and enables it once a filter changes', () => {
    const { rerender } = render(
      <FilterBar filters={DEFAULT_DISCOVERY_FILTERS} onChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Reset filters' })).toBeDisabled();

    rerender(
      <FilterBar filters={{ ...DEFAULT_DISCOVERY_FILTERS, minRating: 4 }} onChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Reset filters' })).toBeEnabled();
  });

  it('Reset returns to the default triple', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterBar
        filters={{ minRating: 4.5, openNowOnly: true, sortBy: 'RATING' }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(onChange).toHaveBeenCalledWith(DEFAULT_DISCOVERY_FILTERS);
  });

  it('is keyboard operable', async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();
    await user.tab();
    expect(screen.getByLabelText('Minimum rating')).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Open now only')).toHaveFocus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DISCOVERY_FILTERS, openNowOnly: true });
  });
});
