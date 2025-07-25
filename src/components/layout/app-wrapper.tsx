
"use client";

import { useState, useEffect } from 'react';
import SplashScreen from '@/components/splash/splash-screen';
import Header from './header';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // This is a failsafe in case the splash screen's internal logic doesn't hide it
    const timer = setTimeout(() => setShowSplash(false), 4000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SplashScreen onFinished={() => setShowSplash(false)} />
      <div className={`flex flex-col min-h-screen transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
