import { GA4CommerceEvent } from '../contracts/events';

export type EventExpectation = 'required' | 'optional' | 'forbidden';

export interface ExpectedLedgerEntry {
  readonly sequence: number;
  readonly eventName: string;
  readonly expectation: EventExpectation;
  readonly stableEventId: string;
  readonly expectedPayload?: Partial<GA4CommerceEvent>;
  readonly rationale: string;
}

export interface SyntheticRunArtifact {
  readonly runId: string;
  readonly seed: number;
  readonly personaId: string;
  readonly consent: 'granted' | 'denied';
  readonly expectedLedger: ExpectedLedgerEntry[];
  readonly observedEvents: readonly GA4CommerceEvent[];
}
