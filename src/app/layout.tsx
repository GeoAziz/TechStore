import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppWrapper from '@/components/layout/app-wrapper';
import { AuthProvider } from '@/context/auth-context';
import { Inter, Space_Grotesk, Orbitron } from 'next/font/google';
import { CompareProvider } from '@/context/compare-context';
import { CartProvider } from '@/context/cart-context';
import { ThemeProvider } from '@/context/theme-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-orbitron' });

export const metadata: Metadata = {
  title: 'TechStore | Upgrade Your Everyday Tech',
  description: 'Latest gadgets. Premium brands. Performance you can trust. High-performance multi-vendor tech marketplace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${orbitron.variable} font-body antialiased`}>
        {/* Skip to Content Link (Feature 8) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[999] px-4 py-2 rounded-lg bg-lime-400 text-black font-extrabold shadow-2xl focus:outline-none focus:ring-2 focus:ring-black no-print"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <CompareProvider>
                <AppWrapper>
                  {children}
                </AppWrapper>
              </CompareProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
