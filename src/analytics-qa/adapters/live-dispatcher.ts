import { MarketDatasetGenerator, CustomerInteractionRecord } from '../dataset/market-generator';
import { serializeToGA4Payload } from '../adapters/ga4-serializer';
import { GA4CommerceEvent } from '../contracts/events';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-RTDRRL0F9B';
// Measurement Protocol API Secret (obtained from GA4 Admin -> Data Streams -> Measurement Protocol API secrets)
const API_SECRET = process.env.GA4_API_SECRET || '';

interface DispatchOptions {
  dryRun?: boolean;
  debugMode?: boolean; // If true, sends to /debug/mp/collect (validation endpoint)
  count?: number;
}

export async function dispatchMarketActivityToGA4(options: DispatchOptions = {}) {
  const { dryRun = false, debugMode = false, count = 10 } = options;

  console.log('====================================================');
  console.log('🚀 Zizo OrderVerse: GA4 Live Activity Dispatcher');
  console.log(`🎯 Target Measurement ID: ${MEASUREMENT_ID}`);
  console.log(`🔧 Mode: ${dryRun ? 'DRY RUN (No network)' : debugMode ? 'DEBUG / VALIDATION' : 'LIVE INGESTION'}`);
  console.log(`📦 Simulating ${count} customer sessions...`);
  console.log('====================================================\n');

  const generator = new MarketDatasetGenerator(Date.now());
  const interactions = generator.generateDataset(count);

  console.log(`Generated ${interactions.length} raw interaction events.\n`);

  const endpointBase = debugMode
    ? 'https://www.google-analytics.com/debug/mp/collect'
    : 'https://www.google-analytics.com/mp/collect';

  const url = API_SECRET
    ? `${endpointBase}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`
    : `${endpointBase}?measurement_id=${MEASUREMENT_ID}`;

  let successCount = 0;
  let errorCount = 0;

  for (const record of interactions) {
    // Map interaction to a typed GA4 e-commerce event
    let ga4Event: GA4CommerceEvent | null = null;
    const decimalPrice = record.priceCents / 100;

    switch (record.interactionType) {
      case 'view_item':
        ga4Event = {
          event: 'view_item',
          currency: 'KES',
          value: decimalPrice,
          items: [
            {
              item_id: record.productId,
              item_name: record.productName,
              price: decimalPrice,
              quantity: 1,
              item_category: record.category,
              item_brand: record.brand,
            },
          ],
        };
        break;

      case 'add_to_cart':
        ga4Event = {
          event: 'add_to_cart',
          currency: 'KES',
          value: decimalPrice,
          items: [
            {
              item_id: record.productId,
              item_name: record.productName,
              price: decimalPrice,
              quantity: 1,
              item_category: record.category,
              item_brand: record.brand,
            },
          ],
        };
        break;

      case 'remove_from_cart':
        ga4Event = {
          event: 'remove_from_cart',
          currency: 'KES',
          value: decimalPrice,
          items: [
            {
              item_id: record.productId,
              item_name: record.productName,
              price: decimalPrice,
              quantity: 1,
              item_category: record.category,
              item_brand: record.brand,
            },
          ],
        };
        break;

      case 'begin_checkout':
        ga4Event = {
          event: 'begin_checkout',
          currency: 'KES',
          value: decimalPrice,
          items: [
            {
              item_id: record.productId,
              item_name: record.productName,
              price: decimalPrice,
              quantity: 1,
              item_category: record.category,
              item_brand: record.brand,
            },
          ],
        };
        break;

      case 'purchase':
        ga4Event = {
          event: 'purchase',
          transaction_id: `ord_live_${record.sessionId.slice(-6)}_${Date.now().toString().slice(-4)}`,
          currency: 'KES',
          value: decimalPrice,
          shipping: 25.0,
          items: [
            {
              item_id: record.productId,
              item_name: record.productName,
              price: decimalPrice,
              quantity: 1,
              item_category: record.category,
              item_brand: record.brand,
            },
          ],
        };
        break;

      default:
        // skip non-ecommerce signals (e.g. wishlist)
        continue;
    }

    if (!ga4Event) continue;

    const payload = serializeToGA4Payload(record.userId, ga4Event, {
      syntheticRun: true,
      enforceRecommendations: debugMode,
    });

    if (dryRun) {
      console.log(`[DRY-RUN] Would send: ${ga4Event.event} for ${record.productName} (${record.userEmail})`);
      successCount++;
      continue;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (debugMode) {
        const result = (await res.json()) as { validationMessages?: Array<{ description: string }> };
        if (result.validationMessages && result.validationMessages.length > 0) {
          console.warn(`⚠️ [GA4 Debug Warning] ${ga4Event.event}:`, result.validationMessages.map(m => m.description).join('; '));
        } else {
          console.log(`✅ [GA4 Validated] ${ga4Event.event} -> ${record.productName} (${record.userEmail})`);
        }
      } else {
        if (res.status === 204 || res.status === 200) {
          console.log(`⚡ [Dispatched to GA4] ${ga4Event.event} | ${record.productName} | KES ${decimalPrice.toLocaleString()}`);
          successCount++;
        } else {
          console.error(`❌ HTTP ${res.status}: Failed to send event`);
          errorCount++;
        }
      }
    } catch (err: any) {
      console.error(`❌ Error dispatching to GA4:`, err.message);
      errorCount++;
    }

    // Small delay between requests to simulate human pacing
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n====================================================');
  console.log(`🏁 Dispatch Complete: ${successCount} sent successfully, ${errorCount} errors.`);
  console.log('👉 Check your Google Analytics Realtime Dashboard:');
  console.log('   https://analytics.google.com -> Realtime');
  console.log('====================================================\n');
}

// CLI Entrypoint
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('live-dispatcher')) {
  const isDry = process.argv.includes('--dry');
  const isDebug = process.argv.includes('--debug');
  const countArg = process.argv.find(arg => arg.startsWith('--count='));
  const count = countArg ? parseInt(countArg.split('=')[1], 10) : 10;

  dispatchMarketActivityToGA4({
    dryRun: isDry,
    debugMode: isDebug,
    count,
  });
}

