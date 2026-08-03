const admin = require('firebase-admin');
const fs = require('fs');

// Load service account
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

// Import seed data (we'll use a simpler version)
const seedProducts = [
  {
    name: 'HP Pavilion 15 i5 11th Gen',
    category: 'Laptops',
    subcategory: 'Business',
    brand: 'HP',
    price: 74999,
    currency: 'KES',
    stock: 15,
    description: 'Reliable business laptop with Intel Core i5, 8GB RAM, 512GB SSD.',
    imageUrl: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?w=600&h=600&fit=crop',
    isFeatured: true,
    averageRating: 4.6,
    reviewsCount: 24,
    promoTag: 'Top Rated',
    specs: { processor: 'Intel Core i5 11th Gen', ram: '8GB DDR4', storage: '512GB SSD', display: '15.6" HD' },
    warranty: '1 Year Manufacturer',
    shippingTime: '2-3 Business Days',
    views: 1200,
    ordersCount: 45,
  },
  {
    name: 'Dell XPS 13 Plus',
    category: 'Laptops',
    subcategory: 'Ultrabooks',
    brand: 'Dell',
    price: 149999,
    currency: 'KES',
    stock: 8,
    description: 'Premium ultrabook with stunning InfinityEdge display, Intel Core i7, 16GB RAM.',
    imageUrl: 'https://images.pexels.com/photos/7974/pexels-photo.jpg?w=600&h=600&fit=crop',
    isFeatured: true,
    averageRating: 4.9,
    reviewsCount: 52,
    promoTag: 'Premium',
    specs: { processor: 'Intel Core i7 13th Gen', ram: '16GB LPDDR5', storage: '512GB NVMe SSD' },
    warranty: '2 Years Premium Support',
    shippingTime: '3-5 Business Days',
    views: 2100,
    ordersCount: 78,
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    category: 'Mice',
    brand: 'Logitech',
    price: 12800,
    currency: 'KES',
    stock: 30,
    description: 'Advanced wireless mouse with precision scroll, quiet clicks, 8K DPI sensor.',
    imageUrl: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=600&h=600&fit=crop',
    isFeatured: true,
    averageRating: 4.9,
    reviewsCount: 123,
    promoTag: 'Professional',
    specs: { connectivity: 'Wireless 2.4GHz + Bluetooth', dpi: '8000 DPI', buttons: '8 Programmable', battery: '70 Days' },
    warranty: '2 Years Manufacturer',
    shippingTime: '2 Business Days',
    views: 2400,
    ordersCount: 267,
  },
  {
    name: 'Sony WH-1000XM5 Noise Cancelling',
    category: 'Headphones',
    brand: 'Sony',
    price: 34999,
    currency: 'KES',
    stock: 14,
    description: 'Premium noise-cancelling headphones, exceptional sound quality, 30-hour battery.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    isFeatured: true,
    averageRating: 4.9,
    reviewsCount: 156,
    promoTag: 'Best Headphones',
    specs: { type: 'Over-ear', connectivity: 'Bluetooth 5.3', noiseCancellation: 'Active', battery: '30 Hours' },
    warranty: '1 Year Manufacturer',
    shippingTime: '2-3 Business Days',
    views: 2600,
    ordersCount: 234,
  },
];

async function seedDatabase() {
  try {
    console.log('\n🚀 Starting Firebase database seeding...');
    console.log(`📦 Seeding ${seedProducts.length} sample products first...\n`);

    const batch = db.batch();
    let count = 0;

    for (const product of seedProducts) {
      const productId = product.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 50) +
        '-' +
        Math.random().toString(36).substr(2, 9);

      const docRef = db.collection('products').doc(productId);
      
      batch.set(docRef, {
        ...product,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      count++;
    }

    await batch.commit();
    console.log(`✅ Successfully seeded ${count} products!\n`);

    // Verify
    const snapshot = await db.collection('products').get();
    console.log(`🔍 Firestore verification: ${snapshot.size} total documents\n`);

    // Show sample
    console.log('📝 Sample products added:');
    snapshot.docs.slice(0, 3).forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.name} (${data.brand}) - KES ${data.price.toLocaleString()}`);
    });

    console.log('\n✨ Seeding complete! Your database is ready.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seeding:', error.message);
    process.exit(1);
  }
}

seedDatabase();
