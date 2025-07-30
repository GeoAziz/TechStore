// src/utils/logger.ts
// Simple logger utility (can be replaced with Sentry, Datadog, etc.)
export function logEvent(message: string, data?: any) {
  console.log(`[EVENT] ${message}`, data || '');
}

export function logError(error: any, context?: string) {
  console.error(`[ERROR] ${context || ''}`, error);
  // TODO: Integrate with Sentry/Datadog for production monitoring
}

/**
 * Usage:
 * - logEvent('Order processed', { orderId })
 * - logError(error, 'Order webhook')
 */
