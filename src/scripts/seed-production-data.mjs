import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../../serviceAccountKey.json' with { type: 'json' };

const isDryRun = process.argv.includes('--dry-run');

// Safeguard against wrong project
if (serviceAccount.project_id !== 'techstore-ke') {
  console.error(`❌ SAFEGUARD: Refusing to seed project '${serviceAccount.project_id}'. Expected 'techstore-ke'.`);
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore(app);
const auth = getAuth(app);

// ---------------------------------------------------------
// 1. PRODUCTION VENDORS & CLIENTS SPECIFICATION
// ---------------------------------------------------------
const VENDORS = [
  {
    vendorKey: 'apple',
    email: 'apple.vendor@techstore.co.ke',
    password: 'password123',
    displayName: 'Apple Authorized Kenya',
    role: 'vendor',
    vendorBrand: 'Apple',
    phone: '+254 720 100 200',
    address: 'Sarit Centre, Westlands, Nairobi',
    segment: 'VIP',
    isDemo: true,
  },
  {
    vendorKey: 'dell',
    email: 'dell.vendor@techstore.co.ke',
    password: 'password123',
    displayName: 'Dell Enterprise East Africa',
    role: 'vendor',
    vendorBrand: 'Dell',
    phone: '+254 721 300 400',
    address: 'Delta Corner Tower, Chiromo Rd, Nairobi',
    segment: 'VIP',
    isDemo: true,
  },
  {
    vendorKey: 'logitech',
    email: 'logitech.vendor@techstore.co.ke',
    password: 'password123',
    displayName: 'Logitech Regional Store',
    role: 'vendor',
    vendorBrand: 'Logitech',
    phone: '+254 722 500 600',
    address: 'The Hub Karen, Nairobi',
    segment: 'Regular',
    isDemo: true,
  },
  {
    vendorKey: 'samsung',
    email: 'samsung.vendor@techstore.co.ke',
    password: 'password123',
    displayName: 'Samsung Electronics KE',
    role: 'vendor',
    vendorBrand: 'Samsung',
    phone: '+254 723 700 800',
    address: 'Two Rivers Mall, Limuru Rd, Nairobi',
    segment: 'VIP',
    isDemo: true,
  },
  {
    vendorKey: 'official',
    email: 'vendor@demo.com',
    password: 'password123',
    displayName: 'TechStore Kenya Official',
    role: 'vendor',
    vendorBrand: 'TechStore Official',
    phone: '+254 700 123 456',
    address: 'TechStore Logistics Hub, Mombasa Rd, Nairobi',
    segment: 'VIP',
    isDemo: true,
  },
];

const CLIENTS = [
  {
    clientKey: 'jane',
    email: 'client@demo.com',
    password: 'password123',
    displayName: 'Jane Wanjiku',
    role: 'client',
    phone: '+254 712 345 678',
    address: 'Apt 4B, Rhapta Heights, Westlands, Nairobi',
    segment: 'VIP',
    isDemo: true,
  },
  {
    clientKey: 'brian',
    email: 'brian.otieno@gmail.com',
    password: 'password123',
    displayName: 'Brian Otieno',
    role: 'client',
    phone: '+254 722 890 123',
    address: 'Court 12, Dennis Pritt Rd, Kilimani, Nairobi',
    segment: 'Regular',
    isDemo: true,
  },
  {
    clientKey: 'sarah',
    email: 'sarah.kimani@corporate.co.ke',
    password: 'password123',
    displayName: 'Sarah Kimani',
    role: 'client',
    phone: '+254 733 456 789',
    address: 'Upper Hill Medical Plaza 6th Fl, Nairobi',
    segment: 'VIP',
    isDemo: true,
  },
  {
    clientKey: 'hassan',
    email: 'hassan.omar@mombasa-tech.com',
    password: 'password123',
    displayName: 'Hassan Omar',
    role: 'client',
    phone: '+254 701 234 567',
    address: 'Links Road Estate, Nyali, Mombasa',
    segment: 'Regular',
    isDemo: true,
  },
  {
    clientKey: 'admin',
    email: 'admin@demo.com',
    password: 'password123',
    displayName: 'System Administrator',
    role: 'admin',
    phone: '+254 700 000 001',
    address: 'TechStore HQ, Nairobi',
    segment: 'VIP',
    isDemo: true,
  },
  {
    clientKey: 'owner',
    email: 'devmahnx@gmail.com',
    password: 'password123',
    displayName: 'Dev Mahnx',
    role: 'admin',
    phone: '+254 700 000 002',
    address: 'TechStore Development Lab, Nairobi',
    segment: 'VIP',
    isDemo: true,
  },
];

// Helper to match vendor based on product brand
function assignVendorForProduct(brand, vendorMap) {
  const b = (brand || '').toLowerCase();
  if (b.includes('apple')) return vendorMap['apple'];
  if (b.includes('dell')) return vendorMap['dell'];
  if (b.includes('logitech')) return vendorMap['logitech'];
  if (b.includes('samsung')) return vendorMap['samsung'];
  return vendorMap['official'];
}

async function runSeed() {
  console.log(`\n======================================================`);
  console.log(`🚀 PRODUCTION DATA SEEDER FOR: ${serviceAccount.project_id}`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE EXECUTION'}`);
  console.log(`======================================================\n`);

  // ---------------------------------------------------------
  // STEP 1: PROVISION AUTH & FIRESTORE USERS (IDEMPOTENT)
  // ---------------------------------------------------------
  console.log('--- Step 1: Provisioning Vendor & Client Accounts ---');
  const allUsersToSeed = [...VENDORS, ...CLIENTS];
  const userCache = {}; // key -> { uid, email, displayName, role, ... }

  for (const u of allUsersToSeed) {
    let authUser;
    try {
      authUser = await auth.getUserByEmail(u.email);
      console.log(`ℹ️ Auth User Exists: ${u.email} (UID: ${authUser.uid})`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        if (!isDryRun) {
          authUser = await auth.createUser({
            email: u.email,
            password: u.password,
            displayName: u.displayName,
          });
          console.log(`✅ Created Auth User: ${u.email} (UID: ${authUser.uid})`);
        } else {
          authUser = { uid: `simulated-${u.email}` };
          console.log(`[DRY-RUN] Would create Auth User: ${u.email}`);
        }
      } else {
        throw err;
      }
    }

    const key = u.vendorKey || u.clientKey;
    userCache[key] = {
      uid: authUser.uid,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      vendorBrand: u.vendorBrand,
      phone: u.phone,
      address: u.address,
    };

    if (!isDryRun) {
      const userProfileData = {
        uid: authUser.uid,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        address: u.address,
        phone: u.phone,
        segment: u.segment,
        isDemo: true,
        createdAt: new Date().toISOString(),
      };
      if (u.role === 'vendor') {
        userProfileData.vendorId = authUser.uid;
        userProfileData.vendorBrand = u.vendorBrand;
      }
      await db.collection('users').doc(authUser.uid).set(userProfileData, { merge: true });
    }
  }

  // ---------------------------------------------------------
  // STEP 2: LINK EXISTING PRODUCTS TO STABLE VENDOR IDs
  // ---------------------------------------------------------
  console.log('\n--- Step 2: Assigning Catalog Products to Stable Vendor IDs ---');
  const productsSnap = await db.collection('products').get();
  console.log(`Found ${productsSnap.size} existing catalog products.`);

  const productList = [];
  const updateBatch = db.batch();
  let assignedCount = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const vendor = assignVendorForProduct(data.brand, userCache);

    productList.push({
      id: doc.id,
      name: data.name,
      price: data.price,
      brand: data.brand,
      category: data.category,
      imageUrl: data.imageUrl,
      vendorId: vendor?.uid || 'official',
      vendorName: vendor?.displayName || 'TechStore Kenya Official',
    });

    if (!isDryRun && vendor) {
      updateBatch.update(doc.ref, {
        vendorId: vendor.uid,
        vendor: vendor.displayName,
        updatedAt: Timestamp.now(),
      });
      assignedCount++;
    }
  }

  if (!isDryRun && assignedCount > 0) {
    await updateBatch.commit();
    console.log(`✅ Successfully assigned ${assignedCount} products to vendor profiles.`);
  }

  // Helper product pickers
  const findProduct = (keyword) => productList.find(p => p.name.toLowerCase().includes(keyword.toLowerCase())) || productList[0];

  const macbook = findProduct('macbook');
  const dellXps = findProduct('xps 13');
  const optiplex = findProduct('optiplex');
  const mxMaster = findProduct('mx master');
  const brio = findProduct('brio');
  const odyssey = findProduct('odyssey');
  const ssd990 = findProduct('990 pro');
  const sonyWh = findProduct('wh-1000xm5');
  const rtx4090 = findProduct('4090');
  const appleWatch = findProduct('watch ultra');
  const dockTS4 = findProduct('ts4');
  const ramKit = findProduct('corsair vengeance');

  // ---------------------------------------------------------
  // STEP 3: SEED DETERMINISTIC CLIENT PURCHASES & ORDERS
  // ---------------------------------------------------------
  console.log('\n--- Step 3: Generating Real Multi-Vendor Orders ---');

  const ORDERS_TO_SEED = [
    {
      id: 'ORD-2026-KE-01',
      client: userCache['jane'],
      status: 'Delivered',
      daysAgo: 14,
      items: [
        { product: macbook, quantity: 1 },
        { product: mxMaster, quantity: 1 },
      ],
    },
    {
      id: 'ORD-2026-KE-02',
      client: userCache['sarah'],
      status: 'Delivered',
      daysAgo: 10,
      items: [
        { product: dellXps, quantity: 2 },
        { product: optiplex, quantity: 3 },
      ],
    },
    {
      id: 'ORD-2026-KE-03',
      client: userCache['brian'],
      status: 'Delivered',
      daysAgo: 7,
      items: [
        { product: rtx4090, quantity: 1 },
        { product: odyssey, quantity: 1 },
        { product: ramKit, quantity: 2 },
      ],
    },
    {
      id: 'ORD-2026-KE-04',
      client: userCache['hassan'],
      status: 'Delivered',
      daysAgo: 5,
      items: [
        { product: sonyWh, quantity: 1 },
        { product: appleWatch, quantity: 1 },
      ],
    },
    {
      id: 'ORD-2026-KE-05',
      client: userCache['jane'],
      status: 'Processing',
      daysAgo: 2,
      items: [
        { product: ssd990, quantity: 2 },
        { product: dockTS4, quantity: 1 },
      ],
    },
    {
      id: 'ORD-2026-KE-06',
      client: userCache['brian'],
      status: 'Processing',
      daysAgo: 1,
      items: [
        { product: brio, quantity: 1 },
      ],
    },
  ];

  for (const ord of ORDERS_TO_SEED) {
    const orderItems = ord.items.map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      vendorId: i.product.vendorId,
      vendorName: i.product.vendorName,
      quantity: i.quantity,
      price: i.product.price,
      imageUrl: i.product.imageUrl,
    }));

    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vendorIds = [...new Set(orderItems.map(i => i.vendorId))];
    const timestamp = new Date(Date.now() - (ord.daysAgo * 86400000)).toISOString();

    const orderDoc = {
      id: ord.id,
      productName: orderItems.map(i => `${i.productName} (x${i.quantity})`).join(', '),
      status: ord.status,
      timestamp,
      total,
      user: ord.client.email,
      userId: ord.client.uid,
      shippingAddress: ord.client.address,
      items: orderItems,
      vendorIds,
      currency: 'KES',
      isDemo: true,
    };

    if (!isDryRun) {
      await db.collection('orders').doc(ord.id).set(orderDoc, { merge: true });
      console.log(`📦 Seeded Order ${ord.id} - Customer: ${ord.client.displayName} | KES ${total.toLocaleString()} | Vendors: ${vendorIds.length}`);
    } else {
      console.log(`[DRY-RUN] Would seed Order ${ord.id} - KES ${total.toLocaleString()}`);
    }
  }

  // ---------------------------------------------------------
  // STEP 4: SEED REALISTIC REVIEWS LINKED TO COMPLETED PURCHASES
  // ---------------------------------------------------------
  console.log('\n--- Step 4: Seeding Verified Product Reviews ---');

  const REVIEWS_TO_SEED = [
    {
      productId: macbook.id,
      client: userCache['jane'],
      rating: 5,
      text: 'Outstanding machine! The M2 battery life easily gets me through two work days in Westlands without charging.',
    },
    {
      productId: mxMaster.id,
      client: userCache['jane'],
      rating: 5,
      text: 'The electromagnetic scroll wheel is addictive. Essential tool for spreadsheets and graphic design.',
    },
    {
      productId: dellXps.id,
      client: userCache['sarah'],
      rating: 5,
      text: 'Equipped our executive team with these. Exceptional build quality and Dell ProSupport is great in Kenya.',
    },
    {
      productId: rtx4090.id,
      client: userCache['brian'],
      rating: 5,
      text: 'Absolute monster GPU. Runs Flight Simulator and Cyberpunk at 4K Ultra with 120+ fps effortlessly.',
    },
    {
      productId: sonyWh.id,
      client: userCache['hassan'],
      rating: 5,
      text: 'The best noise cancellation for frequent flights between Mombasa and Nairobi. Crystal clear calls.',
    },
  ];

  for (const rev of REVIEWS_TO_SEED) {
    const reviewId = `rev-${rev.productId.substring(0, 15)}-${rev.client.uid.substring(0, 6)}`;
    const reviewData = {
      id: reviewId,
      userId: rev.client.uid,
      userName: rev.client.displayName,
      rating: rev.rating,
      text: rev.text,
      verifiedPurchase: true,
      timestamp: new Date().toISOString(),
      isDemo: true,
    };

    if (!isDryRun) {
      await db.collection('products').doc(rev.productId).collection('reviews').doc(reviewId).set(reviewData, { merge: true });
      console.log(`⭐ Seeded Review for: ${rev.productId} by ${rev.client.displayName}`);
    }
  }

  // ---------------------------------------------------------
  // STEP 5: SEED ACTIVE CARTS & WISHLISTS FOR CLIENTS
  // ---------------------------------------------------------
  console.log('\n--- Step 5: Seeding Client Carts & Wishlists ---');

  if (!isDryRun) {
    // Jane's Cart
    const janeCart = [
      { product: dockTS4, qty: 1 },
      { product: findProduct('anker prime'), qty: 1 },
    ];
    for (const item of janeCart) {
      await db.collection('users').doc(userCache['jane'].uid).collection('cart').doc(item.product.id).set({
        productId: item.product.id,
        quantity: item.qty,
        name: item.product.name,
        price: item.product.price,
        imageUrl: item.product.imageUrl,
      }, { merge: true });
    }

    // Jane's Wishlist
    await db.collection('users').doc(userCache['jane'].uid).set({
      wishlist: [findProduct('keychron').id, findProduct('proart').id],
    }, { merge: true });

    // Brian's Wishlist
    await db.collection('users').doc(userCache['brian'].uid).set({
      wishlist: [findProduct('crucial t700').id, findProduct('rapture').id],
    }, { merge: true });

    console.log('🛒 Seeded active cart and wishlist items for client accounts.');
  }

  console.log(`\n======================================================`);
  console.log(`🎉 PRODUCTION DATA SEEDING COMPLETE!`);
  console.log(`======================================================\n`);
}

runSeed().catch(err => {
  console.error('\n❌ Fatal Seed Error:', err);
  process.exit(1);
});

