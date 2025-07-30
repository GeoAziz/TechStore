
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const getServiceAccount = () => {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please provide it in your .env file or environment configuration.');
  }
  try {
    return JSON.parse(serviceAccountString);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT. Make sure it's a valid JSON string.", error);
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT format.");
  }
};

initializeApp({
  credential: cert(getServiceAccount()),
});

const db = getFirestore();

const productsToSeed = [
    // --- Laptops ---
    // Budget
    {
        name: "Lenovo IdeaPad 3 15.6″ Celeron",
        description: "An affordable laptop for everyday tasks, browsing, and streaming. Perfect for students.",
        category: "Laptops",
        subcategory: "Budget",
        brand: "Lenovo",
        price: 38000,
        stock: 45,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "silver laptop",
    },
    {
        name: "HP 15-dw121nia 15.6″ Celeron",
        description: "Reliable performance for daily computing needs with a sleek, portable design.",
        category: "Laptops",
        subcategory: "Budget",
        brand: "HP",
        price: 42000,
        stock: 50,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "black laptop",
    },
    // Business
    {
        name: "HP EliteBook 840 G8",
        description: "A premium business laptop with top-tier security features and robust performance.",
        category: "Laptops",
        subcategory: "Business",
        brand: "HP",
        price: 135000,
        stock: 22,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "business laptop",
    },
    {
        name: "Dell Latitude 7420",
        description: "A lightweight business laptop with long battery life and a stunning display.",
        category: "Laptops",
        subcategory: "Business",
        brand: "Dell",
        price: 145000,
        stock: 18,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "sleek laptop",
    },
    // Ultrabooks
    {
        name: "Dell XPS 13 (9310)",
        description: "The ultimate ultrabook with a stunning InfinityEdge display and powerful performance.",
        category: "Laptops",
        subcategory: "Ultrabooks",
        brand: "Dell",
        price: 180000,
        stock: 15,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "ultrabook laptop",
        isFeatured: true,
    },
    {
        name: "Apple MacBook Air M2",
        description: "Incredibly thin and light, the MacBook Air is supercharged by the Apple M2 chip.",
        category: "Laptops",
        subcategory: "Ultrabooks",
        brand: "Apple",
        price: 165000,
        stock: 20,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "Apple laptop",
    },
    // Gaming
    {
        name: "ASUS ROG Strix G15",
        description: "A high-performance gaming laptop with an RTX 3060 and a 144Hz display for competitive gaming.",
        category: "Laptops",
        subcategory: "Gaming",
        brand: "ASUS",
        price: 210000,
        stock: 12,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "gaming laptop",
        isFeatured: true,
    },
    {
        name: "Razer Blade 15",
        description: "The world's smallest 15” gaming laptop, combining portability with incredible power.",
        category: "Laptops",
        subcategory: "Gaming",
        brand: "Razer",
        price: 250000,
        stock: 8,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "Razer laptop",
    },

    // --- Desktops ---
    {
        name: "HP Pavilion Gaming Desktop",
        description: "A compact gaming desktop with customizable RGB lighting and powerful components.",
        category: "Desktops",
        brand: "HP",
        price: 120000,
        stock: 15,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "gaming desktop",
    },
    {
        name: "Apple iMac 24-inch M1",
        description: "A stunning all-in-one desktop with the powerful Apple M1 chip and a vibrant 4.5K Retina display.",
        category: "Desktops",
        brand: "Apple",
        price: 195000,
        stock: 10,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "iMac desktop",
    },
     {
        name: "Dell OptiPlex 3090 Micro",
        description: "An ultra-compact business desktop with flexible mounting options and essential performance.",
        category: "Desktops",
        brand: "Dell",
        price: 85000,
        stock: 30,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "mini pc",
    },

    // --- Monitors ---
    {
        name: "Dell UltraSharp U2723QE",
        description: "A 27-inch 4K UHD monitor with stunning color accuracy, perfect for creative professionals.",
        category: "Monitors",
        brand: "Dell",
        price: 75000,
        stock: 25,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "4k monitor",
        isFeatured: true,
    },
    {
        name: "LG 24MP60G-B 24″ Full HD IPS",
        description: "An affordable Full HD monitor with IPS technology for wide viewing angles and vibrant colors.",
        category: "Monitors",
        brand: "LG",
        price: 22000,
        stock: 40,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "computer monitor",
    },
    {
        name: "Samsung Odyssey G7 32-inch",
        description: "A curved QLED gaming monitor with a 240Hz refresh rate and 1ms response time.",
        category: "Monitors",
        brand: "Samsung",
        price: 95000,
        stock: 15,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "curved monitor",
        discountPercent: 10,
    },
    
    // --- Keyboards ---
    {
        name: "Logitech MX Keys Advanced",
        description: "A premium wireless keyboard with smart illumination and perfect-stroke keys for a comfortable typing experience.",
        category: "Keyboards",
        brand: "Logitech",
        price: 15000,
        stock: 30,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "wireless keyboard",
    },
    {
        name: "Razer Huntsman Mini",
        description: "A 60% optical gaming keyboard with incredibly fast actuation and customizable Chroma RGB lighting.",
        category: "Keyboards",
        brand: "Razer",
        price: 18000,
        stock: 20,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "gaming keyboard",
    },
     {
        name: "Microsoft Ergonomic Keyboard",
        description: "A split ergonomic keyboard designed for comfort, reducing fatigue and risk of injury.",
        category: "Keyboards",
        brand: "Microsoft",
        price: 8500,
        stock: 35,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "ergonomic keyboard",
    },
    
    // --- Mice ---
    {
        name: "Logitech G Pro X Superlight",
        description: "An incredibly lightweight wireless gaming mouse, engineered for professional-grade performance.",
        category: "Mice",
        brand: "Logitech",
        price: 16500,
        stock: 28,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "gaming mouse",
    },
    {
        name: "Apple Magic Mouse",
        description: "A rechargeable wireless mouse with an optimized foot design that lets it glide smoothly across your desk.",
        category: "Mice",
        brand: "Apple",
        price: 11000,
        stock: 22,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "Apple mouse",
    },
    
    // --- Headphones ---
    {
        name: "Sony WH-1000XM5",
        description: "Industry-leading noise-canceling headphones with exceptional sound quality and a comfortable, lightweight design.",
        category: "Headphones",
        brand: "Sony",
        price: 45000,
        stock: 18,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "headphones",
        isFeatured: true,
        discountPercent: 15,
    },
    {
        name: "SteelSeries Arctis Nova Pro",
        description: "High-fidelity gaming headset with active noise cancellation and a multi-system connect hub.",
        category: "Headphones",
        brand: "SteelSeries",
        price: 38000,
        stock: 15,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "gaming headset",
    },
     {
        name: "Anker Soundcore Life Q20",
        description: "Affordable hybrid active noise cancelling headphones with Hi-Res Audio and deep bass.",
        category: "Headphones",
        brand: "Anker",
        price: 8900,
        stock: 50,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "blue headphones",
    },
    
    // --- Webcams ---
    {
        name: "Logitech C920 HD Pro Webcam",
        description: "A classic 1080p webcam delivering sharp, smooth video for video calls and streaming.",
        category: "Webcams",
        brand: "Logitech",
        price: 9500,
        stock: 40,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "webcam",
    },
    {
        name: "Razer Kiyo Pro",
        description: "A high-performance uncompressed 1080p 60FPS webcam with an adaptive light sensor for superior imaging.",
        category: "Webcams",
        brand: "Razer",
        price: 22000,
        stock: 15,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "professional webcam",
    },

    // --- Storage Drives ---
    {
        name: "Samsung 980 Pro 1TB NVMe SSD",
        description: "Experience next-level SSD performance with the Samsung 980 Pro for high-end gaming and 4K video editing.",
        category: "Storage Drives",
        subcategory: "Internal",
        brand: "Samsung",
        price: 18000,
        stock: 35,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "NVMe SSD",
        isFeatured: true,
    },
    {
        name: "Seagate BarraCuda 2TB Internal HDD",
        description: "A reliable and versatile internal hard drive for all your desktop PC needs, from storage to gaming.",
        category: "Storage Drives",
        subcategory: "Internal",
        brand: "Seagate",
        price: 8500,
        stock: 50,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "internal hard drive",
    },
    {
        name: "SanDisk Extreme Portable SSD 1TB",
        description: "A rugged, portable SSD delivering high-speed transfers of up to 1050MB/s. Perfect for content creators.",
        category: "Storage Drives",
        subcategory: "External",
        brand: "SanDisk",
        price: 15500,
        stock: 30,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "portable SSD",
    },
    
    // --- Phones ---
    {
        name: "Samsung Galaxy S23 Ultra",
        description: "The ultimate Android phone with a stunning display, powerful camera system, and integrated S Pen.",
        category: "Phones",
        brand: "Samsung",
        price: 150000,
        stock: 20,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "samsung phone",
        isFeatured: true,
        discountPercent: 10,
    },
    {
        name: "Xiaomi Redmi Note 12",
        description: "An incredible value phone with a 120Hz AMOLED display and solid performance for its price.",
        category: "Phones",
        brand: "Xiaomi",
        price: 28000,
        stock: 60,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "xiaomi phone",
    },
    {
        name: "Apple iPhone 14 Pro",
        description: "Experience the Dynamic Island, a 48MP camera, and an Always-On display with the iPhone 14 Pro.",
        category: "Phones",
        brand: "Apple",
        price: 185000,
        stock: 15,
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "iphone",
    },
];

// Add more products to reach ~70
const additionalProducts = [
    // Laptops
    { name: "Acer Aspire 5", category: "Laptops", subcategory: "Budget", brand: "Acer", price: 65000, stock: 30, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "acer laptop" },
    { name: "Microsoft Surface Laptop 5", category: "Laptops", subcategory: "Ultrabooks", brand: "Microsoft", price: 175000, stock: 12, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "surface laptop" },
    { name: "Lenovo Legion 5 Pro", category: "Laptops", subcategory: "Gaming", brand: "Lenovo", price: 230000, stock: 10, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "legion laptop" },
    { name: "HP Spectre x360", category: "Laptops", subcategory: "Business", brand: "HP", price: 190000, stock: 14, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "convertible laptop" },

    // Desktops
    { name: "Lenovo IdeaCentre 5", category: "Desktops", brand: "Lenovo", price: 95000, stock: 20, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "desktop computer" },
    { name: "Corsair Vengeance i7400", category: "Desktops", brand: "Corsair", price: 280000, stock: 8, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "prebuilt gaming pc" },

    // Monitors
    { name: "BenQ GW2480", category: "Monitors", brand: "BenQ", price: 18000, stock: 50, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "office monitor" },
    { name: "Alienware AW3423DWF", category: "Monitors", brand: "Alienware", price: 160000, stock: 10, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "ultrawide monitor", discountPercent: 15 },
    
    // Keyboards
    { name: "Keychron K2 Wireless Mechanical", category: "Keyboards", brand: "Keychron", price: 13000, stock: 25, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "mechanical keyboard" },
    { name: "Apple Magic Keyboard", category: "Keyboards", brand: "Apple", price: 14000, stock: 18, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "apple keyboard" },
    
    // Mice
    { name: "Razer DeathAdder V2", category: "Mice", brand: "Razer", price: 8000, stock: 40, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "rgb mouse" },
    { name: "Microsoft Classic Intellimouse", category: "Mice", brand: "Microsoft", price: 4500, stock: 60, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "classic mouse" },

    // Headphones
    { name: "Apple AirPods Pro (2nd Gen)", category: "Headphones", brand: "Apple", price: 32000, stock: 25, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "airpods" },
    { name: "Bose QuietComfort 45", category: "Headphones", brand: "Bose", price: 42000, stock: 15, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "bose headphones" },
    
    // Storage
    { name: "Crucial MX500 1TB SATA SSD", category: "Storage Drives", subcategory: "Internal", brand: "Crucial", price: 11000, stock: 40, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "sata ssd" },
    { name: "WD My Passport 4TB External HDD", category: "Storage Drives", subcategory: "External", brand: "Western Digital", price: 14000, stock: 30, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "external hdd" },
    
    // Phones
    { name: "Google Pixel 7a", category: "Phones", brand: "Google", price: 75000, stock: 18, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "pixel phone" },
    { name: "Infinix Note 30 Pro", category: "Phones", brand: "Infinix", price: 34000, stock: 50, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "infinix phone", discountPercent: 20 },

    // Processors
    { name: "Intel Core i7-13700K", category: "Processors", brand: "Intel", price: 65000, stock: 20, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "cpu processor" },
    { name: "AMD Ryzen 7 7800X3D", category: "Processors", brand: "AMD", price: 72000, stock: 15, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "amd processor", isFeatured: true },
    
    // Graphic Cards
    { name: "NVIDIA GeForce RTX 4070 Ti", category: "Graphic Cards", brand: "NVIDIA", price: 140000, stock: 12, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "graphics card" },
    { name: "AMD Radeon RX 7900 XTX", category: "Graphic Cards", brand: "AMD", price: 165000, stock: 10, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "amd graphics card" },
    
    // Motherboards
    { name: "ASUS ROG Strix B550-F Gaming", category: "Motherboards", brand: "ASUS", price: 28000, stock: 22, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "motherboard" },
    { name: "Gigabyte B650 AORUS Elite AX", category: "Motherboards", brand: "Gigabyte", price: 32000, stock: 18, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "aorus motherboard" },
    
    // RAM Modules
    { name: "Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz", category: "RAM Modules", brand: "Corsair", price: 8500, stock: 40, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "ram sticks" },
    { name: "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz", category: "RAM Modules", brand: "G.Skill", price: 22000, stock: 25, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "rgb ram" },
    
    // Power Supplies
    { name: "Corsair RM850x 850W Gold", category: "Power Supplies", brand: "Corsair", price: 19000, stock: 28, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "power supply unit" },
    { name: "EVGA SuperNOVA 750 G5 750W Gold", category: "Power Supplies", brand: "EVGA", price: 16500, stock: 30, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "psu" },
    
    // Coolers/Fans
    { name: "Noctua NH-D15 Chromax.black", category: "Coolers/Fans", brand: "Noctua", price: 14000, stock: 20, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "cpu cooler" },
    { name: "Lian Li UNI FAN SL120 (3 Pack)", category: "Coolers/Fans", brand: "Lian Li", price: 11000, stock: 35, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "case fans", isFeatured: true },

    // Smart Tech
    { name: "Apple Watch Series 8", category: "Smart Tech", brand: "Apple", price: 65000, stock: 20, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "apple watch" },
    { name: "Samsung Galaxy Watch 5", category: "Smart Tech", brand: "Samsung", price: 42000, stock: 25, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "samsung watch", discountPercent: 20 },
    { name: "Xiaomi Mi Band 7", category: "Smart Tech", brand: "Xiaomi", price: 6500, stock: 50, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "fitness tracker" },

    // Networking
    { name: "TP-Link Archer AX55 Wi-Fi 6 Router", category: "Networking", brand: "TP-Link", price: 12500, stock: 30, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "wifi router" },
    { name: "Huawei 4G CPE 3 Router", category: "Networking", brand: "Huawei", price: 9800, stock: 40, imageUrl: "https://placehold.co/600x400.png", dataAiHint: "4g router" },
    
];

const allProducts = [...productsToSeed, ...additionalProducts.map(p => ({
    description: p.name + " - High quality and reliable for all your needs.",
    ...p
}))];

// Function to generate a random number within a range
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Main seeder function
async function seedDatabase() {
  console.log('Starting to seed database...');

  const productsCollection = db.collection('products');
  const batch = db.batch();

  // Clear existing products
  const snapshot = await productsCollection.get();
  if (!snapshot.empty) {
    console.log(`Deleting ${snapshot.size} existing products...`);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Existing products deleted.');
  } else {
    console.log('No existing products to delete.');
  }

  // Start a new batch for additions
  let newBatch = db.batch();
  let count = 0;

  allProducts.forEach((product) => {
    const docRef = productsCollection.doc();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const fullProduct = {
      ...product,
      currency: 'KES',
      color: ['Black', 'Silver', 'White', 'Blue', 'Red'][random(0,4)],
      tags: [product.brand.toLowerCase(), product.category.toLowerCase().replace(/\s/g, ''), ...(product.subcategory ? [product.subcategory.toLowerCase()] : [])],
      isFeatured: product.isFeatured || Math.random() < 0.15, // Approx 15% are featured
      discountPercent: product.discountPercent || (Math.random() < 0.2 ? random(10, 30) : 0), // Approx 20% have discounts
      createdAt: Timestamp.fromMillis(random(twoMonthsAgo.getTime(), Date.now())),
      views: random(100, 5000),
      cartCount: random(10, 200),
      ordersCount: random(5, 100),
      averageRating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1),
      reviewsCount: random(5, 100),
      shippingTime: ['Next-Day', '2-4 Days'][random(0,1)],
      warranty: ['1 Year', '2 Years'][random(0,1)],
      vendor: ['Zizo Official', 'StellarForce', 'CyberCore Imports'][random(0,2)],
    };
    newBatch.set(docRef, fullProduct);
    count++;
    if (count % 499 === 0) { // Firestore batch limit is 500
        newBatch.commit();
        newBatch = db.batch();
    }
  });

  await newBatch.commit();
  console.log(`Successfully seeded ${count} products.`);
}

seedDatabase().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
