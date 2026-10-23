/**
 * Browser-safe Attribution & Session Extraction Helper
 * Extracts client_id (_ga) and session_id (_ga_<CONTAINER_ID>) from cookies
 * or local storage while respecting browser privacy and ITP limitations.
 */

export interface AttributionContext {
  clientId?: string;
  sessionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * Extracts the GA4 client_id from document.cookie (_ga cookie format: GA1.1.123456789.123456789)
 */
export function extractGAClientId(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const match = document.cookie.match(/(?:^|;\s*)_ga=([^;]*)/);
  if (!match || !match[1]) return undefined;

  const parts = match[1].split('.');
  if (parts.length >= 4) {
    return `${parts[2]}.${parts[3]}`;
  }
  return match[1];
}

/**
 * Extracts GA4 session_id from cookie _ga_<CONTAINER_ID> (format: GS1.1.1234567890.1.1.1234567890.0.0.0)
 */
export function extractGASessionId(containerId?: string): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const regex = containerId
    ? new RegExp(`(?:^|;\\s*)_ga_${containerId.replace('G-', '')}=([^;]*)`)
    : /(?:^|;\s*)_ga_[A-Z0-9]+=\s*([^;]*)/i;

  const match = document.cookie.match(regex);
  if (!match || !match[1]) return undefined;

  const parts = match[1].split('.');
  if (parts.length >= 3) {
    return parts[2]; // session timestamp / identifier
  }
  return match[1];
}

/**
 * Collects full browser attribution context for attaching to checkout sessions
 */
export function getBrowserAttributionContext(containerId?: string): AttributionContext {
  if (typeof window === 'undefined') return {};

  let utmSource: string | undefined;
  let utmMedium: string | undefined;
  let utmCampaign: string | undefined;

  try {
    const rawUtm = sessionStorage.getItem('techstore_utm_params');
    if (rawUtm) {
      const parsed = JSON.parse(rawUtm);
      utmSource = parsed.utm_source;
      utmMedium = parsed.utm_medium;
      utmCampaign = parsed.utm_campaign;
    }
  } catch {
    // safe fallback
  }

  return {
    clientId: extractGAClientId(),
    sessionId: extractGASessionId(containerId),
    utmSource,
    utmMedium,
    utmCampaign,
  };
}

