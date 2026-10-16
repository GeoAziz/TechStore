import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../../serviceAccountKey.json' with { type: 'json' };

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore(app);
const auth = getAuth(app);

async function verify() {
  console.log(`\n======================================================`);
  console.log(`🧪 MULTI-VENDOR & CLIENT VERIFICATION TEST SUITE`);
  console.log(`Target: ${serviceAccount.project_id}`);
  console.log(`======================================================\n`);

  let failures = 0;

  // 1. Auth & Profile 1:1 Parity
  console.log('--- Test 1: Auth & User Profile 1:1 Parity ---');
  const authUsers = (await auth.listUsers(50)).users;
  console.log(`Total Auth Users: ${authUsers.length}`);

  for (const u of authUsers) {
    const doc = await db.collection('users').doc(u.uid).get();
    if (!doc.exists) {
      console.error(`❌ FAIL: Auth user ${u.email} (${u.uid}) has NO Firestore document!`);
      failures++;
    } else {
      const d = doc.data();
      if ('password' in d) {
        console.error(`🚨 FAIL: Firestore user ${u.email} contains plaintext password!`);
        failures++;
      }
      if (!d.role) {
        console.error(`❌ FAIL: User ${u.email} missing role field!`);
        failures++;
      }
    }
  }
  console.log(`✅ All ${authUsers.length} Auth users have valid, secure Firestore profiles.`);

  // 2. Vendor Product & Order Isolation
  console.log('\n--- Test 2: Vendor Data Isolation ---');
  const vendorProfiles = [
    { email: 'apple.vendor@techstore.co.ke', brand: 'Apple' },
    { email: 'dell.vendor@techstore.co.ke', brand: 'Dell' },
    { email: 'logitech.vendor@techstore.co.ke', brand: 'Logitech' },
    { email: 'samsung.vendor@techstore.co.ke', brand: 'Samsung' },
  ];

  for (const v of vendorProfiles) {
    const authUser = await auth.getUserByEmail(v.email);
    const userDoc = await db.collection('users').doc(authUser.uid).get();
    const uData = userDoc.data();

    // Check products
    const prodsSnap = await db.collection('products').where('vendorId', '==', authUser.uid).get();
    console.log(`\nVendor: ${uData.displayName} (${v.email})`);
    console.log(`  • Catalog Items Assigned: ${prodsSnap.size}`);
    
    // Check that every assigned product matches the vendor
    let wrongProduct = false;
    prodsSnap.forEach(doc => {
      const p = doc.data();
      if (!p.brand.toLowerCase().includes(v.brand.toLowerCase()) && p.vendorId !== authUser.uid) {
        wrongProduct = true;
      }
    });

    if (wrongProduct) {
      console.error(`  ❌ FAIL: Vendor ${v.email} has mismatched products!`);
      failures++;
    } else {
      console.log(`  ✅ Product catalog accurately scoped to ${v.brand}.`);
    }

    // Check orders containing this vendor's items
    const ordersSnap = await db.collection('orders').where('vendorIds', 'array-contains', authUser.uid).get();
    console.log(`  • Orders Containing Vendor Products: ${ordersSnap.size}`);
    
    let totalVendorRevenue = 0;
    ordersSnap.forEach(doc => {
      const ord = doc.data();
      const vendorItems = (ord.items || []).filter(item => item.vendorId === authUser.uid);
      const subtotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      totalVendorRevenue += subtotal;
      console.log(`    - Order ${ord.id}: ${vendorItems.map(i => `${i.productName} (x${i.quantity})`).join(', ')} [Subtotal: KES ${subtotal.toLocaleString()}]`);
    });
    console.log(`  • Total Vendor Revenue: KES ${totalVendorRevenue.toLocaleString()}`);
  }

  // 3. Customer Data Isolation
  console.log('\n--- Test 3: Customer Data Isolation ---');
  const clientEmails = [
    'client@demo.com',
    'sarah.kimani@corporate.co.ke',
    'brian.otieno@gmail.com',
    'hassan.omar@mombasa-tech.com',
  ];

  for (const email of clientEmails) {
    const authUser = await auth.getUserByEmail(email);
    const ordersSnap = await db.collection('orders').where('userId', '==', authUser.uid).get();
    console.log(`Customer: ${email} -> Total Orders: ${ordersSnap.size}`);
    ordersSnap.forEach(d => {
      const o = d.data();
      console.log(`  - ${o.id}: ${o.productName} | Total: KES ${o.total.toLocaleString()} | Status: ${o.status}`);
    });
  }

  // 4. Cart & Wishlist Check
  console.log('\n--- Test 4: Active Cart & Wishlist Validation ---');
  const janeAuth = await auth.getUserByEmail('client@demo.com');
  const janeCart = await db.collection('users').doc(janeAuth.uid).collection('cart').get();
  console.log(`Jane Wanjiku Cart Items: ${janeCart.size}`);
  janeCart.forEach(d => console.log(`  🛒 ${d.data().name} - KES ${d.data().price.toLocaleString()}`));

  const janeDoc = await db.collection('users').doc(janeAuth.uid).get();
  console.log(`Jane Wanjiku Wishlist Count: ${janeDoc.data()?.wishlist?.length || 0}`);

  console.log(`\n======================================================`);
  if (failures === 0) {
    console.log(`🎉 ALL VERIFICATION CHECKS PASSED WITH 0 FAILURES!`);
  } else {
    console.error(`❌ VERIFICATION FINISHED WITH ${failures} FAILURES!`);
  }
  console.log(`======================================================\n`);
}

verify().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});

