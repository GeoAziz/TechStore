"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getCookieConsent } from "@/components/compliance/cookie-consent";

export default function GoogleAnalyticsTag() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-RTDRRL0F9B";
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent && consent.analytics) {
      setHasConsent(true);
    }

    const handleConsentChange = (e: any) => {
      const prefs = e.detail;
      if (prefs && prefs.analytics) {
        setHasConsent(true);
      } else {
        setHasConsent(false);
      }
    };

    window.addEventListener("techstore:consent_changed", handleConsentChange);
    return () => window.removeEventListener("techstore:consent_changed", handleConsentChange);
  }, []);

  if (!hasConsent || !measurementId) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              transport_type: 'beacon'
            });
          `,
        }}
      />
    </>
  );
}

