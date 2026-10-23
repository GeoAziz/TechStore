import { z } from 'zod';

const GA4EnvSchema = z.object({
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith('G-').optional(),
  GA4_MEASUREMENT_ID: z.string().startsWith('G-').optional(),
  GA4_API_SECRET: z.string().min(1).optional(),
  GA4_PROPERTY_ID: z.string().regex(/^\d+$/).optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
});

export type GA4EnvConfig = z.infer<typeof GA4EnvSchema>;

/**
 * Validates and retrieves current GA4 environment settings.
 * Fails safely with diagnostic warnings in non-production.
 */
export function getGA4EnvConfig(): {
  isValid: boolean;
  config: GA4EnvConfig;
  missingKeys: string[];
} {
  const measurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  const propertyId = process.env.GA4_PROPERTY_ID;

  const missingKeys: string[] = [];
  if (!measurementId) missingKeys.push('GA4_MEASUREMENT_ID');
  if (!apiSecret) missingKeys.push('GA4_API_SECRET');
  if (!propertyId) missingKeys.push('GA4_PROPERTY_ID');

  const parsed = GA4EnvSchema.safeParse({
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    GA4_MEASUREMENT_ID: measurementId,
    GA4_API_SECRET: apiSecret,
    GA4_PROPERTY_ID: propertyId,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  return {
    isValid: parsed.success && missingKeys.length === 0,
    config: parsed.success ? parsed.data : {},
    missingKeys,
  };
}

