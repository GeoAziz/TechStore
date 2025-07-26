
"use client";

import { useState, useEffect } from 'react';
import SplashScreen from '@/components/splash/splash-screen';
import Header from './header';
import { usePathname } from 'next/navigation';
import AiAssistantOverlay from '@/components/ai-assistant';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const pathname = usePathname();

  // This effect will be triggered once on component mount.
  // The SplashScreen component will call onFinished when its animation is complete.
  useEffect(() => {
    // This is a failsafe in case the splash screen's internal logic doesn't hide it
    const timer = setTimeout(() => {
        if (showSplash) {
            setShowSplash(false);
        }
    }, 4000); // Hide after 4 seconds regardless
    return () => clearTimeout(timer);
  }, [showSplash]);

  // Don't show the main app wrapper for admin pages
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
      <div className={`flex flex-col min-h-screen transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <Header />
        <main className="flex-1">{children}</main>
        <AiAssistantOverlay />
      </div>
    </>
  );
}
