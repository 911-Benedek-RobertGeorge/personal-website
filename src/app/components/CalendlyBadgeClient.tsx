"use client";
import { useEffect } from "react";

export default function CalendlyBadgeClient() {
  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      try {
        if (typeof window !== 'undefined') {
          const isMobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
          if (isMobile) return;
        }
        const calendly = (window as any).Calendly;
        if (calendly && typeof calendly.initBadgeWidget === "function") {
          calendly.initBadgeWidget({
            url: "https://calendly.com/benedek-robertgeorge/30min",
            text: "Schedule time with me",
            color: "#76007D",
            textColor: "#ffffff",
            branding: true,
          });
          return;
        }
      } catch {}
      setTimeout(start, 150);
    };
    start();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
