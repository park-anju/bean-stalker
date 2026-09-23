import { useQuery } from '@tanstack/react-query';
import type { Cafe, SearchCenter } from '@bean-stalker/contracts';
import { buildCafeSearchRequest, cafeSearchQueryKey } from '@bean-stalker/domain';

import { CafeSearchError, searchCafes } from './apiClient';

const SEARCH_STALE_TIME_MS = 5 * 60_000;
const SEARCH_GC_TIME_MS = 10 * 60_000;

export type CafeSearchView =
  | { status: 'no-location' }
  | { status: 'loading' }
  | { status: 'success'; cafes: Cafe[]; fetchedAt: string }
  | { status: 'error'; error: CafeSearchError };

export function createCafeSearchQueryOptions(center: SearchCenter | undefined) {
  const request = center ? buildCafeSearchRequest(center) : undefined;
  return {
    queryKey: request ? cafeSearchQueryKey(request) : (['cafes', 'search', 'no-location'] as const),
    queryFn: ({ signal }: { signal: AbortSignal }) => {
      if (!request) throw new Error('cafe search ran without a ready location');
      return searchCafes(request, signal);
    },
    enabled: request !== undefined,
    staleTime: SEARCH_STALE_TIME_MS,
    gcTime: SEARCH_GC_TIME_MS,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false as const,
  };
}

function toCafeSearchError(error: unknown): CafeSearchError {
  return error instanceof CafeSearchError
    ? error
    : new CafeSearchError('INTERNAL_ERROR', 'Cafe search could not be completed.');
}

export function useCafeSearch(center: SearchCenter | undefined) {
  const options = createCafeSearchQueryOptions(center);
  const query = useQuery(options);

  const retry = () => void query.refetch();
  if (!options.enabled) return { view: { status: 'no-location' } as const, retry };
  if (query.isError) return { view: { status: 'error', error: toCafeSearchError(query.error) } as const, retry };
  if (query.data) {
    return {
      view: { status: 'success', cafes: query.data.cafes, fetchedAt: query.data.fetchedAt } as const,
      retry,
    };
  }
  return { view: { status: 'loading' } as const, retry };
}
