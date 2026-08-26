import { z } from 'zod';
import { LatLngSchema } from './geo.js';

export const OpenStatusSchema = z.enum(['OPEN', 'CLOSED', 'UNKNOWN']);
export type OpenStatus = z.infer<typeof OpenStatusSchema>;

export const CafeSchema = z
  .object({
    placeId: z.string().min(1),
    name: z.string().min(1),
    location: LatLngSchema,
    formattedAddress: z.string().optional(),
    rating: z.number().optional(),
    userRatingCount: z.number().int().min(0).optional(),
    priceLevel: z.string().optional(),
    openStatus: OpenStatusSchema,
    businessStatus: z.string().optional(),
    googleMapsUri: z.url().optional(),
    distanceMeters: z.number().min(0),
  })
  .strict();

export type Cafe = z.infer<typeof CafeSchema>;
