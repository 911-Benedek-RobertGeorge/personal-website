"use client";
import { useEffect } from "react";

export default function CalendlyBadgeClient() {
  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      try {
        const calendly = (window as any).Calendly;
        if (calendly && typeof calendly.initBadgeWidget === "function") {
          calendly.initBadgeWidget({
            url: "https://calendly.com/benedek-robertgeorge/30min",
            text: "Schedule time with me",
            color: "#973CFF",
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