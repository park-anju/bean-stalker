import { z } from 'zod';

// Google's raw response shape, kept private to this module. Not .strict():
// Bean Stalker does not control Google's schema evolution, so unexpected
// extra fields should be ignored rather than rejected. Only the fields this
// adapter actually requests via field mask are modeled; id/displayName/
// location are load-bearing for Cafe's own required fields, so a place
// missing any of them fails validation for the whole response rather than
// silently producing a broken Cafe.
export const GooglePlaceSchema = z.object({
  id: z.string().min(1),
  displayName: z.object({ text: z.string().min(1) }),
  location: z.object({ latitude: z.number(), longitude: z.number() }),
  formattedAddress: z.string().optional(),
  rating: z.number().optional(),
  userRatingCount: z.number().optional(),
  priceLevel: z.string().optional(),
  currentOpeningHours: z.object({ openNow: z.boolean().optional() }).optional(),
  businessStatus: z.string().optional(),
  googleMapsUri: z.string().optional(),
});

export type GooglePlace = z.infer<typeof GooglePlaceSchema>;

// Google's Places API (New) omits the "places" key entirely (returns `{}`)
// when a Nearby Search has zero results, rather than returning `{ places: [] }`.
export const GoogleSearchNearbyResponseSchema = z.object({
  places: z.array(GooglePlaceSchema).optional(),
});

export type GoogleSearchNearbyResponse = z.infer<typeof GoogleSearchNearbyResponseSchema>;
