# **App Name**: Zizo OrderVerse

## Core Features:

- Splash Screen Animation: Implement a futuristic splash screen with animated holographic HUD intro and brand logo.
- Product Marketplace: Develop a responsive product marketplace with category browsing, filtering, and add-to-cart functionality.
- Product Detail Page: Create a detailed product page with 3D renders, specs, and add-to-cart options.
- Checkout Flow: Implement a checkout page that sends order information to the n8n backend via a secure webhook API (with token and RBAC validation).
  - **Security:** All webhook calls must include `N8N_WEBHOOK_TOKEN` and user role for RBAC validation. Never expose secrets to the frontend.
  - **API Contract:** POST to `N8N_WEBHOOK_URL` with order payload and token in header. Response: `{ success: boolean, message: string }`
- Order Success Page: Design a futuristic order success screen with order details and estimated shipping time.
- AI Enhanced Product Info: Integrate an AI-powered tool on the product pages to enhance descriptions or provide comparative stats based on component selection.
- Role Based Dashboards: Role-based dashboards (client/vendor/admin) to track orders, manage inventory, and monitor system logs.

## Style Guidelines:

- Primary color: Electric Blue (#7DF9FF) for a modern, futuristic aesthetic.
- Background color: Dark slate gray (#2F4F4F) provides contrast to highlight the electric blue, conveying depth and technological sophistication.
- Accent color: Neon Violet (#9F00FF) to draw attention to interactive elements and important notifications, complementing the high-tech atmosphere.
- Font: 'Space Mono' for headings and data; it gives a futuristic look. A monospaced font, it is clear for the data to be displayed.
- Use Lucide icons and custom SVG holographics to align with the Sci-fi NASA x Cyberpunk theme.
- Employ a responsive 12-column grid layout with animated panels to create a structured and dynamic user interface.
- Incorporate Framer Motion for route transitions, cart bounces, and other subtle UI enhancements.