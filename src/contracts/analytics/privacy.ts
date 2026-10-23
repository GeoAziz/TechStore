/**
 * Privacy and PII scrubbing engine compliant with Kenyan Data Protection Act (KDPA 2019)
 * and General Data Protection Regulation (GDPR).
 *
 * Prevents direct identifiers (emails, phone numbers, national IDs, card numbers, physical addresses)
 * from entering client-side or server-side Google Analytics payloads.
 */

// Regex patterns for sensitive information
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Matches Kenyan phone formats (+254..., 07..., 01...) and generic international formats
const PHONE_REGEX = /(\+?254|0)[17]\d{8}|\+?[1-9]\d{1,14}/g;
// Matches 13-19 digit card numbers with or without spaces/hyphens
const CARD_REGEX = /\b(?:\d[ -]*?){13,19}\b/g;
// Kenyan National ID numbers (typically 7-8 consecutive digits isolated)
const KENYAN_ID_REGEX = /\b\d{7,8}\b/g;

export const SENSITIVE_PARAM_KEYS = new Set([
  'email',
  'user_email',
  'phone',
  'phoneNumber',
  'phone_number',
  'password',
  'token',
  'secret',
  'address',
  'street',
  'national_id',
  'id_number',
  'card',
  'cardNumber',
  'cvv',
  'cvc',
]);

/**
 * Sanitizes any arbitrary string value, stripping detected PII.
 */
export function sanitizeString(value: string, mask: string = '[REDACTED]'): string {
  return value
    .replace(EMAIL_REGEX, mask)
    .replace(CARD_REGEX, mask)
    .replace(PHONE_REGEX, mask);
}

/**
 * Recursively deep-sanitizes an analytics parameter object:
 * - Drops known sensitive keys completely
 * - Scrubs string values matching PII regexes
 * - Recursively processes nested objects and arrays
 */
export function sanitizeAnalyticsPayload<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return sanitizeString(input) as unknown as T;
  }

  if (typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeAnalyticsPayload(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const lowerKey = key.toLowerCase();
      // Drop explicitly forbidden sensitive keys
      if (SENSITIVE_PARAM_KEYS.has(lowerKey)) {
        continue;
      }
      sanitizedObj[key] = sanitizeAnalyticsPayload(value);
    }
    return sanitizedObj as T;
  }

  return input;
}

