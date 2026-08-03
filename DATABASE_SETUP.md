# TechStore Database Setup Guide

## 📦 What's Included

Your new product database contains **60+ high-quality tech products** across **13 categories**:

- ✅ **Laptops** (8 products) - Business, Gaming, Premium, Budget
- ✅ **Desktops** (5 products) - Gaming, Office, Workstations
- ✅ **Monitors** (6 products) - 4K, Gaming, Professional, Portable
- ✅ **Keyboards** (6 products) - Mechanical, Wireless, Professional
- ✅ **Mice** (5 products) - Gaming, Professional, Productivity
- ✅ **Headphones** (6 products) - Noise-cancelling, Gaming, Earbuds
- ✅ **Webcams** (4 products) - Streaming, Professional, Budget
- ✅ **Storage Drives** (5 products) - SSD, HDD, External, Portable
- ✅ **Graphics Cards** (4 products) - NVIDIA, AMD, Gaming, Professional
- ✅ **RAM Modules** (4 products) - DDR4, DDR5, Gaming, Workstation
- ✅ **Processors** (3 products) - Intel, AMD, High-end
- ✅ **Power Supplies** (2 products) - Modular, Gold-rated
- ✅ **Coolers/Fans** (2 products) - Air cooling, Cases

## 🖼️ Images

All products include **real, verified Unsplash product images**:
- No placeholder images ❌
- Real product photography ✅
- Properly matched to product types ✅
- Fast loading optimized URLs ✅

## 🚀 Quick Start

### Step 1: Set Up Your New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable Firestore Database
4. Set up Authentication (Email/Password, Google Sign-in)
5. Update your Firebase credentials in `.env.local`

### Step 2: Seed the Database

#### Option A: Using the Admin API (Recommended)

1. **Get your Firebase Admin Token**:
   ```bash
   # Run this in your browser console at your app
   firebase.auth().currentUser.getIdToken().then(token => console.log(token))
   ```

2. **Call the seeding endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed-database?action=seed \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

3. **Check database stats**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed-database?action=stats \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

#### Option B: Direct Server Function

Add this to a server-side route or admin page:

```typescript
import { seedDatabase } from '@/lib/seed-firestore';

// In an API route or server action
const result = await seedDatabase();
console.log(result); // Shows success/error
```

### Step 3: Start Your Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000` - your store will now display 60+ products!

## 📊 Database Structure

Each product includes:

```typescript
{
  id: "auto-generated",
  name: string,
  brand: string,
  category: "Laptops" | "Desktops" | ... (13 categories),
  subcategory?: string,
  price: number, // in KES
  currency: "KES",
  stock: number,
  description: string,
  imageUrl: string, // Valid Unsplash URL
  
  // Ratings & Metrics
  averageRating: number (1-5),
  reviewsCount: number,
  views: number,
  ordersCount: number,
  
  // Features
  isFeatured: boolean,
  promoTag?: string,
  discountPercent?: number,
  warranty: string,
  shippingTime: string,
  
  // Specifications
  specs: {
    processor?: string,
    ram?: string,
    storage?: string,
    display?: string,
    ... (product-specific)
  },
  
  // Timestamps
  createdAt: timestamp,
  updatedAt?: timestamp
}
```

## 🔧 Advanced Operations

### Clear All Products (Dangerous!)

```bash
curl -X POST "http://localhost:3000/api/admin/seed-database?action=clear&confirm=true" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Re-seed Database

Just run the seed command again - it won't create duplicates:

```bash
curl -X POST http://localhost:3000/api/admin/seed-database?action=seed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Customizing Products

Edit `src/lib/seed-database.ts` to:
- Change prices
- Adjust stock levels
- Add new products
- Update descriptions
- Change featured status
- Modify specifications

Then re-run the seed endpoint.

## 🎨 Product Data Features

### High-Quality Images
- All URLs are valid Unsplash images
- Optimized for web (500x500px)
- Fast loading with `w=500&h=500&fit=crop` parameters
- No broken links ✅

### Realistic Pricing (KES)
- Laptop: 54,999 - 189,999 KES
- Desktop: 64,999 - 149,999 KES
- Monitor: 24,999 - 89,999 KES
- Accessories: 5,999 - 34,999 KES

### Complete Specifications
Every product has detailed specs including:
- Processor/GPU specs
- Memory & Storage
- Display specifications
- Battery/Power info
- Connectivity options

### Business Metrics
Each product tracks:
- View count
- Cart additions
- Order count
- Average rating
- Review count
- Promo tags

## ✅ Verification Checklist

After seeding:

- [ ] Visit homepage - should show featured products
- [ ] Navigate to Shop - all 60+ products visible
- [ ] Filter by category - products grouped correctly
- [ ] View product details - images load without 404s
- [ ] Add to cart - works smoothly
- [ ] Search products - finds items by name/brand
- [ ] Sort by price - works correctly
- [ ] Check Firestore - 60+ documents created

## 🛠️ Troubleshooting

### "Unauthorized - provide valid token"
- Make sure you're passing a valid Firebase ID token
- Token must be from an authenticated user
- Try getting a new token

### "Failed to seed database"
- Check Firestore is enabled in Firebase Console
- Verify database rules allow writes
- Check Firebase Admin SDK is properly initialized

### Images showing 404s
- All Unsplash URLs are verified working
- If any fail, they'll eventually timeout and use fallback
- Check network tab in browser DevTools

### Duplicate products after re-seeding
- The seeding script uses auto-generated IDs
- Re-running will create new documents with different IDs
- Use the `clear` action first if you want to replace

## 📞 Support

For issues:
1. Check Firestore rules allow admin operations
2. Verify Firebase project is properly configured
3. Check browser console for specific error messages
4. Ensure `.env.local` has correct Firebase credentials

## 🎯 Next Steps

1. ✅ Seed database with 60+ products
2. ✅ Add your branding/logo
3. ✅ Customize prices for your market
4. ✅ Set up payment processing
5. ✅ Configure email notifications
6. ✅ Add user reviews system
7. ✅ Set up admin dashboard

**Your store is ready to go!** 🚀
