import { z } from 'zod';
import { CafeSchema } from './cafe.js';

export const FavoriteRecordSchema = z
  .object({
    placeId: z.string().min(1),
    savedAt: z.iso.datetime(),
    snapshot: CafeSchema,
  })
  .strict();

export type FavoriteRecord = z.infer<typeof FavoriteRecordSchema>;

export const FavoriteStoreSchema = z
  .object({
    version: z.literal(1),
    cafes: z.array(FavoriteRecordSchema),
  })
  .strict();

export type FavoriteStore = z.infer<typeof FavoriteStoreSchema>;
