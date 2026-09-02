import { describeSearchError } from '../search/errorCopy.js';
import type { CafeSearchView } from '../search/useCafeSearch.js';

export interface SearchStatePanelProps {
  view: CafeSearchView;
  onRetry: () => void;
}

/**
 * Renders the non-result search states explicitly and distinctly
 * ([[Search Lifecycle]], FR-015): a "no cafes" success is never conflated with
 * a failed request. The success state renders nothing here — the list owns it.
 */
export function SearchStatePanel({ view, onRetry }: SearchStatePanelProps) {
  if (view.status === 'no-location') {
    return (
      <p className="search-state search-state--hint">
        Choose a location above to search for nearby cafes.
      </p>
    );
  }

  if (view.status === 'loading') {
    return (
      <p className="search-state" role="status">
        Searching for nearby cafes…
      </p>
    );
  }

  if (view.status === 'error') {
    return (
      <div className="search-state search-state--error" role="alert">
        <p>{describeSearchError(view.error.code)}</p>
        {view.canRetry && (
          <button type="button" onClick={onRetry}>
            Retry search
          </button>
        )}
      </div>
    );
  }

  if (view.isEmpty) {
    return (
      <p className="search-state search-state--empty" role="status">
        No cafes were found near this location. Try a different point.
      </p>
    );
  }

  return null;
}
