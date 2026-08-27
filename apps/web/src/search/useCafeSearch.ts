import { useQuery } from '@tanstack/react-query';
import type { Cafe, SearchCenter } from '@bean-stalker/contracts';
import { CafeSearchError, searchCafes } from './apiClient.js';
import { buildCafeSearchRequest, cafeSearchQueryKey } from './searchRequest.js';
import { isRetryable } from './errorCopy.js';

/**
 * Minutes-scale freshness window per [[Search Result Freshness]]: a repeated,
 * parameter-identical search within this window is served from the TanStack
 * Query cache instead of issuing another billable provider request.
 */
const SEARCH_STALE_TIME_MS = 5 * 60_000;
const SEARCH_GC_TIME_MS = 10 * 60_000;

export type CafeSearchView =
  | { status: 'no-location' }
  | { status: 'loading' }
  | { status: 'success'; cafes: Cafe[]; fetchedAt: string; isEmpty: boolean }
  | { status: 'error'; error: CafeSearchError; canRetry: boolean };

export interface UseCafeSearchResult {
  view: CafeSearchView;
  /** Explicit, user-initiated re-run of the current search (never automatic). */
  retry: () => void;
}

function toCafeSearchError(error: unknown): CafeSearchError {
  if (error instanceof CafeSearchError) return error;
  return new CafeSearchError('INTERNAL_ERROR', 'Cafe search could not be completed.');
}

/**
 * Orchestrates one cafe search for a resolved `SearchCenter`.
 *
 * Cost-safety (RM0 / [[API Cost Guardrail Runbook]]): every automatic
 * background refetch TanStack Query would normally do is disabled for this
 * provider-backed query. A request is issued only when the query key changes —
 * i.e. when the user commits a new location. Rerenders, window focus, network
 * reconnect, remounts, polling and error auto-retry never issue a request.
 */
export function useCafeSearch(center: SearchCenter | undefined): UseCafeSearchResult {
  const request = center ? buildCafeSearchRequest(center) : undefined;

  const query = useQuery({
    queryKey: request ? cafeSearchQueryKey(request) : ['cafes', 'search', 'no-location'],
    queryFn: ({ signal }) => {
      // Unreachable while `enabled` is false; the guard also narrows `request`.
      if (!request) throw new Error('cafe search ran without a resolved location');
      return searchCafes(request, signal);
    },
    enabled: request !== undefined,
    staleTime: SEARCH_STALE_TIME_MS,
    gcTime: SEARCH_GC_TIME_MS,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  const retry = () => {
    void query.refetch();
  };

  if (!request) {
    return { view: { status: 'no-location' }, retry };
  }

  if (query.isError) {
    const error = toCafeSearchError(query.error);
    return { view: { status: 'error', error, canRetry: isRetryable(error.code) }, retry };
  }

  if (query.data) {
    return {
      view: {
        status: 'success',
        cafes: query.data.cafes,
        fetchedAt: query.data.fetchedAt,
        isEmpty: query.data.cafes.length === 0,
      },
      retry,
    };
  }

  return { view: { status: 'loading' }, retry };
}
