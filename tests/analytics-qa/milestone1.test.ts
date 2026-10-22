import { Money } from '@/analytics-qa/contracts/money';
import { validateFinancialInvariants, CanonicalOrderAccounting } from '@/analytics-qa/contracts/invariants';
import { ARCHETYPAL_PERSONAS, Persona } from '@/analytics-qa/simulator/personas';
import { JourneySimulator } from '@/analytics-qa/simulator/journey-engine';
import { InMemoryTransport } from '@/analytics-qa/transport/in-memory-transport';
import { createSafeTransport } from '@/analytics-qa/transport/guards';
import { QualityGate } from '@/analytics-qa/quality-gate/gate';
import { QualityReporter } from '@/analytics-qa/quality-gate/reporter';
import { serializeToGA4Payload } from '@/analytics-qa/adapters/ga4-serializer';
import { GA4PurchaseEvent } from '@/analytics-qa/contracts/events';
import * as path from 'path';

describe('Commerce Analytics Simulator & Quality Gate (CAS-QG Milestone 1)', () => {
  let gate: QualityGate;

  beforeEach(() => {
    gate = new QualityGate();
  });

  describe('1. Money Model & Canonical Minor-Units', () => {
    it('enforces non-negative safe integers for cents and valid currency', () => {
      const m1 = Money.fromCents(2500, 'KES');
      expect(m1.cents).toBe(2500);
      expect(m1.currency).toBe('KES');
      expect(m1.toDecimal()).toBe(25.00);

      // Decimal conversion rounding
      const m2 = Money.fromDecimal(19.99, 'KES');
      expect(m2.cents).toBe(1999);

      // Rejects negative cents
      expect(() => Money.fromCents(-100, 'KES')).toThrow();
      // Rejects unsupported currency
      expect(() => Money.fromCents(100, 'EUR' as any)).toThrow();
      // Rejects non-finite decimal
      expect(() => Money.fromDecimal(NaN, 'KES')).toThrow();
    });

    it('performs exact integer arithmetic without float drift', () => {
      const price = Money.fromDecimal(19.99, 'KES'); // 1999 cents
      const total = price.multiply(3); // 5997 cents
      expect(total.cents).toBe(5997);
      expect(total.toDecimal()).toBe(59.97);

      const shipping = Money.fromCents(500, 'KES');
      const grandTotal = total.add(shipping);
      expect(grandTotal.cents).toBe(6497);
      expect(grandTotal.toDecimal()).toBe(64.97);
    });

    it('prevents currency mixing across money operations', () => {
      const kes = Money.fromCents(1000, 'KES');
      const usd = Money.fromCents(1000, 'USD');
      expect(() => kes.add(usd)).toThrow('Currency mismatch: KES vs USD');
    });
  });

  describe('2. Deterministic Journey Simulation & Expected Ledger', () => {
    it('generates identical runs for identical seeds', () => {
      const persona = ARCHETYPAL_PERSONAS[0]; // Successful buyer
      const t1 = new InMemoryTransport();
      const t2 = new InMemoryTransport();

      const sim1 = new JourneySimulator(42);
      const res1 = sim1.generateRun(persona, t1);

      const sim2 = new JourneySimulator(42);
      const res2 = sim2.generateRun(persona, t2);

      expect(res1.artifact.expectedLedger).toEqual(res2.artifact.expectedLedger);
      expect(res1.artifact.observedEvents).toEqual(res2.artifact.observedEvents);
    });

    it('passes all Quality Gate checks for a canonical successful buyer', () => {
      const persona = ARCHETYPAL_PERSONAS[0]; // Successful buyer
      const transport = new InMemoryTransport();
      const sim = new JourneySimulator(101);
      const { artifact, canonicalOrder } = sim.generateRun(persona, transport);

      const evalResult = gate.evaluate(artifact, canonicalOrder);
      expect(evalResult.passed).toBe(true);
      expect(evalResult.violations).toHaveLength(0);
      expect(evalResult.metrics.requiredMet).toBe(4); // view_item, add_to_cart, begin_checkout, purchase
    });

    it('verifies consent enforcement: zero events observed when consent is denied', () => {
      const persona = ARCHETYPAL_PERSONAS.find(p => p.consent === 'denied')!;
      const transport = new InMemoryTransport();
      const sim = new JourneySimulator(202);
      const { artifact, canonicalOrder } = sim.generateRun(persona, transport);

      const evalResult = gate.evaluate(artifact, canonicalOrder);
      expect(evalResult.passed).toBe(true);
      expect(evalResult.metrics.observedCount).toBe(0);

      // Fault injection: simulate an illegal event firing when consent was denied
      transport.send({
        event: 'view_item',
        currency: 'KES',
        value: 100,
        items: [{ item_id: 'bad_p', item_name: 'Leak', price: 100, quantity: 1 }],
      });

      const badArtifact = { ...artifact, observedEvents: transport.getObservedEvents() };
      const failResult = gate.evaluate(badArtifact, canonicalOrder);
      expect(failResult.passed).toBe(false);
      expect(failResult.violations.some(v => v.code === 'CONSENT_VIOLATION')).toBe(true);
    });
  });

  describe('3. Financial Invariant Verification & Fault Injection', () => {
    it('validates canonical financial invariant where GA4 value equals net item sum, not order total', () => {
      const unitGross = Money.fromDecimal(100.00, 'KES');
      const unitDiscount = Money.fromDecimal(10.00, 'KES');
      const netUnit = unitGross.subtract(unitDiscount); // 90.00 KES
      const subtotalNet = netUnit.multiply(2); // 180.00 KES
      const shipping = Money.fromDecimal(25.00, 'KES');
      const tax = Money.fromDecimal(10.00, 'KES');
      const orderDiscount = Money.fromDecimal(0, 'KES');
      const totalCharge = subtotalNet.subtract(orderDiscount).add(shipping).add(tax); // 215.00 KES

      const order: CanonicalOrderAccounting = {
        orderId: 'ord_fin_test_1',
        currency: 'KES',
        items: [
          {
            id: 'item_1',
            name: 'Keyboard',
            unitPriceGross: unitGross,
            unitDiscount,
            netUnitPrice: netUnit,
            quantity: 2,
            totalNetPrice: subtotalNet,
          },
        ],
        subtotalNet,
        shipping,
        tax,
        orderLevelDiscount: orderDiscount,
        totalCharge,
      };

      const validPurchase: GA4PurchaseEvent = {
        event: 'purchase',
        transaction_id: 'ord_fin_test_1',
        currency: 'KES',
        value: 180.00, // NET ITEMS VALUE (excluding shipping & tax)
        shipping: 25.00,
        tax: 10.00,
        items: [
          {
            item_id: 'item_1',
            item_name: 'Keyboard',
            price: 90.00, // net unit price
            quantity: 2,
            discount: 10.00,
          },
        ],
      };

      const check = validateFinancialInvariants(order, validPurchase, totalCharge.cents);
      expect(check.valid).toBe(true);
      expect(check.errors).toHaveLength(0);

      // Fault injection: passing full order total (215.00) into GA4 purchase.value
      const badPurchase: GA4PurchaseEvent = {
        ...validPurchase,
        value: 215.00, // WRONG: included shipping and tax in GA4 value!
      };

      const badCheck = validateFinancialInvariants(order, badPurchase, totalCharge.cents);
      expect(badCheck.valid).toBe(false);
      expect(badCheck.errors.some(e => e.includes('GA4 item-value self-consistency failure'))).toBe(true);
    });
  });

  describe('4. Duplicate Purchase & Idempotency Detection', () => {
    it('detects and flags duplicate purchase events for the same transaction ID', () => {
      const persona = ARCHETYPAL_PERSONAS[0];
      const transport = new InMemoryTransport();
      const sim = new JourneySimulator(303);
      const { artifact, canonicalOrder } = sim.generateRun(persona, transport);

      // Fault injection: re-emit the same purchase event (e.g. page refresh)
      const purchaseEvent = artifact.observedEvents.find(e => e.event === 'purchase')!;
      transport.send(purchaseEvent);

      const dupArtifact = { ...artifact, observedEvents: transport.getObservedEvents() };
      const result = gate.evaluate(dupArtifact, canonicalOrder);

      expect(result.passed).toBe(false);
      expect(result.violations.some(v => v.code === 'DUPLICATE_PURCHASE_DETECTED')).toBe(true);
    });
  });

  describe('5. Structural Production Isolation Guards', () => {
    it('structurally prevents creation of live-production transport in test mode', () => {
      expect(() => {
        createSafeTransport({
          mode: 'live-production',
          measurementId: 'G-RTDRRL0F9B',
        });
      }).toThrow('[SECURITY FATAL]');
    });

    it('requires explicit allowRemoteDebug flag for debug transport', () => {
      expect(() => {
        createSafeTransport({
          mode: 'ga4-debug',
          measurementId: 'G-RTDRRL0F9B',
          apiSecret: 'test_secret',
          allowRemoteDebug: false, // Disallowed
        });
      }).toThrow('[ISOLATION VIOLATION]');
    });

    it('serializes events to official GA4 Measurement Protocol structure', () => {
      const purchase: GA4PurchaseEvent = {
        event: 'purchase',
        transaction_id: 'ord_serialize_test',
        currency: 'KES',
        value: 150.00,
        items: [
          {
            item_id: 'item_sim',
            item_name: 'Simulated Rig',
            price: 150.00,
            quantity: 1,
          },
        ],
      };

      const mpPayload = serializeToGA4Payload('client_test_id', purchase, {
        syntheticRun: true,
        enforceRecommendations: true,
      });

      expect(mpPayload.client_id).toBe('client_test_id');
      expect(mpPayload.validation_behavior).toBe('ENFORCE_RECOMMENDATIONS');
      expect(mpPayload.events).toHaveLength(1);
      expect(mpPayload.events[0].name).toBe('purchase');
      expect(mpPayload.events[0].params.transaction_id).toBe('ord_serialize_test');
      expect(mpPayload.events[0].params.synthetic_run).toBe('true');
      expect(mpPayload.events[0].params.environment).toBe('simulation');
    });
  });

  describe('6. Report Generation (JSON & JUnit XML)', () => {
    it('produces valid JSON and JUnit XML reports from gate runs', () => {
      const results = ARCHETYPAL_PERSONAS.map((p, idx) => {
        const transport = new InMemoryTransport();
        const sim = new JourneySimulator(500 + idx);
        const { artifact, canonicalOrder } = sim.generateRun(p, transport);
        return gate.evaluate(artifact, canonicalOrder);
      });

      const json = QualityReporter.formatJson(results);
      const parsed = JSON.parse(json);
      expect(parsed.summary.totalRuns).toBe(ARCHETYPAL_PERSONAS.length);
      expect(parsed.summary.allPassed).toBe(true);

      const xml = QualityReporter.formatJUnitXml(results);
      expect(xml).toContain('<testsuites name="CommerceAnalyticsSimulator"');
      expect(xml).toContain(`tests="${ARCHETYPAL_PERSONAS.length}"`);
      expect(xml).toContain('failures="0"');

      // Write test reports to reports/ directory
      const reportsDir = path.resolve(process.cwd(), 'reports');
      QualityReporter.writeReports(results, reportsDir);
    });
  });
});
