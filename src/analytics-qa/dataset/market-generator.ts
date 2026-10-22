import { SeededRandom } from '../simulator/seeded-random';
import { REAL_VENDORS, REAL_CUSTOMERS, ScopedCustomer, ScopedVendor } from './market-entities';
import * as fs from 'fs';
import * as path from 'path';

export type InteractionType =
  | 'view_item'
  | 'add_to_wishlist'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'purchase';

export interface CustomerInteractionRecord {
  sessionId: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userLocation: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  brand: string;
  category: string;
  priceCents: number;
  interactionType: InteractionType;
  dwellTimeSeconds: number;
  weight: number; // Quantitative signal weight for ML recommender
}

export interface CatalogItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
}

export const VENDOR_CATALOGS: Record<string, CatalogItem[]> = {
  Apple: [
    { id: 'app_mbp_16', name: 'MacBook Pro 16" M3 Max', brand: 'Apple', category: 'Laptops', priceCents: 45000000 },
    { id: 'app_iphone_15pm', name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', category: 'Phones', priceCents: 19500000 },
    { id: 'app_studio_disp', name: 'Apple Studio Display 27"', brand: 'Apple', category: 'Displays', priceCents: 24000000 },
    { id: 'app_ipad_pro', name: 'iPad Pro 12.9" M2', brand: 'Apple', category: 'Tablets', priceCents: 16000000 },
  ],
  Dell: [
    { id: 'dell_xps_15', name: 'Dell XPS 15 OLED i9', brand: 'Dell', category: 'Laptops', priceCents: 32000000 },
    { id: 'dell_alien_r16', name: 'Alienware Aurora R16 Gaming Desktop', brand: 'Dell', category: 'Desktops', priceCents: 38000000 },
    { id: 'dell_ultrasharp_32', name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor', brand: 'Dell', category: 'Monitors', priceCents: 11500000 },
  ],
  Logitech: [
    { id: 'logi_mx_master', name: 'Logitech MX Master 3S Wireless Mouse', brand: 'Logitech', category: 'Peripherals', priceCents: 1450000 },
    { id: 'logi_mx_mech', name: 'Logitech MX Mechanical Keyboard', brand: 'Logitech', category: 'Peripherals', priceCents: 2200000 },
    { id: 'logi_brio_4k', name: 'Logitech Brio 4K Ultra HD Pro Webcam', brand: 'Logitech', category: 'Accessories', priceCents: 2800000 },
  ],
  Samsung: [
    { id: 'sam_s24_ultra', name: 'Samsung Galaxy S24 Ultra 512GB', brand: 'Samsung', category: 'Phones', priceCents: 18500000 },
    { id: 'sam_odyssey_g9', name: 'Samsung Odyssey Neo G9 49" Curved Gaming Monitor', brand: 'Samsung', category: 'Monitors', priceCents: 28500000 },
  ],
};

const INTERACTION_WEIGHTS: Record<InteractionType, number> = {
  view_item: 1,
  add_to_wishlist: 2,
  add_to_cart: 3,
  remove_from_cart: 0,
  begin_checkout: 4,
  purchase: 5,
};

export class MarketDatasetGenerator {
  private rng: SeededRandom;

  constructor(seed: number = 2026) {
    this.rng = new SeededRandom(seed);
  }

  generateDataset(sessionCount: number = 50): CustomerInteractionRecord[] {
    const dataset: CustomerInteractionRecord[] = [];
    const baseTime = new Date('2026-10-19T08:00:00Z').getTime();

    for (let s = 0; s < sessionCount; s++) {
      const customer: ScopedCustomer = this.rng.pick(REAL_CUSTOMERS);
      const chosenBrand = this.rng.pick(customer.preferredBrands);
      const vendor = REAL_VENDORS.find(v => v.brand === chosenBrand) || REAL_VENDORS[0];
      const items = VENDOR_CATALOGS[chosenBrand] || VENDOR_CATALOGS.Apple;
      const targetItem = this.rng.pick(items);

      const sessionId = `sess_${s + 1000}_${customer.id}`;
      let currentTime = baseTime + s * 300_000 + this.rng.nextInt(10_000, 60_000);

      const pushRecord = (type: InteractionType, dwell: number) => {
        currentTime += dwell * 1000;
        dataset.push({
          sessionId,
          timestamp: new Date(currentTime).toISOString(),
          userId: customer.id,
          userEmail: customer.email,
          userLocation: customer.location,
          vendorId: vendor.id,
          vendorName: vendor.name,
          productId: targetItem.id,
          productName: targetItem.name,
          brand: targetItem.brand,
          category: targetItem.category,
          priceCents: targetItem.priceCents,
          interactionType: type,
          dwellTimeSeconds: dwell,
          weight: INTERACTION_WEIGHTS[type],
        });
      };

      // 1. Browsing (view_item)
      pushRecord('view_item', this.rng.nextInt(15, 60));

      // 2. Chance of Wishlist
      if (this.rng.next() < 0.4) {
        pushRecord('add_to_wishlist', this.rng.nextInt(5, 15));
      }

      // 3. Chance of Add to Cart
      if (this.rng.next() > 0.25) {
        pushRecord('add_to_cart', this.rng.nextInt(5, 20));

        // 4. Cart Abandonment vs Checkout
        if (this.rng.next() < customer.cartAbandonProbability) {
          // Abandon or remove
          if (this.rng.next() < 0.5) {
            pushRecord('remove_from_cart', this.rng.nextInt(5, 10));
          }
          continue; // End session
        }

        // 5. Begin Checkout
        pushRecord('begin_checkout', this.rng.nextInt(20, 60));

        // 6. Complete Purchase
        if (this.rng.next() < customer.purchaseProbability) {
          pushRecord('purchase', this.rng.nextInt(10, 30));
        }
      }
    }

    return dataset;
  }

  saveToFile(dataset: CustomerInteractionRecord[], outputDir: string): { jsonlPath: string; csvPath: string } {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const jsonlPath = path.join(outputDir, 'customer_vendor_interactions.jsonl');
    const jsonlLines = dataset.map(record => JSON.stringify(record)).join('\n');
    fs.writeFileSync(jsonlPath, jsonlLines, 'utf-8');

    const csvPath = path.join(outputDir, 'customer_vendor_interactions.csv');
    const headers = [
      'sessionId',
      'timestamp',
      'userId',
      'userEmail',
      'userLocation',
      'vendorId',
      'vendorName',
      'productId',
      'productName',
      'brand',
      'category',
      'priceCents',
      'interactionType',
      'dwellTimeSeconds',
      'weight',
    ].join(',');

    const csvRows = dataset.map(r =>
      [
        r.sessionId,
        r.timestamp,
        r.userId,
        r.userEmail,
        `"${r.userLocation}"`,
        r.vendorId,
        `"${r.vendorName}"`,
        r.productId,
        `"${r.productName}"`,
        r.brand,
        r.category,
        r.priceCents,
        r.interactionType,
        r.dwellTimeSeconds,
        r.weight,
      ].join(',')
    );

    fs.writeFileSync(csvPath, [headers, ...csvRows].join('\n'), 'utf-8');

    return { jsonlPath, csvPath };
  }
}

