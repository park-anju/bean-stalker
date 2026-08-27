import type { Cafe, CafeSearchRequest } from '@bean-stalker/contracts';
import type { CafeProvider } from '../cafeProvider.js';
import { ProviderError } from '../providerError.js';
import { GoogleSearchNearbyResponseSchema } from './googlePlacesSchemas.js';
import { mapGooglePlaceToCafe } from './googlePlacesMapper.js';

const SEARCH_NEARBY_URL = 'https://places.googleapis.com/v1/places:searchNearby';
const INCLUDED_TYPE = 'cafe';

// Minimal field mask: exactly the Google fields packages/contracts' Cafe
// needs. Do not widen without a corresponding Cafe field to receive it —
// field masks affect Google Places billing and payload size.
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.currentOpeningHours.openNow',
  'places.businessStatus',
  'places.googleMapsUri',
].join(',');

export interface GooglePlacesProviderOptions {
  apiKey: string;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
}

export class GooglePlacesProvider implements CafeProvider {
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: GooglePlacesProviderOptions) {
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async searchNearby(request: CafeSearchRequest): Promise<Cafe[]> {
    const response = await this.callGoogle(request);

    if (!response.ok) {
      throw this.mapHttpFailure(response.status);
    }

    const json = await this.readSuccessJson(response);
    const parsed = GoogleSearchNearbyResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new ProviderError(
        'PROVIDER_BAD_RESPONSE',
        'Google returned an unexpected response shape.',
      );
    }

    const places = parsed.data.places ?? [];
    return places.map((place) => mapGooglePlaceToCafe(place, request.center));
  }

  private async callGoogle(request: CafeSearchRequest): Promise<Response> {
    const body = {
      includedTypes: [INCLUDED_TYPE],
      maxResultCount: request.maxResults,
      locationRestriction: {
        circle: {
          center: request.center,
          radius: request.radiusMeters,
        },
      },
      rankPreference: request.rankPreference,
    };

    try {
      return await this.fetchImpl(SEARCH_NEARBY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === 'TimeoutError' || error.name === 'AbortError')
      ) {
        throw new ProviderError('PROVIDER_UNAVAILABLE', 'The cafe search provider timed out.');
      }
      throw new ProviderError(
        'PROVIDER_UNAVAILABLE',
        'The cafe search provider could not be reached.',
      );
    }
  }

  private async readSuccessJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      throw new ProviderError('PROVIDER_BAD_RESPONSE', 'Google returned a non-JSON response.');
    }
  }

  private mapHttpFailure(status: number): ProviderError {
    if (status === 401 || status === 403) {
      return new ProviderError('PROVIDER_AUTH_ERROR', 'Google rejected the request credentials.');
    }
    if (status === 429) {
      return new ProviderError('PROVIDER_RATE_LIMITED', 'Google Places rate limit was exceeded.');
    }
    return new ProviderError('PROVIDER_UNAVAILABLE', 'Google Places is currently unavailable.');
  }
}
