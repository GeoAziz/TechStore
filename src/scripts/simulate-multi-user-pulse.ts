/**
 * Multi-User Concurrent Traffic & Commerce Simulator for GA4
 *
 * Simulates concurrent, realistic active shopper sessions across Kenya:
 * - Jane Wanjiku (Westlands, Nairobi) -> Apple ecosystem shopper
 * - Brian Otieno (Kilimani, Nairobi) -> Custom Gaming PC builder
 * - Sarah Kimani (Upper Hill, Nairobi) -> Corporate Dell IT buyer
 * - Hassan Omar (Nyali, Mombasa) -> Logitech peripherals & audio buyer
 * - David Mutua (Karen, Nairobi) -> Samsung flagship tech enthusiast
 * - Grace Achieng (Kisumu Central) -> Creator & Webcam gear
 * - Kevin Kiprop (Eldoret Town) -> High-speed SSD storage shopper
 * - Mercy Njeri (Nakuru Town) -> Smart tech & accessories
 */

const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || 'G-RTDRRL0F9B';
const GA4_API_SECRET = process.env.GA4_API_SECRET || 'r-dQbQdNQ22FBtS0aNy6Rg';

const SIMULATED_SHOPPERS = [
  {
    userId: 'client-jane-ke-01',
    clientId: 'shopper_jane_wanjiku_01',
    name: 'Jane Wanjiku',
    location: 'Westlands, Nairobi',
    pageLocation: 'https://techstore.co.ke/shop/laptops',
    pageTitle: 'Laptops & Workstations | TechStore Kenya',
    event: 'view_item',
    item: {
      item_id: 'apple-macbook-pro-m3',
      item_name: 'Apple MacBook Pro M3 Max',
      item_brand: 'Apple',
      item_category: 'Laptops',
      price: 245000,
      quantity: 1,
    },
  },
  {
    userId: 'client-brian-ke-02',
    clientId: 'shopper_brian_otieno_02',
    name: 'Brian Otieno',
    location: 'Kilimani, Nairobi',
    pageLocation: 'https://techstore.co.ke/shop/gaming',
    pageTitle: 'Gaming Rigs & GPUs | TechStore Kenya',
    event: 'add_to_cart',
    item: {
      item_id: 'asus-rog-rtx-4090',
      item_name: 'ASUS ROG Strix GeForce RTX 4090 24GB',
      item_brand: 'ASUS',
      item_category: 'Graphic Cards',
      price: 320000,
      quantity: 1,
    },
  },
  {
    userId: 'client-sarah-ke-03',
    clientId: 'shopper_sarah_kimani_03',
    name: 'Sarah Kimani',
    location: 'Upper Hill, Nairobi',
    pageLocation: 'https://techstore.co.ke/shop/monitors',
    pageTitle: 'Professional Displays | TechStore Kenya',
    event: 'begin_checkout',
    item: {
      item_id: 'dell-ultrasharp-34',
      item_name: 'Dell UltraSharp 34 Curved USB-C Monitor',
      item_brand: 'Dell',
      item_category: 'Monitors',
      price: 145000,
      quantity: 2,
    },
  },
  {
    userId: 'client-hassan-ke-04',
    clientId: 'shopper_hassan_omar_04',
    name: 'Hassan Omar',
    location: 'Nyali, Mombasa',
    pageLocation: 'https://techstore.co.ke/shop/accessories',
    pageTitle: 'Productivity Keyboards & Mice | TechStore Kenya',
    event: 'view_item',
    item: {
      item_id: 'logitech-mx-master-3s',
      item_name: 'Logitech MX Master 3S Wireless Mouse',
      item_brand: 'Logitech',
      item_category: 'Mice',
      price: 15500,
      quantity: 1,
    },
  },
  {
    userId: 'client-david-ke-05',
    clientId: 'shopper_david_mutua_05',
    name: 'David Mutua',
    location: 'Karen, Nairobi',
    pageLocation: 'https://techstore.co.ke/shop/phones',
    pageTitle: 'Flagship Smartphones | TechStore Kenya',
    event: 'add_to_cart',
    item: {
      item_id: 'samsung-s24-ultra',
      item_name: 'Samsung Galaxy S24 Ultra Titanium',
      item_brand: 'Samsung',
      item_category: 'Phones',
      price: 155000,
      quantity: 1,
    },
  },
  {
    userId: 'client-grace-ke-06',
    clientId: 'shopper_grace_achieng_06',
    name: 'Grace Achieng',
    location: 'Kisumu Central',
    pageLocation: 'https://techstore.co.ke/shop/webcams',
    pageTitle: 'Streaming & Video Gear | TechStore Kenya',
    event: 'view_item',
    item: {
      item_id: 'logitech-brio-4k',
      item_name: 'Logitech Brio 4K Ultra HD Pro Webcam',
      item_brand: 'Logitech',
      item_category: 'Webcams',
      price: 24500,
      quantity: 1,
    },
  },
  {
    userId: 'client-kevin-ke-07',
    clientId: 'shopper_kevin_kiprop_07',
    name: 'Kevin Kiprop',
    location: 'Eldoret Town',
    pageLocation: 'https://techstore.co.ke/shop/storage',
    pageTitle: 'High-Speed NVMe Storage | TechStore Kenya',
    event: 'add_to_cart',
    item: {
      item_id: 'samsung-990-pro-2tb',
      item_name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe SSD',
      item_brand: 'Samsung',
      item_category: 'Storage Drives',
      price: 29500,
      quantity: 2,
    },
  },
  {
    userId: 'client-mercy-ke-08',
    clientId: 'shopper_mercy_njeri_08',
    name: 'Mercy Njeri',
    location: 'Nakuru Town',
    pageLocation: 'https://techstore.co.ke/deals',
    pageTitle: 'Flash Tech Deals | TechStore Kenya',
    event: 'view_item',
    item: {
      item_id: 'anker-prime-20000',
      item_name: 'Anker Prime 20,000mAh Power Bank 200W',
      item_brand: 'Anker',
      item_category: 'Accessories',
      price: 18500,
      quantity: 1,
    },
  },
];

async function sendShopperSession(shopper: typeof SIMULATED_SHOPPERS[0]) {
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

  const payload = {
    client_id: shopper.clientId,
    user_id: shopper.userId,
    events: [
      {
        name: 'page_view',
        params: {
          page_location: shopper.pageLocation,
          page_title: shopper.pageTitle,
          engagement_time_msec: Math.floor(Math.random() * 20000) + 5000,
        },
      },
      {
        name: 'user_engagement',
        params: {
          engagement_time_msec: Math.floor(Math.random() * 20000) + 5000,
        },
      },
      {
        name: shopper.event,
        params: {
          currency: 'KES',
          value: shopper.item.price * shopper.item.quantity,
          items: [shopper.item],
        },
      },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return { name: shopper.name, location: shopper.location, status: res.status };
}

async function runMultiUserSimulation() {
  console.log('========================================================');
  console.log('🌍 TECHSTORE CONCURRENT MULTI-USER GA4 TRAFFIC PULSE');
  console.log(`Target: ${GA4_MEASUREMENT_ID} | Active Shoppers: ${SIMULATED_SHOPPERS.length}`);
  console.log('========================================================\n');

  const results = await Promise.all(SIMULATED_SHOPPERS.map(s => sendShopperSession(s)));

  results.forEach(r => {
    console.log(`👤 ${r.name.padEnd(16)} | 📍 ${r.location.padEnd(20)} | GA4 Status: ${r.status}`);
  });

  console.log('\n========================================================');
  console.log('🎉 8 CONCURRENT SHOPPERS DISPATCHED TO REALTIME OVERVIEW!');
  console.log('========================================================');
}

runMultiUserSimulation().catch(err => {
  console.error('Simulation error:', err);
  process.exit(1);
});

