
import {initializeApp, cert} from 'firebase-admin/app';
import {getFirestore, Timestamp} from 'firebase-admin/firestore';
import {config} from 'dotenv';

config();

function getServiceAccount() {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please provide it in your .env file or environment configuration.'
    );
  }
  try {
    return JSON.parse(serviceAccountString);
  } catch (error) {
    console.error(
      "Failed to parse FIREBASE_SERVICE_ACCOUNT. Make sure it's a valid JSON string.",
      error
    );
    throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT format.');
  }
}

initializeApp({
  credential: cert(getServiceAccount()),
});

const db = getFirestore();

// --- Product Data ---
const productsToSeed = [
  // Laptops
  {
    name: 'HP Pavilion 15 i5 11th Gen',
    description:
      'Powerful laptop with 11th Gen Intel Core i5, 8GB RAM, 512GB SSD for work and entertainment.',
    category: 'Laptops',
    brand: 'HP',
    price: 74999,
    stock: 12,
    tags: ['hp', 'pavilion', 'intel i5', 'laptop'],
    color: 'Silver',
    vendor: 'HP Kenya',
  },
  {
    name: 'Dell Inspiron 15 3000',
    description:
      'A reliable and affordable laptop for everyday tasks, featuring a 15.6" display and Intel Celeron processor.',
    category: 'Laptops',
    brand: 'Dell',
    price: 42500,
    stock: 25,
    tags: ['dell', 'inspiron', 'budget laptop'],
    color: 'Black',
    vendor: 'Dell Store KE',
  },
  {
    name: 'Lenovo IdeaPad 3 15.6″ AMD Ryzen 5',
    description:
      'Experience smooth performance with the AMD Ryzen 5 processor and Radeon graphics. Ideal for students and professionals.',
    category: 'Laptops',
    brand: 'Lenovo',
    price: 58500,
    stock: 18,
    tags: ['lenovo', 'ideapad', 'ryzen 5', 'amd'],
    color: 'Abyss Blue',
    vendor: 'Lenovo Official',
  },
  {
    name: 'Apple MacBook Air M1 Chip',
    description:
      "Apple's thinnest, lightest notebook, completely transformed by the Apple M1 chip. Up to 18 hours of battery life.",
    category: 'Laptops',
    brand: 'Apple',
    price: 125000,
    stock: 8,
    tags: ['apple', 'macbook', 'm1', 'ultrabook'],
    color: 'Space Gray',
    vendor: 'Apple Authorized Reseller',
  },
  {
    name: 'Asus TUF Gaming F15',
    description:
      'Geared for serious gaming and real-world durability, the TUF Gaming F15 is a fully-loaded Windows 11 gaming laptop.',
    category: 'Laptops',
    brand: 'Asus',
    price: 110000,
    stock: 7,
    tags: ['asus', 'tuf gaming', 'rtx 3050', 'gaming laptop'],
    color: 'Graphite Black',
    vendor: 'Asus Kenya',
  },

  // Phones
  {
    name: 'Samsung Galaxy A54 5G',
    description:
      'Awesome is for everyone. Enjoy a vivid display, multi-lens camera, and long-lasting battery life.',
    category: 'Phones',
    brand: 'Samsung',
    price: 48000,
    stock: 30,
    tags: ['samsung', 'galaxy', '5g', 'smartphone'],
    color: 'Awesome Violet',
    vendor: 'Samsung Kenya',
  },
  {
    name: 'Xiaomi Redmi Note 12 Pro',
    description:
      'Flagship-level 108MP main camera, 120Hz AMOLED display, and 67W turbo charging.',
    category: 'Phones',
    brand: 'Xiaomi',
    price: 35000,
    stock: 40,
    tags: ['xiaomi', 'redmi', '108mp', 'smartphone'],
    color: 'Onyx Black',
    vendor: 'Xiaomi Store',
  },
  {
    name: 'Apple iPhone 14 Pro 256GB',
    description:
      'Featuring the Dynamic Island, a 48MP Main camera for up to 4x greater resolution, and Cinematic mode now in 4K Dolby Vision.',
    category: 'Phones',
    brand: 'Apple',
    price: 165000,
    stock: 10,
    tags: ['apple', 'iphone', 'iphone 14 pro', 'ios'],
    color: 'Deep Purple',
    vendor: 'Apple Authorized Reseller',
  },
  {
    name: 'Infinix Note 30 VIP',
    description:
      'All-Round FastCharge technology with 68W wired and 50W wireless charging. MediaTek Dimensity 8050 5G processor.',
    category: 'Phones',
    brand: 'Infinix',
    price: 45999,
    stock: 22,
    tags: ['infinix', 'note 30', 'fast charging', 'smartphone'],
    color: 'Magic Black',
    vendor: 'Infinix Mobility',
  },
  {
    name: 'Google Pixel 7a',
    description:
      'The Google Tensor G2 chip makes it faster, more efficient, and more secure. With Google AI, you get an amazing camera and all-day battery.',
    category: 'Phones',
    brand: 'Google',
    price: 68000,
    stock: 15,
    tags: ['google', 'pixel', 'android', 'camera phone'],
    color: 'Charcoal',
    vendor: 'Imported',
  },

  // Accessories
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    description:
      'Advanced wireless mouse with ergonomic design, quiet clicks, and 8K DPI sensor for ultimate precision.',
    category: 'Accessories',
    brand: 'Logitech',
    price: 12800,
    stock: 25,
    tags: ['logitech', 'mx master', 'mouse', 'wireless'],
    color: 'Graphite',
    vendor: 'Logitech KE',
  },
  {
    name: 'Keychron K2 Mechanical Keyboard',
    description:
      'A 75% layout mechanical keyboard with Gateron switches, white LED backlighting, and compatible with both Mac and Windows.',
    category: 'Accessories',
    brand: 'Keychron',
    price: 11500,
    stock: 15,
    tags: ['keychron', 'mechanical keyboard', 'bluetooth'],
    color: 'Dark Grey',
    vendor: 'Imported',
  },
  {
    name: 'Anker PowerCore 10000 Power Bank',
    description:
      'One of the smallest and lightest 10000mAh portable chargers. Provides almost three-and-a-half iPhone 8 charges.',
    category: 'Accessories',
    brand: 'Anker',
    price: 4500,
    stock: 50,
    tags: ['anker', 'power bank', 'portable charger'],
    color: 'Black',
    vendor: 'Anker Official',
  },
  {
    name: 'Ugreen 65W GaN Fast Charger',
    description:
      '3-port fast charger that can power your laptop, phone, and earbuds simultaneously. Compact and efficient.',
    category: 'Accessories',
    brand: 'Ugreen',
    price: 5200,
    stock: 35,
    tags: ['ugreen', 'gan charger', 'fast charging'],
    color: 'Black',
    vendor: 'Ugreen Kenya',
  },
  {
    name: 'Generic Laptop Stand',
    description:
      'Ergonomic and adjustable aluminum laptop stand for better posture and cooling.',
    category: 'Accessories',
    brand: 'Generic',
    price: 2500,
    stock: 100,
    tags: ['laptop stand', 'ergonomic', 'accessory'],
    color: 'Silver',
    vendor: 'Various',
  },

  // Storage
  {
    name: 'Samsung T7 Portable SSD 1TB',
    description:
      'Lightweight and pocket-sized, the Portable SSD T7 delivers fast speeds with easy and reliable data storage.',
    category: 'Storage',
    brand: 'Samsung',
    price: 15500,
    stock: 20,
    tags: ['samsung', 'ssd', 'portable storage', '1tb'],
    color: 'Indigo Blue',
    vendor: 'Samsung Kenya',
  },
  {
    name: 'Seagate Backup Plus 2TB External HDD',
    description:
      'Simple, drag-and-drop backup for your computer in a portable drive. 2TB of storage for your digital life.',
    category: 'Storage',
    brand: 'Seagate',
    price: 8999,
    stock: 40,
    tags: ['seagate', 'hdd', 'external drive', '2tb'],
    color: 'Black',
    vendor: 'Seagate Authorized',
  },
  {
    name: 'Crucial P3 1TB NVMe M.2 SSD',
    description:
      'Upgrade your PC with the NVMe SSD that gets the job done. Delivers read/write speeds up to 3500/3000MB/s.',
    category: 'Storage',
    brand: 'Crucial',
    price: 9800,
    stock: 30,
    tags: ['crucial', 'nvme', 'internal ssd', '1tb'],
    color: 'N/A',
    vendor: 'Crucial',
  },
  {
    name: 'SanDisk Ultra 128GB MicroSD Card',
    description:
      'Ideal for Android smartphones and tablets. Up to 120MB/s transfer speeds to move up to 1000 photos in a minute.',
    category: 'Storage',
    brand: 'SanDisk',
    price: 2200,
    stock: 80,
    tags: ['sandisk', 'microsd', 'memory card', '128gb'],
    color: 'Red/Gray',
    vendor: 'SanDisk Official',
  },
  {
    name: 'Kingston DataTraveler Exodia 64GB',
    description:
      'A simple and reliable USB 3.2 Gen 1 compliant flash drive with a protective cap and a functional loop.',
    category: 'Storage',
    brand: 'Kingston',
    price: 1100,
    stock: 150,
    tags: ['kingston', 'flash drive', 'usb', '64gb'],
    color: 'Black',
    vendor: 'Kingston',
  },

  // Displays
  {
    name: 'Dell UltraSharp U2723QE 27" 4K Monitor',
    description:
      'Experience incredible color and detail on this 27-inch 4K monitor with IPS Black technology and ComfortView Plus.',
    category: 'Displays',
    brand: 'Dell',
    price: 85000,
    stock: 10,
    tags: ['dell', 'ultrasharp', '4k monitor', '27 inch'],
    color: 'Silver',
    vendor: 'Dell Store KE',
  },
  {
    name: 'LG 24MP60G-B 24" Full HD IPS Monitor',
    description:
      '24-inch Full HD (1920 x 1080) IPS Display with AMD FreeSync for smooth gameplay and a 3-side virtually borderless design.',
    category: 'Displays',
    brand: 'LG',
    price: 22000,
    stock: 25,
    tags: ['lg', 'full hd', 'monitor', '24 inch'],
    color: 'Black',
    vendor: 'LG Electronics',
  },
  {
    name: 'Samsung Odyssey G5 27" QHD Gaming Monitor',
    description:
      '1000R curved screen fills your peripheral vision. QHD resolution, 144Hz refresh rate, and 1ms response time.',
    category: 'Displays',
    brand: 'Samsung',
    price: 49500,
    stock: 12,
    tags: ['samsung', 'odyssey', 'gaming monitor', 'curved'],
    color: 'Black',
    vendor: 'Samsung Kenya',
  },
  {
    name: 'BenQ GW2480 24" Eye-Care Monitor',
    description:
      'Designed for beautiful simplicity, BenQ’s GW2480 23.8” frameless monitor combines ultra slim bezels with hidden cable management.',
    category: 'Displays',
    brand: 'BenQ',
    price: 18500,
    stock: 30,
    tags: ['benq', 'eye-care', 'monitor', '24 inch'],
    color: 'Black',
    vendor: 'BenQ Africa',
  },
  {
    name: 'ViewSonic VX3276-2K-MHD 32" WQHD Monitor',
    description:
      'With a stylish frameless design, the ViewSonic VX3276-2K-mhd is the perfect blend of style and performance.',
    category: 'Displays',
    brand: 'ViewSonic',
    price: 42000,
    stock: 14,
    tags: ['viewsonic', 'wqhd', 'monitor', '32 inch'],
    color: 'Silver',
    vendor: 'ViewSonic Dealers',
  },
  // Network
  {
    name: 'TP-Link Archer AX55 Wi-Fi 6 Router',
    description:
      'Dual-Band Wi-Fi 6 for faster speeds, greater capacity, and less network congestion.',
    category: 'Network',
    brand: 'TP-Link',
    price: 11500,
    stock: 30,
    tags: ['tp-link', 'wifi 6', 'router'],
    color: 'Black',
    vendor: 'TP-Link Kenya',
  },
  {
    name: 'Safaricom 4G+ Router',
    description:
      'Connect up to 64 devices with fast 4G+ speeds from Safaricom. Perfect for home and office.',
    category: 'Network',
    brand: 'Safaricom',
    price: 6999,
    stock: 50,
    tags: ['safaricom', '4g', 'router', 'mifi'],
    color: 'White',
    vendor: 'Safaricom Shops',
  },
  {
    name: 'Faiba 4G MiFi Router',
    description:
      'Enjoy fast and affordable internet on the go with the Faiba 4G MiFi. Connects up to 10 devices.',
    category: 'Network',
    brand: 'Faiba',
    price: 5800,
    stock: 60,
    tags: ['faiba', '4g', 'mifi'],
    color: 'Black',
    vendor: 'Faiba',
  },
  {
    name: 'D-Link DWA-171 Wireless AC600 USB Adapter',
    description:
      'Upgrade your laptop or PC to the next-generation 802.11ac standard for faster speeds and better range.',
    category: 'Network',
    brand: 'D-Link',
    price: 2800,
    stock: 45,
    tags: ['d-link', 'wifi adapter', 'usb'],
    color: 'Black',
    vendor: 'D-Link',
  },
  {
    name: 'TP-Link Deco M4 Whole Home Mesh WiFi System',
    description:
      'Deco uses a system of units to achieve seamless whole-home Wi-Fi coverage — eliminate weak signal areas once and for all!',
    category: 'Network',
    brand: 'TP-Link',
    price: 16500,
    stock: 20,
    tags: ['tp-link', 'deco', 'mesh wifi'],
    color: 'White',
    vendor: 'TP-Link Kenya',
  },
  // Audio
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description:
      'Industry-leading noise canceling with two processors controlling eight microphones. Unprecedented sound quality.',
    category: 'Audio',
    brand: 'Sony',
    price: 42000,
    stock: 15,
    tags: ['sony', 'headphones', 'noise cancelling', 'bluetooth'],
    color: 'Black',
    vendor: 'Sony World',
  },
  {
    name: 'Apple AirPods Pro (2nd Generation)',
    description:
      'Richer audio quality, next-level Active Noise Cancellation and Adaptive Transparency. Plus a more personalized listening experience.',
    category: 'Audio',
    brand: 'Apple',
    price: 32500,
    stock: 25,
    tags: ['apple', 'airpods pro', 'earbuds', 'wireless'],
    color: 'White',
    vendor: 'Apple Authorized Reseller',
  },
  {
    name: 'JBL Flip 6 Portable Bluetooth Speaker',
    description:
      'Your adventure. Your soundtrack. The bold JBL Flip 6 delivers powerful JBL Original Pro Sound with exceptional clarity.',
    category: 'Audio',
    brand: 'JBL',
    price: 14500,
    stock: 40,
    tags: ['jbl', 'bluetooth speaker', 'portable', 'waterproof'],
    color: 'Blue',
    vendor: 'JBL Kenya',
  },
  {
    name: 'Bose QuietComfort Earbuds II',
    description:
      "These next-generation wireless earbuds are engineered to let you hear more of your music and feel more of your movie's impact.",
    category: 'Audio',
    brand: 'Bose',
    price: 36000,
    stock: 18,
    tags: ['bose', 'earbuds', 'noise cancelling'],
    color: 'Triple Black',
    vendor: 'Bose Store',
  },
  {
    name: 'Rode NT-USB+ Professional Microphone',
    description:
      'A professional-grade USB microphone that delivers exceptional-quality audio direct to a computer or tablet.',
    category: 'Audio',
    brand: 'Rode',
    price: 25000,
    stock: 20,
    tags: ['rode', 'microphone', 'usb', 'studio'],
    color: 'Black',
    vendor: 'Pro Audio KE',
  },
  // Smart Tech
  {
    name: 'Apple Watch Series 8',
    description:
      'A healthy leap ahead. With advanced health sensors and apps, you can take an ECG, measure heart rate and blood oxygen, and track temperature changes.',
    category: 'Smart Tech',
    brand: 'Apple',
    price: 58000,
    stock: 12,
    tags: ['apple', 'apple watch', 'smartwatch'],
    color: 'Midnight',
    vendor: 'Apple Authorized Reseller',
  },
  {
    name: 'Samsung Galaxy Watch 5',
    description:
      'Meet the Galaxy Watch5. It comes with an innovative 3-in-1 sensor that measures your heart rate, blood oxygen and stress levels.',
    category: 'Smart Tech',
    brand: 'Samsung',
    price: 34500,
    stock: 20,
    tags: ['samsung', 'galaxy watch', 'smartwatch', 'android'],
    color: 'Graphite',
    vendor: 'Samsung Kenya',
  },
  {
    name: 'Fitbit Charge 5',
    description:
      "Optimize your workout routine with a Daily Readiness Score that reveals if you're ready to exercise or should prioritize recovery.",
    category: 'Smart Tech',
    brand: 'Fitbit',
    price: 21000,
    stock: 30,
    tags: ['fitbit', 'fitness tracker', 'health'],
    color: 'Black',
    vendor: 'Fitbit',
  },
  {
    name: 'Xiaomi Mi Band 7',
    description:
      'Features a 1.62" AMOLED display, 120 sports modes, all-day SpO2 monitoring, and up to 14 days of battery life.',
    category: 'Smart Tech',
    brand: 'Xiaomi',
    price: 6500,
    stock: 50,
    tags: ['xiaomi', 'mi band', 'fitness tracker'],
    color: 'Black',
    vendor: 'Xiaomi Store',
  },
  {
    name: 'Google Nest Hub (2nd Gen)',
    description:
      'The center of your helpful home. Entertainment is a tap away. And with Sleep Sensing, it can help you get a better night’s rest.',
    category: 'Smart Tech',
    brand: 'Google',
    price: 13500,
    stock: 15,
    tags: ['google', 'nest hub', 'smart display', 'smart home'],
    color: 'Chalk',
    vendor: 'Imported',
  },
  // Add 30 more products
  // Laptops
  {
    name: 'Microsoft Surface Laptop 5',
    description:
      'Multitasking speed powered by 12th Gen Intel Core processors, with Windows 11 and a vibrant PixelSense touchscreen.',
    category: 'Laptops',
    brand: 'Microsoft',
    price: 145000,
    stock: 9,
    tags: ['microsoft', 'surface', 'ultrabook', 'windows 11'],
    color: 'Platinum',
    vendor: 'Microsoft KE',
  },
  {
    name: 'HP Spectre x360 14',
    description:
      'Stunning 2-in-1 laptop with a 3K2K OLED display, Intel Evo platform, and a gem-cut design.',
    category: 'Laptops',
    brand: 'HP',
    price: 180000,
    stock: 6,
    tags: ['hp', 'spectre', '2-in-1', 'oled'],
    color: 'Nightfall Black',
    vendor: 'HP Kenya',
  },
  // Phones
  {
    name: 'OnePlus 11 5G',
    description:
      'The Shape of Power. Powered by Snapdragon 8 Gen 2, with a 3rd Gen Hasselblad Camera for Mobile.',
    category: 'Phones',
    brand: 'OnePlus',
    price: 95000,
    stock: 11,
    tags: ['oneplus', '5g', 'hasselblad', 'smartphone'],
    color: 'Titan Black',
    vendor: 'OnePlus Kenya',
  },
  {
    name: 'Oppo Reno 10 Pro',
    description:
      'The Portrait Expert. Featuring an ultra-clear portrait camera system and 80W SUPERVOOC Flash Charge.',
    category: 'Phones',
    brand: 'Oppo',
    price: 72000,
    stock: 18,
    tags: ['oppo', 'reno', 'portrait camera', 'smartphone'],
    color: 'Glossy Purple',
    vendor: 'Oppo Kenya',
  },
  // Accessories
  {
    name: 'Razer DeathAdder V2 Pro Wireless Gaming Mouse',
    description:
      'Ergonomics without equal. With over 13 million DeathAdders sold, the most successful gaming mouse ever.',
    category: 'Accessories',
    brand: 'Razer',
    price: 14000,
    stock: 22,
    tags: ['razer', 'deathadder', 'gaming mouse', 'wireless'],
    color: 'Black',
    vendor: 'Razer Authorized',
  },
  {
    name: 'Elgato Stream Deck MK.2',
    description:
      'Your setup is your world. From broadcasting and editing to designing and developing, Stream Deck is your key to it all.',
    category: 'Accessories',
    brand: 'Elgato',
    price: 19500,
    stock: 14,
    tags: ['elgato', 'stream deck', 'streaming', 'content creation'],
    color: 'Black',
    vendor: 'Pro Audio KE',
  },
  {
    name: 'Apple Magic Keyboard',
    description:
      'Magic Keyboard delivers a remarkably comfortable and precise typing experience. It’s also wireless and rechargeable.',
    category: 'Accessories',
    brand: 'Apple',
    price: 15000,
    stock: 28,
    tags: ['apple', 'magic keyboard', 'bluetooth keyboard'],
    color: 'White',
    vendor: 'Apple Authorized Reseller',
  },
  // Storage
  {
    name: 'WD My Passport 4TB',
    description:
      'Every journey needs a passport. The My Passport drive is trusted, portable storage that gives you the confidence and freedom to drive forward in life.',
    category: 'Storage',
    brand: 'Western Digital',
    price: 13500,
    stock: 33,
    tags: ['wd', 'my passport', 'external hdd', '4tb'],
    color: 'Blue',
    vendor: 'WD Kenya',
  },
  {
    name: 'Sabrent Rocket 4 Plus 2TB NVMe SSD',
    description:
      'Unleash the power of PCIe 4.0. The Sabrent Rocket 4 Plus delivers performance that takes full advantage of the new standard.',
    category: 'Storage',
    brand: 'Sabrent',
    price: 28000,
    stock: 15,
    tags: ['sabrent', 'nvme', 'pcie 4.0', '2tb'],
    color: 'Copper/Black',
    vendor: 'Imported',
  },
  // Displays
  {
    name: 'Gigabyte M27Q 27" QHD IPS Gaming Monitor',
    description:
      'The last mile for your gaming system. As an unseen player, monitor is often being underestimated.',
    category: 'Displays',
    brand: 'Gigabyte',
    price: 45000,
    stock: 19,
    tags: ['gigabyte', 'gaming monitor', 'qhd', '170hz'],
    color: 'Black',
    vendor: 'Gigabyte Kenya',
  },
  // Network
  {
    name: 'Ubiquiti UniFi 6 Lite Access Point',
    description:
      'Sleek and compact 2x2 WiFi 6 access point that can reach an aggregate throughput rate up to 1.5 Gbps.',
    category: 'Network',
    brand: 'Ubiquiti',
    price: 18000,
    stock: 26,
    tags: ['ubiquiti', 'unifi', 'access point', 'wifi 6'],
    color: 'White',
    vendor: 'Ubiquiti Kenya',
  },
  // Audio
  {
    name: 'Sennheiser HD 560S Audiophile Headphones',
    description:
      'The HD 560S is tailor-made for listeners who need to understand a complex audio mix in honest, exacting detail.',
    category: 'Audio',
    brand: 'Sennheiser',
    price: 28000,
    stock: 16,
    tags: ['sennheiser', 'headphones', 'audiophile', 'wired'],
    color: 'Black',
    vendor: 'Sennheiser Store',
  },
  // Smart Tech
  {
    name: 'Amazon Echo Dot (5th Gen)',
    description:
      'Our best-sounding Echo Dot yet. Enjoy an improved audio experience compared to any previous Echo Dot with Alexa for clearer vocals, deeper bass and vibrant sound.',
    category: 'Smart Tech',
    brand: 'Amazon',
    price: 7500,
    stock: 45,
    tags: ['amazon', 'echo dot', 'alexa', 'smart speaker'],
    color: 'Glacier White',
    vendor: 'Imported',
  },
  {
    name: 'Philips Hue White and Color Ambiance Starter Kit',
    description:
      'Get started with Philips Hue and control your lights your way. With millions of colors and shades of white light, you can instantly change the look and atmosphere.',
    category: 'Smart Tech',
    brand: 'Philips',
    price: 22000,
    stock: 21,
    tags: ['philips hue', 'smart lighting', 'led'],
    color: 'White',
    vendor: 'Philips Kenya',
  },
  // Graphic Cards
  {
    name: 'NVIDIA GeForce RTX 4070 Ti',
    description:
      'The NVIDIA® GeForce RTX® 4070 Ti delivers the ultra performance and features that enthusiast gamers and creators demand.',
    category: 'Graphic Cards',
    brand: 'NVIDIA',
    price: 130000,
    stock: 8,
    tags: ['nvidia', 'rtx 4070 ti', 'gpu', 'gaming'],
    color: 'N/A',
    vendor: 'Various Brands',
  },
  {
    name: 'AMD Radeon RX 7800 XT',
    description:
      'Experience incredible gaming and streaming performance with AMD Radeon™ RX 7800 XT graphics cards, powered by the AMD RDNA™ 3 architecture.',
    category: 'Graphic Cards',
    brand: 'AMD',
    price: 98000,
    stock: 12,
    tags: ['amd', 'radeon', 'rx 7800 xt', 'gpu'],
    color: 'N/A',
    vendor: 'Various Brands',
  },
  // Processors
  {
    name: 'Intel Core i7-13700K',
    description:
      '13th Gen Intel Core i7-13700K desktop processor. Featuring Intel Turbo Boost Max Technology 3.0, and PCIe 5.0 & 4.0 support.',
    category: 'Processors',
    brand: 'Intel',
    price: 62000,
    stock: 14,
    tags: ['intel', 'core i7', 'cpu', '13th gen'],
    color: 'N/A',
    vendor: 'Intel',
  },
  {
    name: 'AMD Ryzen 7 7800X3D',
    description:
      'The ultimate gaming processor. Get an average of over 100 FPS in popular games with the AMD Ryzen 7 7800X3D processor.',
    category: 'Processors',
    brand: 'AMD',
    price: 68000,
    stock: 11,
    tags: ['amd', 'ryzen 7', '3d v-cache', 'cpu'],
    color: 'N/A',
    vendor: 'AMD',
  },
  // RAM Modules
  {
    name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz',
    description:
      'Vengeance LPX memory is designed for high-performance overclocking. The heatspreader is made of pure aluminum for faster heat dissipation.',
    category: 'RAM Modules',
    brand: 'Corsair',
    price: 8500,
    stock: 40,
    tags: ['corsair', 'ram', 'ddr4', '16gb'],
    color: 'Black',
    vendor: 'Corsair',
  },
  {
    name: 'G.Skill Ripjaws S5 32GB (2x16GB) DDR5 6000MHz',
    description:
      'Ripjaws S5 is a high-performance DDR5 memory tailor-made for the latest Intel Core processor platform.',
    category: 'RAM Modules',
    brand: 'G.Skill',
    price: 19500,
    stock: 25,
    tags: ['g.skill', 'ram', 'ddr5', '32gb'],
    color: 'Matte White',
    vendor: 'G.Skill',
  },
  // Motherboards
  {
    name: 'ASUS ROG Strix B550-F Gaming WiFi II',
    description:
      'This motherboard is PCIe® 4.0-ready and provides the latest connectivity options for supersmooth networking and blisteringly fast file transfers.',
    category: 'Motherboards',
    brand: 'ASUS',
    price: 28000,
    stock: 18,
    tags: ['asus', 'rog strix', 'b550', 'motherboard', 'amd'],
    color: 'Black',
    vendor: 'Asus Kenya',
  },
  // Power Supplies
  {
    name: 'Corsair RM850e 850W Gold Fully Modular PSU',
    description:
      'CORSAIR RMe Series Fully Modular Low-Noise Power Supplies with ATX 3.0 and PCIe 5.0 compliance provide quiet, reliable power to your PC.',
    category: 'Power Supplies',
    brand: 'Corsair',
    price: 18500,
    stock: 22,
    tags: ['corsair', 'psu', 'power supply', '850w', 'gold'],
    color: 'Black',
    vendor: 'Corsair',
  },
  // Coolers/Fans
  {
    name: 'Noctua NH-D15 chromax.black CPU Cooler',
    description:
      "The NH-D15 chromax.black is an all-black version of Noctua's award-winning flagship model NH-D15 premium-quality quiet CPU cooler.",
    category: 'Coolers/Fans',
    brand: 'Noctua',
    price: 15000,
    stock: 17,
    tags: ['noctua', 'cpu cooler', 'air cooling'],
    color: 'Black',
    vendor: 'Noctua',
  },
];

// Helper to generate random dates
const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const seedDatabase = async () => {
  console.log('Starting to seed database...');
  const productsCollection = db.collection('products');

  // Clear existing products to avoid duplicates on re-seed
  const existingProducts = await productsCollection.get();
  const batch = db.batch();
  existingProducts.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log('Cleared existing products.');

  const newBatch = db.batch();
  let count = 0;

  productsToSeed.forEach(product => {
    const docRef = productsCollection.doc(); // Auto-generate ID

    // Randomize some data for realism
    const isFeatured = Math.random() < 0.2; // 20% chance of being featured
    const discountPercent =
      Math.random() < 0.3 ? Math.floor(Math.random() * 25) + 5 : 0; // 30% chance of discount
    const views = Math.floor(Math.random() * 5000);
    const cartCount = Math.floor(Math.random() * (views / 10));
    const ordersCount = Math.floor(Math.random() * (cartCount / 4));
    const averageRating = (Math.random() * 1.5 + 3.5).toFixed(1); // Rating between 3.5 and 5.0
    const reviewsCount = Math.floor(Math.random() * 100);
    const createdAt = randomDate(
      new Date(2023, 0, 1),
      new Date()
    );

    newBatch.set(docRef, {
      ...product,
      imageUrl: `https://placehold.co/600x400.png`,
      currency: 'KES',
      price: product.price,
      discountPercent,
      isFeatured,
      views,
      cartCount,
      ordersCount,
      averageRating: parseFloat(averageRating),
      reviewsCount,
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(new Date()),
      shippingTime: '1-3 Business Days',
      warranty: '1 Year Standard',
    });
    count++;
  });

  await newBatch.commit();
  console.log(`Successfully seeded ${count} products.`);
};

seedDatabase().catch(error => {
  console.error('Error seeding database:', error);
});

    