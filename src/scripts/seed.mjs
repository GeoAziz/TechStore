
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import 'dotenv/config';

// --- IMPORTANT ---
// To run this script:
// 1. Ensure you have a `serviceAccountKey.json` in your root directory OR
//    have the `FIREBASE_SERVICE_ACCOUNT` environment variable set.
// 2. Run `npm run db:seed` from your terminal.

const getServiceAccount = () => {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountString) {
    return JSON.parse(serviceAccountString);
  } else {
    // This dynamic import will only work in a local Node.js environment.
    // Make sure serviceAccountKey.json is present at the root for local seeding.
    try {
      const serviceAccount = require('../../serviceAccountKey.json');
      return serviceAccount;
    } catch (e) {
      console.error("Error: `serviceAccountKey.json` not found in root directory.");
      console.error("Please provide FIREBASE_SERVICE_ACCOUNT env var or the JSON file.");
      process.exit(1);
    }
  }
};

const serviceAccount = getServiceAccount();

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const products = [
  // Laptops
  {
    id: 'hp-pavilion-15',
    name: 'HP Pavilion 15 i5 11th Gen',
    category: 'Laptops',
    subcategory: 'Business',
    brand: 'HP',
    price: 74999,
    currency: 'KES',
    stock: 12,
    description: 'Powerful laptop with 11th Gen Intel Core i5, 8GB RAM, 512GB SSD for work and entertainment.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAiHint: 'hp laptop',
    isFeatured: true,
    averageRating: 4.6,
    reviewsCount: 45,
    views: 2300,
    cartCount: 150,
    ordersCount: 60,
    discountPercent: 10,
    tags: ['hp', 'laptop', 'i5', 'business'],
    specs: { "CPU": "Intel Core i5", "RAM": "8GB DDR4", "Storage": "512GB SSD" }
  },
  {
    id: 'acer-nitro-5',
    name: 'Acer Nitro 5 Gaming Laptop Ryzen 5',
    category: 'Laptops',
    subcategory: 'Gaming',
    brand: 'Acer',
    price: 109999,
    currency: 'KES',
    stock: 7,
    description: 'Dominate the game with an AMD Ryzen 5 CPU and NVIDIA GeForce RTX 30 Series GPU.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAiHint: 'gaming laptop',
    isFeatured: true,
    averageRating: 4.7,
    reviewsCount: 88,
    views: 5100,
    cartCount: 210,
    ordersCount: 95,
    discountPercent: 15,
    promoTag: '15% OFF',
    tags: ['acer', 'laptop', 'gaming', 'ryzen 5', 'rtx 3050'],
    specs: { "CPU": "AMD Ryzen 5", "RAM": "16GB DDR4", "Storage": "512GB NVMe SSD", "GPU": "NVIDIA RTX 3050" }
  },
  {
    id: 'lenovo-ideapad-3',
    name: 'Lenovo IdeaPad 3 Celeron',
    category: 'Laptops',
    subcategory: 'Budget',
    brand: 'Lenovo',
    price: 32500,
    currency: 'KES',
    stock: 20,
    description: 'Entry-level laptop for everyday tasks with a 15.6" HD display and long battery life.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAiHint: 'lenovo laptop',
    isFeatured: false,
    averageRating: 4.1,
    reviewsCount: 30,
    views: 800,
    cartCount: 40,
    ordersCount: 15,
    tags: ['lenovo', 'laptop', 'celeron', 'budget'],
    specs: { "CPU": "Intel Celeron", "RAM": "4GB DDR4", "Storage": "1TB HDD" }
  },

  // Peripherals
  {
    id: 'mx-master-3s',
    name: 'Logitech MX Master 3S Wireless Mouse',
    category: 'Mice',
    brand: 'Logitech',
    price: 12800,
    currency: 'KES',
    stock: 25,
    description: 'Advanced wireless mouse with ergonomic design, quiet clicks, and 8K DPI sensor for precision.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAiHint: 'computer mouse',
    isFeatured: true,
    averageRating: 4.9,
    reviewsCount: 120,
    views: 4500,
    cartCount: 300,
    ordersCount: 180,
    tags: ['logitech', 'mouse', 'wireless', 'ergonomic'],
    specs: { "Connectivity": "Bluetooth, USB", "DPI": "8000" }
  },
  {
    id: 'redragon-k552',
    name: 'Redragon K552 Mechanical Gaming Keyboard',
    category: 'Keyboards',
    brand: 'Redragon',
    price: 5499,
    currency: 'KES',
    stock: 20,
    description: 'Compact mechanical keyboard with custom switches, RGB backlighting, and durable construction.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAiHint: 'gaming keyboard',
    isFeatured: true,
    averageRating: 4.4,
    reviewsCount: 250,
    views: 6000,
    cartCount: 400,
    ordersCount: 220,
    tags: ['redragon', 'keyboard', 'mechanical', 'rgb', 'gaming'],
    specs: { "Switch Type": "Outemu Blue", "Backlight": "RGB" }
  },
  {
    id: 'jbl-quantum-400',
    name: 'JBL Quantum 400 Gaming Headset',
    category: 'Headphones',
    brand: 'JBL',
    price: 8500,
    currency: 'KES',
    stock: 22,
    description: 'Immersive gaming headset with JBL QuantumSOUND Signature and flip-up boom mic.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAiHint: 'gaming headset',
    averageRating: 4.5,
    reviewsCount: 65,
    views: 1800,
    cartCount: 90,
    ordersCount: 40,
    tags: ['jbl', 'headset', 'gaming', 'surround'],
    specs: { "Driver Size": "50mm", "Connection": "USB, 3.5mm" }
  },

  // Components
  {
    id: 'rtx-3060-ti',
    name: 'NVIDIA RTX 3060 Ti Graphics Card',
    category: 'Graphic Cards',
    brand: 'NVIDIA',
    price: 82000,
    currency: 'KES',
    stock: 4,
    description: 'Experience incredible performance with Ampere—NVIDIA’s 2nd gen RTX architecture.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAiHint: 'graphics card',
    isFeatured: true,
    averageRating: 4.8,
    reviewsCount: 95,
    views: 7200,
    cartCount: 180,
    ordersCount: 70,
    discountPercent: 5,
    tags: ['nvidia', 'gpu', 'rtx 3060ti', 'gaming'],
    specs: { "Memory": "8GB GDDR6", "Boost Clock": "1665 MHz" }
  },
  {
    id: 'samsung-980-pro-1tb',
    name: 'Samsung 980 Pro 1TB NVMe SSD',
    category: 'Storage Drives',
    subcategory: 'Internal',
    brand: 'Samsung',
    price: 17500,
    currency: 'KES',
    stock: 15,
    description: 'Next-level SSD performance with read speeds up to 7,000 MB/s for pro-level gaming and apps.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAiHint: 'ssd internal',
    isFeatured: true,
    averageRating: 4.9,
    reviewsCount: 150,
    views: 6500,
    cartCount: 250,
    ordersCount: 110,
    promoTag: 'Ships in 24h',
    tags: ['samsung', 'ssd', 'nvme', '1tb', 'storage'],
    specs: { "Capacity": "1TB", "Read Speed": "7000 MB/s" }
  },
  {
    id: 'corsair-vengeance-16gb',
    name: 'Corsair Vengeance 16GB DDR4 3200MHz',
    category: 'RAM Modules',
    brand: 'Corsair',
    price: 8499,
    currency: 'KES',
    stock: 10,
    description: 'High-performance DDR4 memory optimized for Intel & AMD motherboards, with stylish heat spreader.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAiHint: 'ram module',
    averageRating: 4.7,
    reviewsCount: 110,
    views: 3200,
    cartCount: 130,
    ordersCount: 55,
    tags: ['corsair', 'ram', 'ddr4', '16gb'],
    specs: { "Capacity": "16GB (2x8GB)", "Speed": "3200MHz" }
  },

  // Monitors
  {
    id: 'dell-ultrasharp-27',
    name: 'Dell UltraSharp 27" 4K Monitor',
    category: 'Monitors',
    brand: 'Dell',
    price: 58000,
    currency: 'KES',
    stock: 9,
    description: 'Stunning 4K resolution with superb color accuracy, ideal for creative professionals.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAiHint: 'computer monitor',
    isFeatured: true,
    averageRating: 4.8,
    reviewsCount: 70,
    views: 4800,
    cartCount: 95,
    ordersCount: 35,
    discountPercent: 12,
    tags: ['dell', 'monitor', '4k', 'ultrasharp', '27-inch'],
    specs: { "Resolution": "3840x2160", "Panel Type": "IPS", "Refresh Rate": "60Hz" }
  },
  {
    id: 'aoc-24-monitor',
    name: 'AOC 24" Full HD LED Monitor',
    category: 'Monitors',
    brand: 'AOC',
    price: 17999,
    currency: 'KES',
    stock: 14,
    description: '24-inch Full HD monitor with vibrant colors and slim design, perfect for any workspace.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAiHint: 'aoc monitor',
    averageRating: 4.5,
    reviewsCount: 90,
    views: 2900,
    cartCount: 110,
    ordersCount: 45,
    tags: ['aoc', 'monitor', 'full hd', '24-inch'],
    specs: { "Resolution": "1920x1080", "Panel Type": "IPS", "Refresh Rate": "75Hz" }
  },
];

async function seedDatabase() {
  console.log('Starting to seed database...');
  const productsCollection = db.collection('products');
  const batch = db.batch();

  const now = Timestamp.now();

  products.forEach((product, index) => {
    const docRef = productsCollection.doc(product.id);
    
    // Add createdAt timestamp for all, and vary it for new arrivals logic
    const aFewDaysAgo = new Date();
    aFewDaysAgo.setDate(aFewDaysAgo.getDate() - (index % 20 + 1)); // Stagger creation dates
    
    const productData = {
      ...product,
      createdAt: index < 5 ? now : Timestamp.fromDate(aFewDaysAgo) // Make first 5 products "new"
    };

    delete productData.id; // Don't store the id field inside the document
    batch.set(docRef, productData);
  });

  try {
    await batch.commit();
    console.log(`Successfully seeded ${products.length} products.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
