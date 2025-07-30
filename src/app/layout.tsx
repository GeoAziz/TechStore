
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import AppWrapper from '@/components/layout/app-wrapper';
import { AuthProvider } from '@/context/auth-context';
import { Inter, Space_Grotesk, Orbitron } from 'next/font/google';
import { CompareProvider } from '@/context/compare-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-orbitron' });


export const metadata: Metadata = {
  title: 'Zizo OrderVerse',
  description: 'A futuristic, responsive, AI-ready marketplace platform for computers & accessories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${orbitron.variable} font-body antialiased`}>
        <AuthProvider>
          <CompareProvider>
            <AppWrapper>
              {children}
            </AppWrapper>
          </CompareProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
