import { InMemoryTransport, Transport } from './in-memory-transport';
import { GA4CommerceEvent } from '../contracts/events';
import { serializeToGA4Payload } from '../adapters/ga4-serializer';

export interface TransportOptions {
  mode: 'in-memory' | 'ga4-debug' | 'live-production';
  measurementId?: string;
  apiSecret?: string;
  allowRemoteDebug?: boolean;
}

export function createSafeTransport(options: TransportOptions): Transport {
  // STRICT STRUCTURAL GUARD: Live production transmission is unequivocally blocked in test runner
  if (options.mode === 'live-production') {
    throw new Error(
      '[SECURITY FATAL] Live GA4 transmission is structurally disallowed in the Quality Gate & Simulator. All live customer transports must run in production runtime.'
    );
  }

  if (options.mode === 'in-memory') {
    return new InMemoryTransport();
  }

  if (options.mode === 'ga4-debug') {
    if (!options.allowRemoteDebug) {
      throw new Error(
        '[ISOLATION VIOLATION] Remote debug validation was requested without explicit opt-in flag allowRemoteDebug: true.'
      );
    }
    if (!options.measurementId || !options.apiSecret) {
      throw new Error(
        '[CONFIG ERROR] GA4 Measurement ID and API Secret are required for remote debug validation.'
      );
    }

    // Return a remote debug transport that calls ONLY https://www.google-analytics.com/debug/mp/collect
    return new GA4DebugValidationTransport(options.measurementId, options.apiSecret);
  }

  throw new Error(`[CONFIG ERROR] Unknown transport mode: ${options.mode}`);
}

class GA4DebugValidationTransport implements Transport {
  private inMemory = new InMemoryTransport();

  constructor(private measurementId: string, private apiSecret: string) {}

  async send(event: GA4CommerceEvent): Promise<void> {
    await this.inMemory.send(event);

    const payload = serializeToGA4Payload('synthetic_sim_client', event, {
      syntheticRun: true,
      enforceRecommendations: true,
    });

    // Calls ONLY the debug endpoint
    const url = `https://www.google-analytics.com/debug/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`[GA4 Debug] HTTP Error ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as { validationMessages?: Array<{ description: string }> };
    if (data.validationMessages && data.validationMessages.length > 0) {
      const msgs = data.validationMessages.map(m => m.description).join('; ');
      throw new Error(`[GA4 Debug Validation Failed] ${msgs}`);
    }
  }

  async flush(): Promise<void> {}

  getObservedEvents(): readonly GA4CommerceEvent[] {
    return this.inMemory.getObservedEvents();
  }

  clear(): void {
    this.inMemory.clear();
  }
}
