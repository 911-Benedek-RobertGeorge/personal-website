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
    // Folosește tema existentă (dark) + accente verzi pentru success
    bg: "bg-black",
    card: "bg-[#0B0B0F]",
    text: "text-gray-200",
    muted: "text-gray-400",
    border: "border-gray-800",
    accentGreen: "#22c55e", // Tailwind emerald-500
    accentPrimary: "#973CFF", // site accent existent
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
      <header className="sr-only">Pagina Thank You cu VSL</header>
      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
        {/* HERO SECTION */}
        <section aria-labelledby="video-vsl" className="space-y-6">
          {/* Responsive 16:9 Video */}
          <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden border border-gray-800">
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
              className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-emerald-600/50 bg-emerald-600/20 shadow-sm transition transform ${
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
                className="text-emerald-400 w-5 h-5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <div>
              <h1 id="video-vsl" className="text-2xl sm:text-3xl font-semibold">
                {config.copy.heroTitle}
              </h1>
              <p className="text-gray-400 mt-1">{config.copy.heroSubtitle}</p>
            </div>
          </div>

          {/* Urgency Badge */}
          <div
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full bg-[#17171D] border border-gray-800 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <span className="text-orange-400">🔥</span>
            <span className="text-gray-300">{config.copy.urgency}</span>
          </div>
        </section>

        {/* CONTENT SECTIONS */}
        {/* A. Timeline Section */}
        <section className="mt-10" aria-labelledby="timeline-title">
          <h2 id="timeline-title" className="text-xl font-semibold">
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
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="flex-1 w-px bg-emerald-700/50" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">În următoarele 2 minute</h3>
                <p className="text-gray-400">
                  Vei primi email de confirmare + invitație calendar
                </p>
              </div>
            </div>
            {/* Item 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="flex-1 w-px bg-emerald-700/50" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Cu 24h înainte</h3>
                <p className="text-gray-400">
                  Reminder automat cu link-ul de meeting
                </p>
              </div>
            </div>
            {/* Item 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">La întâlnire (30 min)</h3>
                <p className="text-gray-400">
                  Identificăm blocajele și construim planul de acțiune
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* B. Social Proof Card */}
        <section className="mt-12" aria-labelledby="social-proof">
          <div
            className="rounded-xl p-6 border border-gray-800 bg-gradient-to-br from-[#141424] via-[#131324] to-[#0E0E14] shadow-lg transition hover:shadow-xl"
          >
            <h2 id="social-proof" className="sr-only">
              Social Proof
            </h2>
            <div className="flex items-end gap-4">
              <div className="text-4xl sm:text-5xl font-bold text-white">
                {config.copy.socialProofStat}
              </div>
              <p className="text-gray-400 flex-1">
                {config.copy.socialProofDesc}
              </p>
            </div>
          </div>
        </section>

        {/* C. Deliverables Box */}
        <section className="mt-12" aria-labelledby="deliverables-title">
          <h2 id="deliverables-title" className="text-xl font-semibold">
            {config.copy.deliverablesTitle}
          </h2>
          <div className={`mt-4 rounded-xl p-6 border ${config.theme.border} ${config.theme.card}`}>
            <h3 className="font-semibold mb-4">
              {config.copy.deliverablesHeader}
            </h3>
            <ul className="space-y-3">
              {config.copy.deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-3 h-3 rounded-full bg-emerald-500" aria-hidden="true" />
                  <p className="text-gray-300">
                    {/* Highlight bold parts */}
                    <span className="font-semibold">
                      {item.split(":")[0]}
                    </span>
                    <span>: {item.split(":")[1]}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* D. Bonus Section */}
        <section className="mt-12" aria-labelledby="bonus-title">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-700/30">
            {config.copy.bonusTag}
          </div>
          <h2 id="bonus-title" className="sr-only">Bonus</h2>
          <p className="text-gray-400 mt-4">{config.copy.bonusIntro}</p>
          <ul className="mt-4 space-y-2">
            {config.copy.bonusItems.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400" aria-hidden="true">✓</span>
                <span className="text-gray-300">{b.replace(/^✓\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* E. CTA Button */}
        <section className="mt-12" aria-labelledby="cta-title">
          <h2 id="cta-title" className="sr-only">Acțiune principală</h2>
          <a
            href={config.cta.href}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-5 py-3 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black"
          >
            <span aria-hidden="true">📥</span>
            <span>{config.copy.ctaText}</span>
          </a>
        </section>

        {/* F. Footer Note */}
        <footer className="mt-10 text-sm text-gray-500">
          <p>{config.copy.footerLine1}</p>
          <p className="mt-1">{config.copy.footerLine2}</p>
        </footer>
      </main>
    </div>
  );
}