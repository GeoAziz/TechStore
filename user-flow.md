# TechStore User Flow

This document describes the complete, user-friendly journey for shoppers and admins in TechStore, from adding items to cart/wishlist, through checkout, and including backend automation with n8n.

---

## 1. Add/Remove to Cart

- **Browse Products:**
  - Users explore products on the storefront.
  - Each product has an "Add to Cart" button.
- **Add to Cart:**
  - When clicked, the product is added to the user's cart in Firestore (`users/{userId}/cart/current`).
  - The cart persists across devices and sessions.
- **Remove from Cart:**
  - Users can remove items from their cart at any time.
  - The cart in Firestore is updated instantly.

---

## 2. Add/Remove to Wishlist

- **Wishlist Button:**
  - Each product has a "Wishlist" button.
- **Add to Wishlist:**
  - Clicking adds the product to the user's wishlist in Firestore (`users/{userId}/wishlist/current`).
  - Wishlist is persistent and accessible from any device.
- **Remove from Wishlist:**
  - Users can remove items from their wishlist.
  - Firestore is updated accordingly.

---

## 3. Checkout Process

- **View Cart:**
  - Users review their cart, update quantities, or remove items.
- **Proceed to Checkout:**
  - Users fill out shipping and contact information.
  - Payment details are entered securely via Stripe.
- **Payment:**
  - Stripe processes the payment.
  - If successful, the checkout utility:
    - Creates an order in Firestore (`orders` collection).
    - Deducts purchased quantities from product inventory in Firestore.
    - Clears the user's cart in Firestore.
- **Order Confirmation:**
  - User sees a success message and is redirected to the order confirmation page.

---

## 4. n8n Automation (Behind the Scenes)

- **Order Webhook:**
  - After checkout, the frontend sends order details to n8n via a webhook.
- **n8n Workflow:**
  - Validates the request and user role.
  - Creates the order in Firestore (if not already done).
  - Updates inventory in Google Sheets for reporting.
  - Sends a Telegram notification to the admin.
  - Sends a confirmation email to the user.
  - Logs the order in an audit sheet in Google Sheets.
  - Handles errors and alerts the admin if needed.

---

## 5. Admin Experience

- **Real-Time Notifications:**
  - Admins receive Telegram alerts for new orders.
- **Order Management:**
  - Orders and inventory are visible in the admin dashboard (powered by Firestore).
- **Reporting:**
  - Inventory and audit logs are synced to Google Sheets for business analysis.

---

## 6. Summary

- **Cart and wishlist are persistent and cloud-based (Firestore).**
- **Checkout is secure and updates inventory only after payment.**
- **n8n automates backend tasks: order creation, inventory sync, notifications, and reporting.**
- **Admins and users both benefit from real-time updates and confirmations.**

---

If you need more details on any step or want to expand the flow, let us know!
