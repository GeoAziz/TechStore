const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

const sampleProducts = [
  { name: 'HP Pavilion 15', category: 'Laptops', brand: 'HP', price: 74999, stock: 15, imageUrl: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?w=600&h=600&fit=crop' },
  { name: 'Dell XPS 13', category: 'Laptops', brand: 'Dell', price: 149999, stock: 8, imageUrl: 'https://images.pexels.com/photos/7974/pexels-photo.jpg?w=600&h=600&fit=crop' },
  { name: 'Logitech MX Master 3S', category: 'Mice', brand: 'Logitech', price: 12800, stock: 30, imageUrl: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=600&h=600&fit=crop' },
  { name: 'Sony WH-1000XM5', category: 'Headphones', brand: 'Sony', price: 34999, stock: 14, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
  { name: 'Apple AirPods Pro', category: 'Headphones', brand: 'Apple', price: 24999, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80' },
];

async function seed() {
  try {
    console.log('\n🚀 Seeding Firestore with products...\n');
    
    for (const product of sampleProducts) {
      const docId = product.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 9);
      await db.collection('products').doc(docId).set({
        ...product,
        currency: 'KES',
        description: 'Premium tech product',
        specs: {},
        warranty: '1 Year',
        shippingTime: '2-3 Days',
        averageRating: 4.5,
        reviewsCount: 0,
        views: 0,
        ordersCount: 0,
        isFeatured: true,
        createdAt: new Date(),
      });
      console.log(`✅ Added: ${product.name}`);
    }

    const snapshot = await db.collection('products').get();
    console.log(`\n✨ Success! Total products: ${snapshot.size}\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();
