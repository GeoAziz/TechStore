
import { db } from '../lib/firebase-admin.js';
import { Timestamp } from 'firebase-admin/firestore';

// Helper function to generate random numbers
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to get a random date in the last year
const randomDate = () => {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const products = [
  // Laptops
  { name: 'HP Spectre x360 14', brand: 'HP', category: 'Laptops', price: 155000, stock: 15, tags: ['hp', 'laptop', 'x360', 'intel core i7'], warranty: "1 Year", vendor: "HP Kenya" },
  { name: 'Dell XPS 13', brand: 'Dell', category: 'Laptops', price: 140000, stock: 20, tags: ['dell', 'xps', 'laptop', 'ultrabook'], warranty: "1 Year", vendor: "Dell Store KE" },
  { name: 'Lenovo Yoga Slim 7', brand: 'Lenovo', category: 'Laptops', price: 110000, stock: 25, tags: ['lenovo', 'yoga', 'laptop', 'amd ryzen 7'], warranty: "1 Year", vendor: "Lenovo Official" },
  { name: 'Apple MacBook Air M2', brand: 'Apple', category: 'Laptops', price: 160000, stock: 10, tags: ['apple', 'macbook', 'm2', 'laptop'], warranty: "1 Year", vendor: "Apple Kenya" },
  { name: 'Asus ZenBook Duo', brand: 'Asus', category: 'Laptops', price: 180000, stock: 8, tags: ['asus', 'zenbook', 'laptop', 'dual screen'], warranty: "1 Year", vendor: "Asus Kenya" },

  // Phones
  { name: 'Samsung Galaxy S23 Ultra', brand: 'Samsung', category: 'Phones', price: 145000, stock: 30, tags: ['samsung', 'galaxy', 'phone', 'android'], warranty: "2 Years", vendor: "Samsung Kenya" },
  { name: 'iPhone 14 Pro', brand: 'Apple', category: 'Phones', price: 180000, stock: 18, tags: ['apple', 'iphone', 'phone', 'ios'], warranty: "1 Year", vendor: "Apple Kenya" },
  { name: 'Xiaomi Redmi Note 12 Pro', brand: 'Xiaomi', category: 'Phones', price: 35000, stock: 50, tags: ['xiaomi', 'redmi', 'phone', 'budget'], warranty: "1 Year", vendor: "Xiaomi KE" },
  { name: 'Infinix Zero 20', brand: 'Infinix', category: 'Phones', price: 28000, stock: 60, tags: ['infinix', 'phone', 'android'], warranty: "1 Year", vendor: "Infinix Mobile" },
  { name: 'Google Pixel 7', brand: 'Google', category: 'Phones', price: 95000, stock: 22, tags: ['google', 'pixel', 'phone', 'android'], warranty: "1 Year", vendor: "Gadget Store" },
  
  // Accessories
  { name: 'Logitech MX Keys', brand: 'Logitech', category: 'Keyboards', price: 15000, stock: 40, tags: ['logitech', 'keyboard', 'wireless'], warranty: "1 Year", vendor: "Logitech KE" },
  { name: 'Razer DeathAdder V2', brand: 'Razer', category: 'Mice', price: 8500, stock: 35, tags: ['razer', 'mouse', 'gaming', 'rgb'], warranty: "1 Year", vendor: "Razer Store" },
  { name: 'Anker PowerCore 20000', brand: 'Anker', category: 'Accessories', price: 6500, stock: 100, tags: ['anker', 'powerbank', 'charger'], warranty: "18 Months", vendor: "Anker Kenya" },
  { name: 'HP 15.6 Value Backpack', brand: 'HP', category: 'Accessories', price: 3500, stock: 80, tags: ['hp', 'laptop bag', 'backpack'], warranty: "6 Months", vendor: "HP Kenya" },

  // Storage
  { name: 'Samsung 980 Pro 1TB NVMe SSD', brand: 'Samsung', category: 'Storage Drives', price: 18000, stock: 50, tags: ['samsung', 'ssd', 'nvme', 'storage'], warranty: "5 Years", vendor: "Samsung Kenya" },
  { name: 'Seagate Backup Plus 2TB', brand: 'Seagate', category: 'Storage Drives', price: 9000, stock: 70, tags: ['seagate', 'hdd', 'external', 'storage'], warranty: "2 Years", vendor: "Seagate KE" },
  { name: 'SanDisk Ultra 128GB USB 3.0', brand: 'SanDisk', category: 'Storage Drives', price: 2500, stock: 200, tags: ['sandisk', 'flash drive', 'usb'], warranty: "5 Years", vendor: "SanDisk Official" },

  // Displays
  { name: 'Dell UltraSharp U2723QE 27" 4K Monitor', brand: 'Dell', category: 'Monitors', price: 65000, stock: 15, tags: ['dell', 'monitor', '4k', 'ultrasharp'], warranty: "3 Years", vendor: "Dell Store KE" },
  { name: 'LG 24MP60G 24" IPS Gaming Monitor', brand: 'LG', category: 'Monitors', price: 22000, stock: 30, tags: ['lg', 'monitor', 'gaming', 'ips'], warranty: "2 Years", vendor: "LG Kenya" },

  // Networking
  { name: 'TP-Link Archer AX55 WiFi 6 Router', brand: 'TP-Link', category: 'Networking', price: 11500, stock: 45, tags: ['tp-link', 'router', 'wifi 6'], warranty: "2 Years", vendor: "TP-Link Kenya" },
  { name: 'Faiba MiFi JTL 4G', brand: 'Faiba', category: 'Networking', price: 5500, stock: 90, tags: ['faiba', 'mifi', '4g', 'internet'], warranty: "1 Year", vendor: "JTL" },
  
  // Audio
  { name: 'Sony WH-1000XM5 Headphones', brand: 'Sony', category: 'Headphones', price: 48000, stock: 25, tags: ['sony', 'headphones', 'noise cancelling'], warranty: "1 Year", vendor: "Sony Kenya" },
  { name: 'JBL Flip 6 Bluetooth Speaker', brand: 'JBL', category: 'Audio', price: 14000, stock: 60, tags: ['jbl', 'speaker', 'bluetooth', 'portable'], warranty: "1 Year", vendor: "JBL Official" },
  { name: 'Apple AirPods Pro 2', brand: 'Apple', category: 'Headphones', price: 32000, stock: 40, tags: ['apple', 'airpods', 'earbuds', 'wireless'], warranty: "1 Year", vendor: "Apple Kenya" },
  
  // Smart Tech
  { name: 'Apple Watch Series 8', brand: 'Apple', category: 'Smart Tech', price: 65000, stock: 20, tags: ['apple', 'smartwatch', 'wearable'], warranty: "1 Year", vendor: "Apple Kenya" },
  { name: 'Xiaomi Mi Band 7', brand: 'Xiaomi', category: 'Smart Tech', price: 5000, stock: 120, tags: ['xiaomi', 'fitness tracker', 'smartband'], warranty: "1 Year", vendor: "Xiaomi KE" },
  
  // More Graphic Cards
  { name: 'NVIDIA GeForce RTX 3060', brand: 'NVIDIA', category: 'Graphic Cards', price: 55000, stock: 18, tags: ['nvidia', 'gpu', 'rtx', 'gaming'], warranty: "3 Years", vendor: "StellarForce" },
  { name: 'AMD Radeon RX 6700 XT', brand: 'AMD', category: 'Graphic Cards', price: 62000, stock: 12, tags: ['amd', 'gpu', 'radeon', 'gaming'], warranty: "3 Years", vendor: "StellarForce" },
  
  // More Processors
  { name: 'Intel Core i5-12600K', brand: 'Intel', category: 'Processors', price: 38000, stock: 25, tags: ['intel', 'cpu', 'core i5', 'processor'], warranty: "3 Years", vendor: "StellarForce" },
  { name: 'AMD Ryzen 5 5600X', brand: 'AMD', category: 'Processors', price: 32000, stock: 30, tags: ['amd', 'cpu', 'ryzen 5', 'processor'], warranty: "3 Years", vendor: "StellarForce" },
];

async function seedDatabase() {
    console.log("Starting database seed process...");
    const productsCollection = db.collection('products');
    let featuredCount = 0;
    let dealsCount = 0;

    const batch = db.batch();

    for (const product of products) {
        const docRef = productsCollection.doc(); // Auto-generate ID
        
        // Randomize metrics
        const views = random(100, 5000);
        const cartCount = random(10, 200);
        const ordersCount = random(5, 100);
        const averageRating = (Math.random() * (5 - 3.5) + 3.5).toFixed(1);
        const reviewsCount = random(5, 100);
        
        let discountPercent = 0;
        if (dealsCount < 12 && Math.random() > 0.6) {
            discountPercent = random(15, 40);
            dealsCount++;
        }
        
        let isFeatured = false;
        if (featuredCount < 8 && Math.random() > 0.7) {
            isFeatured = true;
            featuredCount++;
        }

        const fullProductData = {
            ...product,
            currency: 'KES',
            description: `High-quality ${product.name} from ${product.brand}. Perfect for the Kenyan market.`,
            imageUrl: `https://placehold.co/600x400.png`,
            dataAiHint: `${product.category.toLowerCase()} ${product.tags[1]}`,
            createdAt: Timestamp.fromDate(randomDate()),
            updatedAt: Timestamp.now(),
            discountPercent,
            isFeatured,
            views,
            cartCount,
            ordersCount,
            averageRating: parseFloat(averageRating),
            reviewsCount,
            shippingTime: `${random(1,3)}-${random(4,5)} Days`,
            specs: {
                "Processor": "i5 11th Gen",
                "RAM": "8GB DDR4",
                "Storage": "512GB NVMe SSD"
            },
            color: 'Space Gray'
        };

        batch.set(docRef, fullProductData);
        console.log(`Preparing to add: ${product.name}`);
    }

    try {
        await batch.commit();
        console.log("-----------------------------------------");
        console.log("✅ Success! Database has been seeded.");
        console.log(`Total products added: ${products.length}`);
        console.log(`Featured products: ${featuredCount}`);
        console.log(`Products on deal: ${dealsCount}`);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("Error committing batch:", error);
    }
}

seedDatabase().catch(error => {
    console.error("Seeder script failed:", error);
});
