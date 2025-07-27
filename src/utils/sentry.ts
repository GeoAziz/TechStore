// src/utils/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

export function captureException(error: any, context?: string) {
  Sentry.captureException(error, { extra: { context } });
}

/**
 * Usage:
 * - Add SENTRY_DSN to your .env file
 * - Call captureException(error, 'Order webhook') in your API
 * - For frontend, use @sentry/nextjs and follow Next.js docs
 * - Monitor errors in your Sentry dashboard
 */
