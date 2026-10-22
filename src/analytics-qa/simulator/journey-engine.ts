import { GA4CommerceEvent } from '../contracts/events';
import { Money } from '../contracts/money';
import { CanonicalOrderAccounting } from '../contracts/invariants';
import { Persona } from './personas';
import { ExpectedLedgerEntry, SyntheticRunArtifact } from './ledger';
import { SeededRandom } from './seeded-random';
import { Transport } from '../transport/in-memory-transport';

export interface FixtureProduct {
  id: string;
  name: string;
  category: string;
  priceCents: number;
}

export const CATALOG_FIXTURES: readonly FixtureProduct[] = [
  { id: 'p_rig_omega', name: 'CyberRig Omega RTX 4090', category: 'Desktops', priceCents: 45000000 },
  { id: 'p_kbd_neon', name: 'NeonPulse Mechanical Keyboard', category: 'Accessories', priceCents: 1850000 },
  { id: 'p_mouse_laser', name: 'QuantumStrike Optical Mouse', category: 'Accessories', priceCents: 950000 },
  { id: 'p_headset_vr', name: 'Holosphere Spatial Audio Headset', category: 'Audio', priceCents: 3200000 },
];

export class JourneySimulator {
  private rng: SeededRandom;

  constructor(private seed: number) {
    this.rng = new SeededRandom(seed);
  }

  generateRun(persona: Persona, transport: Transport): {
    artifact: SyntheticRunArtifact;
    canonicalOrder?: CanonicalOrderAccounting;
  } {
    const runId = `run_${this.seed}_${persona.id}`;
    const expectedLedger: ExpectedLedgerEntry[] = [];
    let seq = 1;

    // Pick 1-2 items from catalog
    const selectedItem = this.rng.pick(CATALOG_FIXTURES);
    const quantity = 1;

    // If consent is denied, expected ledger states that ALL events are forbidden from dispatch
    if (persona.consent === 'denied') {
      expectedLedger.push({
        sequence: seq++,
        eventName: 'any',
        expectation: 'forbidden',
        stableEventId: `${runId}:no_events_permitted`,
        rationale: 'User denied analytics consent. Absolutely no tracking calls may be dispatched.',
      });

      // Transport receives zero events
      return {
        artifact: {
          runId,
          seed: this.seed,
          personaId: persona.id,
          consent: persona.consent,
          expectedLedger,
          observedEvents: transport.getObservedEvents(),
        },
      };
    }

    // 1. Stage: Discovery (view_item)
    expectedLedger.push({
      sequence: seq++,
      eventName: 'view_item',
      expectation: 'required',
      stableEventId: `${runId}:view_item:${selectedItem.id}`,
      expectedPayload: {
        event: 'view_item',
        currency: persona.currency,
        value: Money.fromCents(selectedItem.priceCents, persona.currency).toDecimal(),
      },
      rationale: 'User viewed product detail page',
    });

    // Simulate emission to transport
    transport.send({
      event: 'view_item',
      currency: persona.currency,
      value: Money.fromCents(selectedItem.priceCents, persona.currency).toDecimal(),
      items: [
        {
          item_id: selectedItem.id,
          item_name: selectedItem.name,
          price: Money.fromCents(selectedItem.priceCents, persona.currency).toDecimal(),
          quantity: 1,
          item_category: selectedItem.category,
        },
      ],
      synthetic_run: 'true',
      environment: 'simulation',
    });

    if (persona.intent === 'window_shopper') {
      expectedLedger.push({
        sequence: seq++,
        eventName: 'add_to_cart',
        expectation: 'forbidden',
        stableEventId: `${runId}:forbid_cart`,
        rationale: 'Window shopper bounces without adding to cart',
      });
      return {
        artifact: {
          runId,
          seed: this.seed,
          personaId: persona.id,
          consent: persona.consent,
          expectedLedger,
          observedEvents: transport.getObservedEvents(),
        },
      };
    }

    // 2. Stage: Cart (add_to_cart)
    expectedLedger.push({
      sequence: seq++,
      eventName: 'add_to_cart',
      expectation: 'required',
      stableEventId: `${runId}:add_to_cart:${selectedItem.id}`,
      expectedPayload: {
        event: 'add_to_cart',
        currency: persona.currency,
        value: Money.fromCents(selectedItem.priceCents, persona.currency).toDecimal(),
      },
      rationale: 'User added item to cart',
    });

    transport.send({
      event: 'add_to_cart',
      currency: persona.currency,
      value: Money.fromCents(selectedItem.priceCents, persona.currency).toDecimal(),
      items: [
        {
          item_id: selectedItem.id,
          item_name: selectedItem.name,
          price: Money.fromCents(selectedItem.priceCents, persona.currency).toDecimal(),
          quantity,
          item_category: selectedItem.category,
        },
      ],
      synthetic_run: 'true',
      environment: 'simulation',
    });

    if (persona.intent === 'cart_abandoner') {
      expectedLedger.push({
        sequence: seq++,
        eventName: 'begin_checkout',
        expectation: 'forbidden',
        stableEventId: `${runId}:forbid_checkout`,
        rationale: 'Cart abandoner left site before initiating checkout',
      });
      return {
        artifact: {
          runId,
          seed: this.seed,
          personaId: persona.id,
          consent: persona.consent,
          expectedLedger,
          observedEvents: transport.getObservedEvents(),
        },
      };
    }

    // 3. Stage: Checkout (begin_checkout)
    expectedLedger.push({
      sequence: seq++,
      eventName: 'begin_checkout',
      expectation: 'required',
      stableEventId: `${runId}:begin_checkout`,
      expectedPayload: {
        event: 'begin_checkout',
        currency: persona.currency,
        value: Money.fromCents(selectedItem.priceCents, persona.currency).toDecimal(),
      },
      rationale: 'User navigated to checkout form',
    });

    transport.send({
      event: 'begin_checkout',
      currency: persona.currency,
      value: Money.fromCents(selectedItem.priceCents, persona.currency).toDecimal(),
      items: [
        {
          item_id: selectedItem.id,
          item_name: selectedItem.name,
          price: Money.fromCents(selectedItem.priceCents, persona.currency).toDecimal(),
          quantity,
          item_category: selectedItem.category,
        },
      ],
      synthetic_run: 'true',
      environment: 'simulation',
    });

    if (persona.intent === 'checkout_abandoner') {
      expectedLedger.push({
        sequence: seq++,
        eventName: 'purchase',
        expectation: 'forbidden',
        stableEventId: `${runId}:forbid_purchase`,
        rationale: 'Checkout abandoner dropped off without payment',
      });
      return {
        artifact: {
          runId,
          seed: this.seed,
          personaId: persona.id,
          consent: persona.consent,
          expectedLedger,
          observedEvents: transport.getObservedEvents(),
        },
      };
    }

    // 4. Stage: Conversion (purchase)
    const orderId = `ord_sim_${this.seed}_${this.rng.nextInt(1000, 9999)}`;
    const unitPriceGross = Money.fromCents(selectedItem.priceCents, persona.currency);
    const unitDiscount = Money.fromCents(0, persona.currency); // zero discount in baseline
    const netUnitPrice = unitPriceGross.subtract(unitDiscount);
    const totalNetPrice = netUnitPrice.multiply(quantity);
    const shipping = Money.fromCents(2500, persona.currency); // 25.00 KES flat shipping
    const tax = Money.fromCents(0, persona.currency);
    const orderLevelDiscount = Money.fromCents(0, persona.currency);
    const totalCharge = totalNetPrice.subtract(orderLevelDiscount).add(shipping).add(tax);

    const canonicalOrder: CanonicalOrderAccounting = {
      orderId,
      currency: persona.currency,
      items: [
        {
          id: selectedItem.id,
          name: selectedItem.name,
          unitPriceGross,
          unitDiscount,
          netUnitPrice,
          quantity,
          totalNetPrice,
        },
      ],
      subtotalNet: totalNetPrice,
      shipping,
      tax,
      orderLevelDiscount,
      totalCharge,
    };

    expectedLedger.push({
      sequence: seq++,
      eventName: 'purchase',
      expectation: 'required',
      stableEventId: `${runId}:purchase:${orderId}`,
      expectedPayload: {
        event: 'purchase',
        transaction_id: orderId,
        currency: persona.currency,
        value: totalNetPrice.toDecimal(), // purchase.value is net items total!
        shipping: shipping.toDecimal(),
      },
      rationale: 'Payment succeeded and purchase verified',
    });

    transport.send({
      event: 'purchase',
      transaction_id: orderId,
      currency: persona.currency,
      value: totalNetPrice.toDecimal(),
      shipping: shipping.toDecimal(),
      items: [
        {
          item_id: selectedItem.id,
          item_name: selectedItem.name,
          price: netUnitPrice.toDecimal(),
          quantity,
          item_category: selectedItem.category,
        },
      ],
      synthetic_run: 'true',
      environment: 'simulation',
    });

    return {
      artifact: {
        runId,
        seed: this.seed,
        personaId: persona.id,
        consent: persona.consent,
        expectedLedger,
        observedEvents: transport.getObservedEvents(),
      },
      canonicalOrder,
    };
  }
}
