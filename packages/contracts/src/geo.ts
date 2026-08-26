import { z } from 'zod';

export const LatLngSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .strict();

export type LatLng = z.infer<typeof LatLngSchema>;
