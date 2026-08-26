import { z } from 'zod';
import { LatLngSchema } from './geo.js';
import { CafeSchema } from './cafe.js';

export const CAFE_SEARCH_BOUNDS = {
  radiusMeters: { min: 100, max: 5000 },
  maxResults: { min: 1, max: 20 },
} as const;

export const RankPreferenceSchema = z.enum(['POPULARITY', 'DISTANCE']);
export type RankPreference = z.infer<typeof RankPreferenceSchema>;

export const CafeSearchRequestSchema = z
  .object({
    center: LatLngSchema,
    radiusMeters: z
      .number()
      .int()
      .min(CAFE_SEARCH_BOUNDS.radiusMeters.min)
      .max(CAFE_SEARCH_BOUNDS.radiusMeters.max),
    maxResults: z
      .number()
      .int()
      .min(CAFE_SEARCH_BOUNDS.maxResults.min)
      .max(CAFE_SEARCH_BOUNDS.maxResults.max),
    rankPreference: RankPreferenceSchema,
  })
  .strict();

export type CafeSearchRequest = z.infer<typeof CafeSearchRequestSchema>;

export const CafeSearchResponseSchema = z
  .object({
    searchCenter: LatLngSchema,
    fetchedAt: z.iso.datetime(),
    cafes: z.array(CafeSchema),
  })
  .strict();

export type CafeSearchResponse = z.infer<typeof CafeSearchResponseSchema>;
