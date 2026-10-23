"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Cookie, Shield, Check, X } from 'lucide-react';

const STORAGE_KEY = 'techstore_cookie_consent';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      setShowBanner(true);
    } else {
      setPreferences(consent);
    }

    const handleReopen = () => {
      setShowBanner(true);
      setShowModal(true);
    };

    window.addEventListener('techstore:reopen-cookie-settings', handleReopen);
    return () => window.removeEventListener('techstore:reopen-cookie-settings', handleReopen);
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('techstore:consent_changed', { detail: prefs })
        );
      }
    } catch {
      // ignore
    }
    setPreferences(prefs);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ essential: true, analytics: true, marketing: true });
  };

  const handleRejectNonEssential = () => {
    saveConsent({ essential: true, analytics: false, marketing: false });
  };

  if (!showBanner) return null;

  return (
    <div
      id="cookie-consent-banner"
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-2xl bg-[#0e1017]/95 border border-white/15 backdrop-blur-xl shadow-2xl space-y-4 no-print text-white text-xs animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20 shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            Privacy & Cookies
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            We use essential cookies to maintain secure sessions and cart storage. With your consent, we also measure site performance to improve your tech shopping experience.
          </p>
        </div>
      </div>

      {showModal && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between py-1">
            <span className="font-semibold text-white/90">Strictly Necessary (Required)</span>
            <span className="text-[10px] uppercase font-bold text-lime-400">Always Active</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="font-semibold text-white/90">Analytics & Performance</span>
            <input
              type="checkbox"
              id="analytics-cookies"
              checked={preferences.analytics}
              onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
              className="accent-lime-400 rounded w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="font-semibold text-white/90">Marketing Attribution</span>
            <input
              type="checkbox"
              id="marketing-cookies"
              checked={preferences.marketing}
              onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
              className="accent-lime-400 rounded w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
        <Link href="/privacy" className="text-muted-foreground hover:text-white underline underline-offset-2">
          Read Policy
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          {showModal ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => saveConsent(preferences)}
              className="h-8 text-xs rounded-full border-white/20 text-white hover:bg-white/10"
            >
              Save Choices
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowModal(true)}
              className="h-8 text-xs text-muted-foreground hover:text-white"
            >
              Preferences
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleRejectNonEssential}
            className="h-8 text-xs rounded-full border-white/20 text-white hover:bg-white/10"
          >
            Reject Non-Essential
          </Button>

          <Button
            size="sm"
            onClick={handleAcceptAll}
            className="h-8 text-xs rounded-full bg-[#bef264] text-black font-extrabold hover:bg-lime-300"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}

