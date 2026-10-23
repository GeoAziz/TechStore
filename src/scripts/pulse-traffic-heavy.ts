/**
 * High-Density Realistic Commerce Pulse Generator
 *
 * Generates batches of realistic shopper journeys with full full-funnel steps:
 * Discovery (view_item_list) ➔ View (view_item) ➔ Cart (add_to_cart) ➔ Checkout (purchase)
 * Uses standard GA4 client_id (format: <random>.<timestamp>) and session_id
 */

const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || 'G-RTDRRL0F9B';
const GA4_API_SECRET = process.env.GA4_API_SECRET || 'r-dQbQdNQ22FBtS0aNy6Rg';

const CATALOG_POOLS = [
  { id: 'apple-macbook-pro-m3', name: 'Apple MacBook Pro M3 Max', brand: 'Apple', category: 'Laptops', price: 245000 },
  { id: 'apple-macbook-air-m2', name: 'Apple MacBook Air M2 13.6″', brand: 'Apple', category: 'Laptops', price: 165000 },
  { id: 'dell-xps-13', name: 'Dell XPS 13 9315 Core i7', brand: 'Dell', category: 'Laptops', price: 155000 },
  { id: 'asus-rog-rtx-4090', name: 'ASUS ROG Strix RTX 4090 24GB', brand: 'ASUS', category: 'Graphic Cards', price: 320000 },
  { id: 'samsung-s24-ultra', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Phones', price: 155000 },
  { id: 'samsung-odyssey-g7', name: 'Samsung Odyssey G7 32″ 240Hz', brand: 'Samsung', category: 'Monitors', price: 89000 },
  { id: 'sony-wh1000-xm5', name: 'Sony WH-1000XM5 Wireless Headphones', brand: 'Sony', category: 'Headphones', price: 45000 },
  { id: 'logitech-mx-master-3s', name: 'Logitech MX Master 3S Mouse', brand: 'Logitech', category: 'Mice', price: 15500 },
  { id: 'logitech-brio-4k', name: 'Logitech Brio 4K Webcam', brand: 'Logitech', category: 'Webcams', price: 24500 },
  { id: 'caldigit-ts4-dock', name: 'CalDigit TS4 Thunderbolt 4 Dock', brand: 'CalDigit', category: 'Accessories', price: 58000 },
  { id: 'samsung-990-pro-2tb', name: 'Samsung 990 PRO 2TB PCIe 4.0 SSD', brand: 'Samsung', category: 'Storage Drives', price: 29500 },
  { id: 'anker-prime-20000', name: 'Anker Prime 20,000mAh Power Bank', brand: 'Anker', category: 'Accessories', price: 18500 },
];

const PAGES = [
  { url: 'https://techstore.co.ke/shop', title: 'TechStore Kenya | Browse All Tech' },
  { url: 'https://techstore.co.ke/shop/laptops', title: 'Laptops & Workstations | TechStore Kenya' },
  { url: 'https://techstore.co.ke/shop/gaming', title: 'Gaming Rigs & High-Performance Components' },
  { url: 'https://techstore.co.ke/shop/monitors', title: 'Professional Displays & UltraSharp' },
  { url: 'https://techstore.co.ke/deals', title: 'Flash Tech Deals & Limited Promotions' },
];

export async function generateTrafficBatch(batchSize: number = 25) {
  const now = Math.floor(Date.now() / 1000);
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

  console.log(`📡 Dispatching batch of ${batchSize} concurrent shoppers to GA4 (${GA4_MEASUREMENT_ID})...`);

  const promises = [];

  for (let i = 0; i < batchSize; i++) {
    const randomInt = Math.floor(Math.random() * 9000000000) + 1000000000;
    const clientId = `${randomInt}.${now - Math.floor(Math.random() * 300)}`;
    const sessionId = `${now - Math.floor(Math.random() * 300)}`;
    const randomProduct = CATALOG_POOLS[Math.floor(Math.random() * CATALOG_POOLS.length)];
    const randomPage = PAGES[Math.floor(Math.random() * PAGES.length)];
    const engagementMs = Math.floor(Math.random() * 35000) + 10000;

    // Decide user intent
    const isBuyer = Math.random() < 0.25; // 25% purchase conversion
    const isCartAdder = Math.random() < 0.55; // 55% add to cart

    const events: any[] = [
      {
        name: 'page_view',
        params: {
          session_id: sessionId,
          page_location: randomPage.url,
          page_title: randomPage.title,
          engagement_time_msec: engagementMs,
        },
      },
      {
        name: 'user_engagement',
        params: {
          session_id: sessionId,
          engagement_time_msec: engagementMs,
        },
      },
      {
        name: 'view_item',
        params: {
          session_id: sessionId,
          currency: 'KES',
          value: randomProduct.price,
          items: [
            {
              item_id: randomProduct.id,
              item_name: randomProduct.name,
              item_brand: randomProduct.brand,
              item_category: randomProduct.category,
              price: randomProduct.price,
              quantity: 1,
            },
          ],
        },
      },
    ];

    if (isCartAdder || isBuyer) {
      events.push({
        name: 'add_to_cart',
        params: {
          session_id: sessionId,
          currency: 'KES',
          value: randomProduct.price,
          items: [
            {
              item_id: randomProduct.id,
              item_name: randomProduct.name,
              item_brand: randomProduct.brand,
              item_category: randomProduct.category,
              price: randomProduct.price,
              quantity: 1,
            },
          ],
        },
      });
    }

    if (isBuyer) {
      events.push({
        name: 'purchase',
        params: {
          session_id: sessionId,
          transaction_id: `ORD-AUTO-${now}-${i + 1}`,
          currency: 'KES',
          value: randomProduct.price,
          shipping: 1000,
          tax: Math.round(randomProduct.price * 0.16),
          items: [
            {
              item_id: randomProduct.id,
              item_name: randomProduct.name,
              item_brand: randomProduct.brand,
              item_category: randomProduct.category,
              price: randomProduct.price,
              quantity: 1,
            },
          ],
        },
      });
    }

    promises.push(
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          events,
        }),
      }).then(res => ({
        clientId,
        product: randomProduct.name,
        isBuyer,
        status: res.status,
      }))
    );
  }

  const results = await Promise.all(promises);
  const buyersCount = results.filter(r => r.isBuyer).length;
  console.log(`✅ Completed ${results.length} shopper sessions (Purchases dispatched: ${buyersCount})`);
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('pulse-traffic-heavy.ts')) {
  const count = parseInt(process.argv[2] || '30', 10);
  generateTrafficBatch(count).catch(console.error);
}

