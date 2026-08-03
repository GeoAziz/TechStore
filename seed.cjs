const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(
  fs.readFileSync('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

const products = [
  { name: 'HP Pavilion 15 i5', category: 'Laptops', brand: 'HP', price: 74999, currency: 'KES', stock: 15, description: 'Business laptop', imageUrl: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?w=600' },
  { name: 'Logitech MX Master 3S', category: 'Mice', brand: 'Logitech', price: 12800, currency: 'KES', stock: 30, description: 'Wireless mouse', imageUrl: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=600' },
  { name: 'Sony WH-1000XM5', category: 'Headphones', brand: 'Sony', price: 34999, currency: 'KES', stock: 14, description: 'Noise-cancelling', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
];

(async () => {
  try {
    console.log('\n🚀 Seeding Firestore...\n');
    
    for (const p of products) {
      const docId = p.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 9);
      await db.collection('products').doc(docId).set({
        ...p,
        warranty: '1 Year',
        shippingTime: '2-3 Days',
        averageRating: 4.6,
        reviewsCount: 0,
        views: 0,
        createdAt: new Date(),
      });
      console.log(`✅ ${p.name} (KES ${p.price.toLocaleString()})`);
    }
    
    const snap = await db.collection('products').get();
    console.log(`\n✨ Success! Total: ${snap.size} products\n`);
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message, '\n');
    process.exit(1);
  }
})();
