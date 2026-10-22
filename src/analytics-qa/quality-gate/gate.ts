import {
  GA4CommerceEvent,
  GA4ViewItemSchema,
  GA4AddToCartSchema,
  GA4RemoveFromCartSchema,
  GA4BeginCheckoutSchema,
  GA4PurchaseSchema,
} from '../contracts/events';
import { CanonicalOrderAccounting, validateFinancialInvariants } from '../contracts/invariants';
import { SyntheticRunArtifact, ExpectedLedgerEntry } from '../simulator/ledger';

export interface QualityGateResult {
  readonly runId: string;
  readonly seed: number;
  readonly personaId: string;
  readonly passed: boolean;
  readonly violations: QualityViolation[];
  readonly metrics: {
    expectedCount: number;
    observedCount: number;
    requiredMet: number;
    forbiddenViolated: number;
  };
}

export interface QualityViolation {
  readonly code:
    | 'SCHEMA_VALIDATION_ERROR'
    | 'ILLEGAL_JOURNEY_TRANSITION'
    | 'FINANCIAL_INVARIANT_VIOLATION'
    | 'DUPLICATE_PURCHASE_DETECTED'
    | 'CONSENT_VIOLATION';
  readonly message: string;
  readonly context?: Record<string, unknown>;
}

export class QualityGate {
  evaluate(
    artifact: SyntheticRunArtifact,
    canonicalOrder?: CanonicalOrderAccounting,
    stripeChargeCents?: number
  ): QualityGateResult {
    const violations: QualityViolation[] = [];
    const { expectedLedger, observedEvents, consent, seed, personaId, runId } = artifact;

    // 1. Consent Enforcement
    if (consent === 'denied' && observedEvents.length > 0) {
      violations.push({
        code: 'CONSENT_VIOLATION',
        message: `Consent was denied for persona ${personaId}, but ${observedEvents.length} events were dispatched.`,
        context: { observedEvents },
      });
    }

    // 2. Schema Validation on all observed events
    for (const event of observedEvents) {
      const schemaResult = this.validateEventSchema(event);
      if (!schemaResult.valid) {
        violations.push({
          code: 'SCHEMA_VALIDATION_ERROR',
          message: `Event '${event.event}' failed schema validation: ${schemaResult.errors.join('; ')}`,
          context: { event },
        });
      }
    }

    // 3. Expected Ledger vs Observed Matching & Sequence Checks
    let requiredMet = 0;
    let forbiddenViolated = 0;

    for (const expected of expectedLedger) {
      const matchingEvents = observedEvents.filter(e => e.event === expected.eventName);

      if (expected.expectation === 'required') {
        if (matchingEvents.length === 0) {
          violations.push({
            code: 'ILLEGAL_JOURNEY_TRANSITION',
            message: `Required event '${expected.eventName}' was missing from the journey.`,
            context: { expected },
          });
        } else {
          requiredMet++;
        }
      }

      if (expected.expectation === 'forbidden') {
        if (expected.eventName === 'any') {
          if (observedEvents.length > 0) {
            forbiddenViolated += observedEvents.length;
            // already flagged in consent check
          }
        } else if (matchingEvents.length > 0) {
          forbiddenViolated += matchingEvents.length;
          violations.push({
            code: 'ILLEGAL_JOURNEY_TRANSITION',
            message: `Forbidden event '${expected.eventName}' occurred ${matchingEvents.length} times in scenario.`,
            context: { expected, matchingEvents },
          });
        }
      }
    }

    // 4. Duplicate Transaction Detection
    const purchaseEvents = observedEvents.filter(e => e.event === 'purchase');
    const transactionIdMap = new Map<string, number>();

    for (const p of purchaseEvents) {
      const txId = (p as any).transaction_id;
      const count = (transactionIdMap.get(txId) || 0) + 1;
      transactionIdMap.set(txId, count);
      if (count > 1) {
        violations.push({
          code: 'DUPLICATE_PURCHASE_DETECTED',
          message: `Duplicate purchase transaction detected for ID: ${txId}`,
          context: { transaction_id: txId, count },
        });
      }
    }

    // 5. Financial Invariants
    if (canonicalOrder && purchaseEvents.length > 0) {
      const primaryPurchase = purchaseEvents[0] as any;
      const chargeCents = stripeChargeCents ?? canonicalOrder.totalCharge.cents;
      const financialResult = validateFinancialInvariants(canonicalOrder, primaryPurchase, chargeCents);
      if (!financialResult.valid) {
        for (const err of financialResult.errors) {
          violations.push({
            code: 'FINANCIAL_INVARIANT_VIOLATION',
            message: err,
            context: { orderId: canonicalOrder.orderId },
          });
        }
      }
    }

    return {
      runId,
      seed,
      personaId,
      passed: violations.length === 0,
      violations,
      metrics: {
        expectedCount: expectedLedger.length,
        observedCount: observedEvents.length,
        requiredMet,
        forbiddenViolated,
      },
    };
  }

  private validateEventSchema(event: GA4CommerceEvent): { valid: boolean; errors: string[] } {
    let parseResult;
    switch (event.event) {
      case 'view_item':
        parseResult = GA4ViewItemSchema.safeParse(event);
        break;
      case 'add_to_cart':
        parseResult = GA4AddToCartSchema.safeParse(event);
        break;
      case 'remove_from_cart':
        parseResult = GA4RemoveFromCartSchema.safeParse(event);
        break;
      case 'begin_checkout':
        parseResult = GA4BeginCheckoutSchema.safeParse(event);
        break;
      case 'purchase':
        parseResult = GA4PurchaseSchema.safeParse(event);
        break;
      default:
        return { valid: false, errors: [`Unrecognized commerce event: ${(event as any).event}`] };
    }

    if (!parseResult.success) {
      return {
        valid: false,
        errors: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: true, errors: [] };
  }
}
