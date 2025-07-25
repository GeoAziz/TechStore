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
- Checkout page posts order data to n8n workflow
- Product page calls n8n/Genkit for enhanced info

## Testing
- Run unit tests:
   ```sh
   npm test
   ```

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
