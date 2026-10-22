import { GA4CommerceEvent } from '../contracts/events';

export interface GA4MPPayload {
  client_id: string;
  user_id?: string;
  timestamp_micros?: string;
  non_personalized_ads?: boolean;
  events: Array<{
    name: string;
    params: Record<string, unknown>;
  }>;
  validation_behavior?: 'ENFORCE_RECOMMENDATIONS';
}

export function serializeToGA4Payload(
  clientId: string,
  event: GA4CommerceEvent,
  options: { enforceRecommendations?: boolean; syntheticRun?: boolean } = {}
): GA4MPPayload {
  const { event: eventName, ...rawParams } = event;

  const params: Record<string, unknown> = {
    ...rawParams,
    ...(options.syntheticRun ? { synthetic_run: 'true', environment: 'simulation' } : {}),
  };

  return {
    client_id: clientId,
    validation_behavior: options.enforceRecommendations ? 'ENFORCE_RECOMMENDATIONS' : undefined,
    events: [
      {
        name: eventName,
        params,
      },
    ],
  };
}
