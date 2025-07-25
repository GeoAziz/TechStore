
"use client";

import { useState, useEffect } from 'react';
import SplashScreen from '@/components/splash-screen';
import Header from './header';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200); // Match splash duration
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen />}
      <div className={`flex flex-col min-h-screen${showSplash ? ' pointer-events-none blur-sm' : ''}`}>
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
