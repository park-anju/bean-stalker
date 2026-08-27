import { z } from 'zod';

export const LatLngSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .strict();

export type LatLng = z.infer<typeof LatLngSchema>;

export const SearchCenterSchema = LatLngSchema.extend({
  label: z.string().min(1).optional(),
});

export type SearchCenter = z.infer<typeof SearchCenterSchema>;
