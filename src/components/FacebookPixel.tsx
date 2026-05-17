"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Loads the Facebook Pixel script dynamically based on admin-configured settings.
 * Fires PageView on every route change.
 */
export function FacebookPixel() {
  const [pixelId, setPixelId] = useState<string | null>(null);
  const pathname = usePathname();

  // Fetch pixel config on mount
  useEffect(() => {
    fetch("/api/v1/pixel-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.pixelId) {
          setPixelId(data.pixelId);
          initPixel(data.pixelId);
        }
      })
      .catch(() => {
        // Pixel not configured — silently skip
      });
  }, []);

  // Fire PageView on route changes
  useEffect(() => {
    if (pixelId && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname, pixelId]);

  return null;
}

function initPixel(pixelId: string) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function") return; // Already initialized

  // Standard Facebook Pixel base code
  const f: any = window;
  const b = document;
  const e = "script";

  f.fbq = function () {
    f.fbq.callMethod
      ? f.fbq.callMethod.apply(f.fbq, arguments)
      : f.fbq.queue.push(arguments);
  };

  if (!f._fbq) f._fbq = f.fbq;
  f.fbq.push = f.fbq;
  f.fbq.loaded = true;
  f.fbq.version = "2.0";
  f.fbq.queue = [];

  const script = b.createElement(e) as HTMLScriptElement;
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  const firstScript = b.getElementsByTagName(e)[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

/**
 * Helper to fire a custom Facebook Pixel event from client components.
 * Use this after form submissions, button clicks, etc.
 */
export function trackFBEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", eventName, params);
  }
}
