// src/sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

/**
 * Usage:
 * - Add NEXT_PUBLIC_SENTRY_DSN to your .env file (get DSN from Sentry project)
 * - Sentry will automatically capture frontend errors and performance data
 * - You can use Sentry.captureException(error) in your React components
 * - Monitor errors in your Sentry dashboard
 */
