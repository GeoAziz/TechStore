# Zizo OrderVerse Frontend

## Overview

A futuristic, sci-fi marketplace built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. Connects to n8n backend for order processing and AI-powered product enhancements.

## Features
- Futuristic splash screen
- Marketplace with advanced filters
- Product details with AI enhancements
- Secure checkout (n8n webhook)
- Role-based dashboards
- Customizer & compare tools
- Accessibility and responsive design
- Toast notifications for all actions
- TypeScript everywhere
- Unit tests for key components

## Theming
- Electric Blue (#7DF9FF), Neon Violet (#9F00FF), Dark Slate Gray (#2F4F4F)
- Space Mono for headings/data, Inter for body text

## Setup
1. Install dependencies:
   ```sh
   npm install
   ```
2. Run the development server:
   ```sh
   npm run dev
   ```
3. Configure environment variables in `.env`

## n8n Integration
- Checkout page posts order data to n8n workflow using a secure webhook (token in .env)
- Product page calls n8n/Genkit for enhanced info
- RBAC and token validation enforced in n8n workflow for security
- **Security:** Webhook calls include `N8N_WEBHOOK_TOKEN` and user role for RBAC. Never expose secrets to the frontend.
- **API Contract:**
  - POST to `N8N_WEBHOOK_URL` with order payload and token in header
  - Response: `{ success: boolean, message: string }`

## API Contracts
- **Order Webhook**: `POST /api/order-webhook`
  - Headers: `x-webhook-secret: <your_secret>`
  - Payload: `{ orderId, userId, products, total, ... }`
  - Response: `{ success: boolean, message: string }`

## Environment Variables
- `NEXT_PUBLIC_SENTRY_DSN` (frontend Sentry)
- `SENTRY_DSN` (backend Sentry)
- `WEBHOOK_SECRET` (order webhook security)
- `SSL_KEY_PATH`, `SSL_CERT_PATH` (for HTTPS/WebSocket)
- `N8N_WEBHOOK_URL` (n8n integration)
- Firebase/Stripe keys as needed

## Monitoring
- Sentry is integrated for both frontend and backend error tracking.
- See `/src/sentry.client.config.ts` and `/src/utils/sentry.ts` for setup.

## Deployment (Vercel)
1. Push your code to GitHub.
2. Connect your repo to Vercel.
3. Set all environment variables in Vercel dashboard.
4. Vercel will auto-deploy on push (CI/CD built-in).
5. For custom domains/SSL, configure in Vercel settings.

## Local Development
- Install dependencies: `npm install`
- Run locally: `npm run dev`
- For HTTPS/WebSocket, see `/src/server/https-server.js` and place SSL certs in `/ssl/`

## Testing
- Run backend tests: `npm test`
- See `/src/__tests__/order-webhook.test.ts` for integration tests

## Sentry Setup
- Get DSN from Sentry project
- Add to `.env` and Vercel dashboard
- Errors will appear in Sentry dashboard

## CI/CD
- Vercel auto-builds and deploys on push
- For custom workflows, use `.vercel/project.json` or GitHub Actions

## Accessibility
- All interactive elements are keyboard accessible
- ARIA labels for key UI components

## Contribution
- Organize components by domain
- Use TypeScript types everywhere
- Document custom hooks/context

---
For more details, see the code comments and docs folder.
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
