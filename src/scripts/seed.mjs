
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

function getServiceAccount() {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error('Please provide FIREBASE_SERVICE_ACCOUNT env var.');
  }
  try {
    return JSON.parse(serviceAccountString);
  } catch (e) {
    throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT: ${e.message}`);
  }
}

const serviceAccount = getServiceAccount();

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const products = [
  // Laptops
  {
    name: 'HP Spectre x360 14',
    category: 'Laptops',
    subcategory: 'Ultrabooks',
    brand: 'HP',
    price: 155000,
    currency: 'KES',
    stock: 15,
    description: 'A premium 2-in-1 laptop with a stunning OLED display, powerful performance, and a sleek, gem-cut design. Perfect for professionals on the go.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'laptop silver',
    tags: ['hp', 'laptop', '2-in-1', 'oled', 'premium'],
    isFeatured: true,
    views: 2100,
    cartCount: 45,
    ordersCount: 18,
    averageRating: 4.8,
    reviewsCount: 32,
    createdAt: Timestamp.now(),
  },
  {
    name: 'Dell XPS 15',
    category: 'Laptops',
    subcategory: 'Business',
    brand: 'Dell',
    price: 189999,
    currency: 'KES',
    stock: 8,
    description: 'The ultimate creator laptop with a 4K UHD+ display, NVIDIA RTX graphics, and a massive 1TB SSD for all your projects.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'laptop dark',
    tags: ['dell', 'xps', 'creator', '4k', 'rtx'],
    isFeatured: true,
    views: 1850,
    cartCount: 60,
    ordersCount: 25,
    averageRating: 4.9,
    reviewsCount: 41,
    createdAt: Timestamp.now(),
    discountPercent: 10,
    promoTag: '10% OFF'
  },
  {
    name: 'Lenovo IdeaPad Gaming 3',
    category: 'Laptops',
    subcategory: 'Gaming',
    brand: 'Lenovo',
    price: 98500,
    currency: 'KES',
    stock: 22,
    description: 'Enter the world of gaming with this budget-friendly machine featuring a Ryzen 5 CPU, GTX 1650 graphics, and a 120Hz display.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'laptop gaming',
    tags: ['lenovo', 'gaming', 'ryzen', 'gtx'],
    views: 3200,
    cartCount: 150,
    ordersCount: 65,
    averageRating: 4.5,
    reviewsCount: 88,
    createdAt: Timestamp.now(),
  },
  {
    name: 'Apple MacBook Air M2',
    category: 'Laptops',
    subcategory: 'Ultrabooks',
    brand: 'Apple',
    price: 145000,
    currency: 'KES',
    stock: 18,
    description: 'The incredibly thin and light MacBook Air, supercharged by the M2 chip. All-day battery life and a stunning Liquid Retina display.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'laptop slim',
    tags: ['apple', 'macbook', 'm2', 'ultralight'],
    views: 2800,
    cartCount: 75,
    ordersCount: 33,
    averageRating: 4.9,
    reviewsCount: 50,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
  },

  // Desktops & Monitors
  {
    name: 'Zizo Prebuilt-X1',
    category: 'Desktops',
    brand: 'Zizo',
    price: 120000,
    currency: 'KES',
    stock: 10,
    description: 'Our custom-built gaming rig with a Core i5, RTX 3060, 16GB RGB RAM, and a tempered glass case. Ready for 1080p gaming.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'gaming pc',
    tags: ['desktop', 'gaming', 'prebuilt', 'rgb'],
    isFeatured: true,
    views: 1500,
    cartCount: 30,
    ordersCount: 12,
    averageRating: 4.7,
    reviewsCount: 20,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 20)), // 20 days ago
  },
  {
    name: 'Samsung Odyssey G7 27"',
    category: 'Monitors',
    brand: 'Samsung',
    price: 65000,
    currency: 'KES',
    stock: 14,
    description: 'Immerse yourself with this 1000R curved gaming monitor, featuring a 240Hz refresh rate, 1ms response time, and QLED technology.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'gaming monitor',
    tags: ['monitor', 'gaming', 'curved', '240hz'],
    views: 1900,
    cartCount: 80,
    ordersCount: 30,
    averageRating: 4.8,
    reviewsCount: 35,
    createdAt: Timestamp.now(),
    discountPercent: 15,
    promoTag: '15% OFF'
  },
   {
    name: 'Dell UltraSharp U2723QE',
    category: 'Monitors',
    brand: 'Dell',
    price: 78000,
    currency: 'KES',
    stock: 18,
    description: 'A 4K USB-C Hub Monitor with brilliant color and contrast featuring groundbreaking IPS Black technology and connectivity for your productivity.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'office monitor',
    tags: ['monitor', '4k', 'professional', 'usb-c'],
    views: 1200,
    cartCount: 40,
    ordersCount: 15,
    averageRating: 4.9,
    reviewsCount: 22,
    createdAt: Timestamp.now(),
  },


  // Peripherals
  {
    name: 'Logitech G Pro X Superlight',
    category: 'Mice',
    brand: 'Logitech',
    price: 15500,
    currency: 'KES',
    stock: 30,
    description: 'The choice of champions. Incredibly lightweight at under 63 grams, with LIGHTSPEED wireless technology for a pro-grade connection.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'gaming mouse',
    tags: ['mouse', 'gaming', 'wireless', 'lightweight'],
    isFeatured: true,
    promoTag: 'Trending',
    views: 4500,
    cartCount: 250,
    ordersCount: 110,
    averageRating: 4.9,
    reviewsCount: 150,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 40)), // 40 days ago
  },
  {
    name: 'Keychron K2 Mechanical Keyboard',
    category: 'Keyboards',
    brand: 'Keychron',
    price: 11800,
    currency: 'KES',
    stock: 25,
    description: 'A compact 75% layout mechanical keyboard with hot-swappable switches, RGB backlighting, and both Mac and Windows compatibility.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'mechanical keyboard',
    tags: ['keyboard', 'mechanical', 'rgb', 'compact'],
    views: 2900,
    cartCount: 180,
    ordersCount: 70,
    averageRating: 4.7,
    reviewsCount: 95,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)), // 10 days ago
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    category: 'Headphones',
    brand: 'Sony',
    price: 42000,
    currency: 'KES',
    stock: 19,
    description: 'Industry-leading noise canceling headphones with a new Integrated Processor V1. Crystal clear hands-free calling and a lightweight design.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'headphones black',
    tags: ['headphones', 'noise-canceling', 'sony', 'wireless'],
    views: 2200,
    cartCount: 95,
    ordersCount: 40,
    averageRating: 4.9,
    reviewsCount: 120,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)), // 3 days ago
  },

  // Components
  {
    name: 'NVIDIA GeForce RTX 4070',
    category: 'Graphic Cards',
    brand: 'NVIDIA',
    price: 95000,
    currency: 'KES',
    stock: 7,
    description: 'Experience next-gen gaming and creating with the NVIDIA GeForce RTX 4070. Built with the ultra-efficient Ada Lovelace architecture.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'graphics card nvidia',
    tags: ['gpu', 'nvidia', 'rtx 40-series', 'gaming'],
    views: 3800,
    cartCount: 190,
    ordersCount: 82,
    averageRating: 4.8,
    reviewsCount: 77,
    createdAt: Timestamp.now(),
  },
   {
    name: 'AMD Ryzen 7 7800X3D',
    category: 'Processors',
    brand: 'AMD',
    price: 68000,
    currency: 'KES',
    stock: 11,
    description: 'The ultimate gaming processor with AMD 3D V-Cache technology for a massive gaming performance boost. 8 Cores and 16 processing threads.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'cpu processor',
    tags: ['cpu', 'amd', 'ryzen', 'gaming', '3d v-cache'],
    isFeatured: true,
    promoTag: 'Top Seller',
    views: 4100,
    cartCount: 210,
    ordersCount: 95,
    averageRating: 4.9,
    reviewsCount: 101,
    createdAt: Timestamp.now(),
  },
  {
    name: 'Samsung 980 Pro 1TB SSD',
    category: 'Storage Drives',
    subcategory: 'Internal',
    brand: 'Samsung',
    price: 18500,
    currency: 'KES',
    stock: 40,
    description: 'Unleash the power of the Samsung PCIe 4.0 NVMe SSD 980 PRO for next-level computing. Delivers 2x the data transfer rate of PCIe 3.0.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'ssd drive',
    tags: ['ssd', 'nvme', 'samsung', 'storage', 'pcie 4.0'],
    views: 3300,
    cartCount: 280,
    ordersCount: 130,
    averageRating: 4.9,
    reviewsCount: 180,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 60)), // 60 days ago
  },
];

async function seedDatabase() {
  const collectionRef = db.collection('products');
  console.log('Starting to seed database...');
  let count = 0;

  for (const productData of products) {
    try {
      // Using the product name to create a URL-friendly ID
      const docId = productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const docRef = collectionRef.doc(docId);
      await docRef.set(productData);
      console.log(`Successfully added: ${productData.name}`);
      count++;
    } catch (error) {
      console.error(`Error adding ${productData.name}:`, error);
    }
  }
  console.log(`\nSeeding complete. ${count} products were successfully added.`);
}

seedDatabase();
