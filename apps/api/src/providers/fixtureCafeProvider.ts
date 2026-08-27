import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Cafe, CafeSearchRequest } from '@bean-stalker/contracts';
import type { CafeProvider } from './cafeProvider.js';
import { GoogleSearchNearbyResponseSchema } from './google-places/googlePlacesSchemas.js';
import { mapGooglePlaceToCafe } from './google-places/googlePlacesMapper.js';

// Development/test-only provider — the canonical "Fixture mode" from
// docs/13_OPERATIONS/Local Development Runbook.md. It serves the committed
// Google-shaped fixture through the *same* normalization path as the live
// provider (schema + mapGooglePlaceToCafe), so the frontend receives a
// realistic CafeSearchResponse with distances relative to the real request
// center and zero billable Google traffic. Never selected in production.
const FIXTURE_URL = new URL('../../../../tests/fixtures/nearby-cafes-happy.json', import.meta.url);

export class FixtureCafeProvider implements CafeProvider {
  constructor(private readonly fixtureUrl: URL = FIXTURE_URL) {}

  async searchNearby(request: CafeSearchRequest): Promise<Cafe[]> {
    const raw: unknown = JSON.parse(await readFile(fileURLToPath(this.fixtureUrl), 'utf8'));
    const parsed = GoogleSearchNearbyResponseSchema.parse(raw);
    const places = (parsed.places ?? []).slice(0, request.maxResults);
    return places.map((place) => mapGooglePlaceToCafe(place, request.center));
  }
}
