"use client";

import { useState, useEffect } from 'react';
import SplashScreen from '@/components/splash/splash-screen';
import Header from './header';
import Footer from './footer';
import { usePathname } from 'next/navigation';
import AiAssistantOverlay from '@/components/ai-assistant';
import ScrollProgress from '@/components/ui/scroll-progress';
import BackToTop from '@/components/ui/back-to-top';
import FloatingContact from '@/components/ui/floating-contact';
import CookieConsentBanner from '@/components/compliance/cookie-consent';
import UTMTracker from '@/components/analytics/utm-tracker';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSplash) {
        setShowSplash(false);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [showSplash]);

  // Don't show consumer chrome for admin or vendor dashboard portals
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard/vendor')) {
    return (
      <>
        <UTMTracker />
        {children}
      </>
    );
  }

  return (
    <>
      <UTMTracker />
      <ScrollProgress />
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
      <div className={`transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        {!showSplash && (
          <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
              {children}
            </main>
            <Footer />
            <AiAssistantOverlay />
            <FloatingContact />
            <BackToTop />
            <CookieConsentBanner />
          </div>
        )}
      </div>
    </>
  );
}
