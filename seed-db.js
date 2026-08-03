const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

console.log('\n🔐 Initializing Firebase Admin...');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

const products = [
  { name: 'HP Pavilion 15 i5', category: 'Laptops', brand: 'HP', price: 74999, currency: 'KES', stock: 15, description: 'Business laptop with 11th Gen Intel', imageUrl: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?w=600&h=600&fit=crop' },
  { name: 'Logitech MX Master 3S', category: 'Mice', brand: 'Logitech', price: 12800, currency: 'KES', stock: 30, description: 'Wireless mouse with precision scroll', imageUrl: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=600&h=600&fit=crop' },
  { name: 'Sony WH-1000XM5', category: 'Headphones', brand: 'Sony', price: 34999, currency: 'KES', stock: 14, description: 'Noise-cancelling headphones', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
];

async function run() {
  try {
    console.log('\n📦 Adding products to Firestore...\n');
    
    for (const p of products) {
      const id = `${p.name.toLowerCase().replace(/\s+/g,'-')}-${Date.now()}`;
      await db.collection('products').doc(id).set({
        ...p,
        warranty: '1 Year Manufacturer',
        shippingTime: '2-3 Business Days',
        averageRating: 4.6,
        reviewsCount: 0,
        views: 0,
        ordersCount: 0,
        isFeatured: true,
        createdAt: admin.firestore.Timestamp.now(),
      });
      console.log(`✅ ${p.name} - KES ${p.price.toLocaleString()}`);
    }
    
    const count = await db.collection('products').count().get();
    console.log(`\n✨ Done! Total products in database: ${count.data().count}\n`);
    
    admin.app().delete();
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

run();
