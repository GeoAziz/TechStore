import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { products, orders } from '../lib/mock-data.ts';
import serviceAccount from '../../serviceAccountKey.json' with { type: 'json' };

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore(app);

async function seedDatabase() {
  console.log('Starting database seed...');

  try {
    // Seed Products
    console.log(`Seeding ${products.length} products...`);
    const productsBatch = db.batch();
    const productsCol = db.collection('products');
    
    // Optional: Clear existing products first
    const existingProducts = await productsCol.get();
    if(!existingProducts.empty) {
        console.log('Clearing existing products...');
        for (const doc of existingProducts.docs) {
            productsBatch.delete(doc.ref);
        }
        await productsBatch.commit(); // Commit deletions before adding new ones
    }

    const newProductsBatch = db.batch();
    products.forEach(product => {
      const docRef = productsCol.doc(product.id);
      newProductsBatch.set(docRef, product);
    });
    await newProductsBatch.commit();
    console.log('✅ Products seeded successfully.');


    // Seed Orders
    console.log(`Seeding ${orders.length} orders...`);
    const ordersBatch = db.batch();
    const ordersCol = db.collection('orders');

    // Optional: Clear existing orders first
    const existingOrders = await ordersCol.get();
     if(!existingOrders.empty) {
        console.log('Clearing existing orders...');
        for (const doc of existingOrders.docs) {
            ordersBatch.delete(doc.ref);
        }
        await ordersBatch.commit();
    }
    
    const newOrdersBatch = db.batch();
    orders.forEach(order => {
      const docRef = ordersCol.doc(order.id);
      newOrdersBatch.set(docRef, order);
    });
    await newOrdersBatch.commit();
    console.log('✅ Orders seeded successfully.');


    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the app connection to allow the script to exit.
    await app.delete();
  }
}

seedDatabase();
