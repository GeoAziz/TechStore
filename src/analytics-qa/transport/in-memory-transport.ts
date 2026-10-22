import { GA4CommerceEvent } from '../contracts/events';

export interface Transport {
  send(event: GA4CommerceEvent): Promise<void>;
  flush(): Promise<void>;
  getObservedEvents(): readonly GA4CommerceEvent[];
  clear(): void;
}

export class InMemoryTransport implements Transport {
  private events: GA4CommerceEvent[] = [];

  async send(event: GA4CommerceEvent): Promise<void> {
    this.events.push(Object.freeze(JSON.parse(JSON.stringify(event))));
  }

  async flush(): Promise<void> {}

  getObservedEvents(): readonly GA4CommerceEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}
