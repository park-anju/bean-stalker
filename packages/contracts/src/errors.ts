import { z } from 'zod';

export const ErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'LOCATION_PERMISSION_DENIED',
  'LOCATION_UNAVAILABLE',
  'RATE_LIMITED',
  'PROVIDER_AUTH_ERROR',
  'PROVIDER_RATE_LIMITED',
  'PROVIDER_UNAVAILABLE',
  'PROVIDER_BAD_RESPONSE',
  'PROVIDER_CAPACITY_EXHAUSTED',
  'REQUEST_ABORTED',
  'INTERNAL_ERROR',
  'FAVORITES_STORAGE_ERROR',
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorEnvelopeSchema = z
  .object({
    error: z
      .object({
        code: ErrorCodeSchema,
        message: z.string().min(1),
        requestId: z.string().optional(),
      })
      .strict(),
  })
  .strict();

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
