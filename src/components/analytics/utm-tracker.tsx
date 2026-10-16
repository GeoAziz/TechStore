"use client";

import { useEffect } from 'react';

export interface UTMParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  captured_at?: string;
}

const STORAGE_KEY = 'techstore_utm_data';

export function getStoredUTM(): UTMParameters | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function UTMTracker() {
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
      
      const captured: UTMParameters = {};
      let hasUtm = false;

      utmKeys.forEach((key) => {
        const value = urlParams.get(key);
        if (value) {
          // Sanitize length and special characters to prevent URL injection
          const sanitized = value.slice(0, 100).replace(/[<>'"]/g, '');
          captured[key] = sanitized;
          hasUtm = true;
        }
      });

      if (hasUtm) {
        captured.captured_at = new Date().toISOString();
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
      }
    } catch {
      // Safe fallback if sessionStorage or URLSearchParams is restricted
    }
  }, []);

  return null;
}

