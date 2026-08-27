import { useId } from 'react';
import {
  DEFAULT_DISCOVERY_FILTERS,
  MIN_RATING_OPTIONS,
  SORT_OPTIONS,
  isDefaultFilters,
  type DiscoveryFilters,
} from './filterState.js';

export interface FilterBarProps {
  filters: DiscoveryFilters;
  onChange: (next: DiscoveryFilters) => void;
}

/**
 * Local sort/filter controls. Native `<select>` / `<input type="checkbox">`
 * with visible labels — no custom ARIA widgets. Every change is a pure local
 * state update; nothing here reaches the search query.
 */
export function FilterBar({ filters, onChange }: FilterBarProps) {
  const ratingId = useId();
  const sortId = useId();
  const openNowId = useId();

  return (
    <div className="filter-bar" role="group" aria-label="Filter and sort cafes">
      <div className="filter-bar__field">
        <label htmlFor={ratingId}>Minimum rating</label>
        <select
          id={ratingId}
          value={String(filters.minRating)}
          onChange={(event) => onChange({ ...filters, minRating: Number(event.target.value) })}
        >
          {MIN_RATING_OPTIONS.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-bar__field filter-bar__field--checkbox">
        <input
          id={openNowId}
          type="checkbox"
          checked={filters.openNowOnly}
          onChange={(event) => onChange({ ...filters, openNowOnly: event.target.checked })}
        />
        <label htmlFor={openNowId}>Open now only</label>
      </div>

      <div className="filter-bar__field">
        <label htmlFor={sortId}>Sort by</label>
        <select
          id={sortId}
          value={filters.sortBy}
          onChange={(event) => {
            const next = SORT_OPTIONS.find((option) => option.value === event.target.value);
            if (next) onChange({ ...filters, sortBy: next.value });
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="filter-bar__reset"
        onClick={() => onChange(DEFAULT_DISCOVERY_FILTERS)}
        disabled={isDefaultFilters(filters)}
      >
        Reset filters
      </button>
    </div>
  );
}
