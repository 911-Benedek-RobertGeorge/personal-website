"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Mini README / Config
 * - Pentru a schimba VIDEO:
 *   - Setează config.video.provider: "youtube" sau "vimeo"
 *   - Setează config.video.id cu ID-ul clipului
 * - Pentru a edita textele principale: actualizează câmpurile din config.copy
 * - Pentru a modifica link-ul CTA: setează config.cta.href
 */

const config = {
  theme: {
    bg: "bg-[#020617]",
    card: "bg-white/[0.03] backdrop-blur-xl",
    text: "text-gray-200",
    muted: "text-slate-400",
    border: "border-white/10",
    accentGreen: "#F59E0B", // Amber glow for success & primary accents
    accentPrimary: "#D946EF", // Electric magenta for secondary/system accents
  },
  video: {
    provider: "youtube" as "youtube" | "vimeo",
    id: "dQw4w9WgXcQ", // exemplu
    title: "Video VSL – Thank You",
    autoplay: 0,
    controls: 1,
    rel: 0, // YouTube
    vimeoTitle: 0,
    vimeoByline: 0,
    overlayPlayButton: false, // buton overlay de play (opțional)
  },
  copy: {
    heroTitle: "Rezervarea Ta Este Confirmată",
    heroSubtitle: "Ai făcut alegerea corectă. Pregătește-te pentru claritate.",
    urgency: "🔥 Doar 2 sloturi rămase săptămâna aceasta",
    timelineTitle: "📅 Ce Se Întâmplă Acum",
    socialProofStat: "6.3 ore",
    socialProofDesc:
      "Timpul mediu recuperat săptămânal de companiile cu care am lucrat luna aceasta",
    deliverablesTitle: "🎯 Ce Vei Primi în 30 de minute",
    deliverablesHeader: "Livrabile Concrete (Nu Teorie)",
    deliverables: [
      "**Harta Costurilor Ascunse:** Vizualizare clară a unde pierzi timp și bani în procesele actuale",
      "**3 Automatizări Acționabile:** Soluții specifice pe care le poți implementa imediat (chiar dacă nu lucrezi cu mine)",
      "**Estimare ROI:** Calcul transparent: cât timp/bani recuperezi vs cât costă implementarea",
    ],
    bonusTag: "BONUS - Vrei Să Maximizezi Valoarea?",
    bonusIntro:
      "Dacă ai pregătite acestea, mergem direct la soluții (nu e obligatoriu):",
    bonusItems: [
      "✓ Un proces/flux de lucru care te deranjează (chiar și o descriere verbală)",
      "✓ 2-3 probleme concrete care îți costă cel mai mult timp",
      "✓ Opțional: Access la un sistem pe care vrei să-l discutăm (CRM, Excel, etc.)",
    ],
    ctaText: "📥 Descarcă Checklist-ul de Pre-Audit (2 min)",
    footerLine1: "Ai întrebări? Răspunde direct la emailul de confirmare.",
    footerLine2:
      "Trebuie să reprogramezi? Folosește link-ul din calendar fără probleme.",
  },
  cta: {
    href: "#", // înlocuiește cu link-ul tău (ex: /files/checklist.pdf)
  },
};

function buildVideoSrc() {
  const { provider, id, autoplay, controls, rel, vimeoTitle, vimeoByline } =
    config.video;
  if (provider === "youtube") {
    return `https://www.youtube.com/embed/${id}?autoplay=${autoplay}&controls=${controls}&rel=${rel}`;
  }
  return `https://player.vimeo.com/video/${id}?autoplay=${autoplay}&title=${vimeoTitle}&byline=${vimeoByline}`;
}

export default function ThankYouPage() {
  const [checkVisible, setCheckVisible] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineVisible, setTimelineVisible] = useState(false);

  useEffect(() => {
    // Checkmark scale-in on mount
    const t = setTimeout(() => setCheckVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Fade-in on scroll for Timeline
    const el = timelineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setTimelineVisible(true);
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const videoSrc = useMemo(() => buildVideoSrc(), []);

  return (
    <div lang="ro" className={`${config.theme.bg} ${config.theme.text}`}>
      {/* System Dashboard Container */}
      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
        <div className="rounded-2xl p-6 sm:p-8 border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_0_50px_rgba(217,70,239,0.15)]">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#020617]/60 border border-[#D946EF]/30 text-[#D946EF] mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D946EF] shadow-[0_0_10px_rgba(217,70,239,0.8)]" aria-hidden="true" />
            <span>Anti‑Marketer / Backend Engineer</span>
          </div>

          {/* HERO SECTION */}
          <section aria-labelledby="video-vsl" className="space-y-6">
            {/* Responsive 16:9 Video */}
            <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(245,158,11,0.20)]">
              {config.video.overlayPlayButton && (
                <button
                  aria-label="Pornește video"
                  className="absolute inset-0 z-10 grid place-items-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/90 text-black shadow-lg hover:scale-105 transition-transform">▶</span>
                </button>
              )}
              <iframe
                title={config.video.title}
                src={videoSrc}
                className="absolute inset-0 w-full h-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Confirmation + Checkmark */}
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-amber-500/40 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.25)] transition transform ${
                  checkVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
                style={{ boxShadow: `0 0 0 3px ${config.theme.accentGreen}20` }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-amber-400 w-5 h-5"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <div>
                <h1 id="video-vsl" className="text-2xl sm:text-3xl font-semibold text-white">
                  {config.copy.heroTitle}
                </h1>
                <p className="text-slate-400 mt-1">{config.copy.heroSubtitle}</p>
              </div>
            </div>

            {/* Urgency Badge */}
            <div
              className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(245,158,11,0.20)]"
              role="status"
              aria-live="polite"
            >
              <span className="text-amber-400">🔥</span>
              <span className="text-slate-300">{config.copy.urgency}</span>
            </div>
          </section>

          {/* CONTENT SECTIONS */}
          {/* A. Timeline Section */}
          <section className="mt-10" aria-labelledby="timeline-title">
            <h2 id="timeline-title" className="text-xl font-semibold text-white">
              {config.copy.timelineTitle}
            </h2>
            <div
              ref={timelineRef}
              className={`mt-6 space-y-6 transition-all ${
                timelineVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {/* Item 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="flex-1 w-px bg-amber-500/30" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">În următoarele 2 minute</h3>
                  <p className="text-slate-400">
                    Vei primi email de confirmare + invitație calendar
                  </p>
                </div>
              </div>
              {/* Item 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="flex-1 w-px bg-amber-500/30" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Cu 24h înainte</h3>
                  <p className="text-slate-400">
                    Reminder automat cu link-ul de meeting
                  </p>
                </div>
              </div>
              {/* Item 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">La întâlnire (30 min)</h3>
                  <p className="text-slate-400">
                    Identificăm blocajele și construim planul de acțiune
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* B. Social Proof Card */}
          <section className="mt-12" aria-labelledby="social-proof">
            <div className="rounded-xl p-6 border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_0_30px_rgba(217,70,239,0.18)]">
              <h2 id="social-proof" className="sr-only">
                Social Proof
              </h2>
              <div className="flex items-end gap-4">
                <div className="text-4xl sm:text-5xl font-bold text-white">
                  {config.copy.socialProofStat}
                </div>
                <p className="text-slate-400 flex-1">
                  {config.copy.socialProofDesc}
                </p>
              </div>
            </div>
          </section>

          {/* C. Deliverables Box */}
          <section className="mt-12" aria-labelledby="deliverables-title">
            <h2 id="deliverables-title" className="text-xl font-semibold text-white">
              {config.copy.deliverablesTitle}
            </h2>
            <div className={`mt-4 rounded-xl p-6 border ${config.theme.border} ${config.theme.card} shadow-[0_0_30px_rgba(217,70,239,0.15)]`}>
              <h3 className="font-semibold mb-4 text-white">
                {config.copy.deliverablesHeader}
              </h3>
              <ul className="space-y-3">
                {config.copy.deliverables.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 w-3 h-3 rounded-full bg-amber-500" aria-hidden="true" />
                    <p className="text-slate-300">
                      <span className="font-semibold text-white">
                        {item.split(":")[0]}
                      </span>
                      <span className="text-slate-400">: {item.split(":")[1]}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* D. Bonus Section */}
          <section className="mt-12" aria-labelledby="bonus-title">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {config.copy.bonusTag}
            </div>
            <h2 id="bonus-title" className="sr-only">Bonus</h2>
            <p className="text-slate-400 mt-4">{config.copy.bonusIntro}</p>
            <ul className="mt-4 space-y-2">
              {config.copy.bonusItems.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400" aria-hidden="true">✓</span>
                  <span className="text-slate-300">{b.replace(/^✓\s*/, "")}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* E. CTA Button */}
          <section className="mt-12" aria-labelledby="cta-title">
            <h2 id="cta-title" className="sr-only">Acțiune principală</h2>
            <a
              href={config.cta.href}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-3 font-medium shadow-[0_0_35px_rgba(245,158,11,0.35)] hover:shadow-[0_0_45px_rgba(245,158,11,0.45)] hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#020617]"
            >
              <span aria-hidden="true">📥</span>
              <span>{config.copy.ctaText}</span>
            </a>
          </section>

          {/* F. Footer Note */}
          <footer className="mt-10 text-sm text-slate-500">
            <p>{config.copy.footerLine1}</p>
            <p className="mt-1">{config.copy.footerLine2}</p>
          </footer>
        </div>
      </main>
    </div>
  );
}