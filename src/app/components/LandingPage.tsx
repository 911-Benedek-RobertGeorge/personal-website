'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Database,

  ArrowRight,
  Code2,

  Linkedin,
  Server,
  Zap,
  CheckCircle2,
  Layers,
  Workflow,
  Search,
  Bot,
} from 'lucide-react';

import dynamic from "next/dynamic";
import Script from 'next/script';
import { FloatingNav } from "@/components/ui/floating-navbar";
import StagePanels from "./StagePanels";
import { useReveal } from "./useReveal";
import TiltCard from "./TiltCard";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

type YTPlayer = { playVideo?: () => void };
type YTNamespace = {
  Player: new (elementId: string, options: object) => YTPlayer;
  PlayerState: { PLAYING: number };
};
type YTWindow = Window & { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void };
type CalendlyWindow = Window & {
  Calendly?: { initPopupWidget?: (opts: { url: string }) => void };
};

const revealCls = (on: boolean) => `transition-all duration-700 ease-out ${on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`;

const Wordmark = ({ className = '' }: { className?: string }) => (
  <span className={`font-mono font-bold tracking-tight whitespace-nowrap select-none text-white ${className}`}>
    <span className="text-[#39B5C4]">›</span> benedek<span className="text-[#2AAF7F]">.sys</span>
    <span aria-hidden="true" className="inline-block w-[0.5em] h-[1em] ml-0.5 align-[-0.15em] bg-[#39B5C4] animate-pulse" />
  </span>
);

const App = () => {
  const [showInitialPopup, setShowInitialPopup] = useState(false);
  const [hasScrolledPast, setHasScrolledPast] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formGoal, setFormGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const credSectionRef = useRef<HTMLElement | null>(null);
  const [vslRevealRef, vslRevealed] = useReveal<HTMLDivElement>();
  const [credRevealRef, credRevealed] = useReveal<HTMLDivElement>();
  const [casesRevealRef, casesRevealed] = useReveal<HTMLDivElement>();
  const [servicesRevealRef, servicesRevealed] = useReveal<HTMLDivElement>();
  const [philosophyRevealRef, philosophyRevealed] = useReveal<HTMLDivElement>();
  const [bookingRevealRef, bookingRevealed] = useReveal<HTMLDivElement>();

  useEffect(() => {
    if (hasScrolledPast) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleScroll = () => {
      const el = credSectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Same trigger the robot stage rig uses: the section entering view.
      if (rect.top < window.innerHeight * 0.55 && rect.bottom > 0) {
        setShowInitialPopup(true);
        setHasScrolledPast(true);
        timer = setTimeout(() => setShowInitialPopup(false), 3000);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, [hasScrolledPast]);

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScheduleClick = () => {
    try {
      const calendly = (window as CalendlyWindow).Calendly;
      if (calendly && typeof calendly.initPopupWidget === 'function') {
        calendly.initPopupWidget({ url: 'https://calendly.com/benedek-robertgeorge/30min' });
        return;
      }
      window.open('https://calendly.com/benedek-robertgeorge/30min', '_blank');
    } catch {
      window.open('https://calendly.com/benedek-robertgeorge/30min', '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitMessage(null);
    if (!formName || !formEmail || !formPhone) {
      setSubmitMessage('Te rog completează nume, email și telefon.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, email: formEmail, phone: formPhone, goal: formGoal }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMessage('Solicitare înregistrată. Te voi contacta în curând.');
        setFormName('');
        setFormEmail('');
        setFormPhone('');
        setFormGoal('');
      } else {
        setSubmitMessage(data?.error || 'A apărut o problemă.');
      }
    } catch (err) {
      setSubmitMessage('Eroare de rețea. Te rog încearcă din nou.');
    } finally {
      setSubmitting(false);
    }
  };

  const [videoExpanded, setVideoExpanded] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const videoSrc = `https://www.youtube.com/embed/Co4FE_SGRtI?enablejsapi=1&autoplay=0&controls=1&rel=0&modestbranding=1&playsinline=1`;

  useEffect(() => {
    const createPlayer = () => {
      try {
        const YTObj = (window as YTWindow).YT;
        if (YTObj && YTObj.Player && !playerRef.current) {
          playerRef.current = new YTObj.Player('hero-vsl', {
            playerVars: {
              origin: window.location.origin,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
            },
            events: {
              onStateChange: (e: { data?: number }) => {
                const state = e?.data;
                if (state === YTObj.PlayerState.PLAYING) {
                  setVideoExpanded(true);
                }
              }
            }
          });
        }
      } catch { }
    };
    (window as YTWindow).onYouTubeIframeAPIReady = createPlayer;
    createPlayer();
  }, []);

  return (
    // overflow-x-clip (NOT -hidden): hidden computes overflow-y:auto, making this a scroll container that un-sticks the pinned stage.
    <div className="min-h-screen text-[#E5E7EB] font-sans selection:bg-[#76007D] selection:text-white overflow-x-clip bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#000045] via-[#000025] to-[#000010]">
      {/* Ambient & Noise */}
      <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] left-[12%] w-[700px] h-[700px] bg-[#76007D]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[10%] right-[8%] w-[600px] h-[600px] bg-[#1E94A5]/15 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[45%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-[#2AAF7F]/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* 3D Robot Stage Overlay */}
      <div className="fixed inset-0 z-[999] pointer-events-none">
        <Scene />
      </div>

      {/* <nav className={`absolute top-0 w-full z-40 bg-transparent mb-10 md:mb-0 ${videoExpanded ? 'pointer-events-none' : ''}`}>
         <div className="container mx-auto px-6 py-6 md:py-4 flex justify-between items-center">
          <div className="relative flex items-center font-sans tracking-tight">
            <div className="relative z-10 w-20 h-20 md:w-24 md:h-24">
              <img src="/logo.png" alt="B" className="w-full h-full object-contain object-center scale-110 md:scale-100" />
            </div>
            <div className="mt-10 md:mt-12 flex flex-col items-start select-none">
              <span className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/30 leading-none pb-1">
                enedek
              </span>
              <span className="block text-[0.65rem] md:text-[0.85rem] font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#39B5C4] to-[#76007D] tracking-[0.3em] md:tracking-[0.38em] ml-0.5 -mt-0.5 md:-mt-2 pr-1">
                SYSTEMS
              </span> */}
      {/* Navigation */}
      <FloatingNav
        brand={<Wordmark className="text-sm" />}
        navItems={[
          { name: "Abordare", link: "#philosophy" },
          { name: "Exemple", link: "#case-studies" },
          { name: "Servicii", link: "#services" },
          { name: "Despre mine", link: "https://www.linkedin.com/in/benedek-robert/" },
        ]}
        className="bg-[#000022] border-white/[0.1]"
        ctaLabel="Programează"
        ctaLink="#booking"
      />

      {/* Act 1 — The pinned robot stage */}
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      <StagePanels onPrimaryCta={handleScheduleClick} onSecondaryCta={scrollToBooking} />

      {/* Act 2 — VSL */}
      <section id="vsl" className="relative z-10 py-20 md:py-28 px-6">
        <div className="container mx-auto max-w-5xl">
          <div
            ref={vslRevealRef}
            // Revealed state must carry NO transform (scale-100 still sets one), or this div becomes the
            // containing block for the expanded video's `fixed inset-0` and collapses it to ~2px.
            className={`transition-all duration-700 ease-out ${vslRevealed ? 'opacity-100' : 'opacity-0 scale-[0.94]'}`}
          >
            <div className="relative">
              <div className="absolute -inset-10 bg-[#2AAF7F]/15 rounded-full blur-[110px] pointer-events-none" />
              <div className="absolute -inset-10 bg-[#76007D]/10 rounded-full blur-[130px] pointer-events-none" />
              <div className={`${videoExpanded ? 'fixed inset-0 z-[6000] rounded-none pointer-events-none' : 'relative z-0 rounded-2xl w-full'} group overflow-hidden bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10 transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] transform-gpu`}>
                <div className={`${videoExpanded ? 'w-full h-full' : 'w-full aspect-video'} transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]`}>
                  <iframe
                    title="VSL — Digitalizare & Automatizare"
                    className="w-full h-full pointer-events-auto"
                    id="hero-vsl"
                    src={videoSrc}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {!videoExpanded && (
                    <button
                      aria-label="Play"
                      onClick={() => {
                        setVideoExpanded(true);
                        setTimeout(() => {
                          try { playerRef.current?.playVideo?.(); } catch { }
                        }, 50);
                      }}
                      className="absolute inset-0 z-[100] md:hidden"
                    />
                  )}
                </div>
              </div>
              {videoExpanded && (
                <div className="fixed inset-0 z-[6500] pointer-events-none">
                  <button
                    onClick={() => setVideoExpanded(false)}
                    className="pointer-events-auto absolute top-16 right-4 bg-white/10 text-white text-xs px-3 py-1 rounded border border-white/20 cursor-pointer"
                  >
                    Închide
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* Credibility Frame - ENHANCED LINKEDIN WITH AVATAR POPUP */}
      <section ref={credSectionRef} className="relative z-10 border-y border-white/5 bg-[#39B5C4]/8 backdrop-blur-xl">
        <div ref={credRevealRef} className={`container mx-auto px-6 py-0 ${revealCls(credRevealed)}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Tech Cred */}
            <div className="flex items-center justify-center md:justify-start gap-4 py-8 md:pr-8">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <Code2 size={28} className="text-[#1E94A5]" />
              </div>
              <div className="text-sm">
                <div className="text-white font-bold text-lg">Backend Engineer</div>
                <div className="text-slate-400">Integrări AI în producție</div>
              </div>
            </div>

            {/* Experience */}
            <div className="flex items-center justify-center gap-4 py-8 md:px-8">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <Server size={28} className="text-[#76007D]" />
              </div>
              <div className="text-sm">
                <div className="text-white font-bold text-lg">Tokeny · Apex Group</div>
                <div className="text-slate-400">Integrare AI în echipa de dezvoltare</div>
              </div>
            </div>

            {/* LinkedIn Prominent + Avatar + Animated Popup */}
            <div className="relative group flex items-center justify-center md:justify-end py-6 md:pl-8">
              <div className={`${showInitialPopup ? 'opacity-100 translate-y-0 animate-bounce' : 'opacity-0 translate-y-4'} absolute top-2 right-12 md:right-32 z-20 pointer-events-none select-none transition-all duration-300 transform group-hover:opacity-100 group-hover:translate-y-0 group-hover:animate-none`}>
                <div className="bg-white text-[#0A2540] px-4 py-2 rounded-xl rounded-tr-none shadow-[0_0_15px_rgba(255,255,255,0.4)] border border-[#76007D]/30 flex items-center gap-2 text-xs font-bold whitespace-nowrap transform -rotate-2">
                  Hai să ne conectăm! 👋
                </div>
                <div className="absolute -bottom-1 right-0 w-3 h-3 bg-white transform rotate-45 border-b border-r border-[#76007D]/30 translate-x-[-10px]"></div>
              </div>

              <a
                href="https://www.linkedin.com/in/benedek-robert/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 hover:bg-[#0077b5]/10 p-2 rounded-xl transition-all cursor-pointer relative"
              >
                <div className="text-right block">
                  <div className="text-white font-bold text-lg group-hover:text-[#0077b5] transition-colors">Robert Benedek</div>
                  <div className="text-slate-400 flex items-center gap-1 justify-end text-sm">
                    Vezi Profilul <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-[#76007D] rounded-full blur-md opacity-40 group-hover:opacity-70 animate-pulse"></div>
                  <img
                    src="/portret.jpg"
                    alt="Robert Benedek"
                    className="relative w-16 h-16 rounded-full border-2 border-[#0077b5] object-cover shadow-2xl group-hover:scale-105 transition-transform duration-300 z-10 bg-[#000022]"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#0077b5] p-1.5 rounded-full border-2 border-[#000022] z-20 shadow-lg">
                    <Linkedin size={14} className="text-white" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Proof: real AI integration story */}
      <section id="philosophy" className="relative z-10 py-24 px-6 text-[#E5E7EB] font-sans selection:bg-[#76007D] selection:text-white overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#000045] via-[#000025] to-[#000010]">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div ref={philosophyRevealRef} className={`container mx-auto max-w-6xl relative z-10 ${revealCls(philosophyRevealed)}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/[0.15] bg-gradient-to-r from-[#76007D]/15 to-[#1E94A5]/15 shadow-[0_0_20px_rgba(118,0,125,0.15)] mb-6 group cursor-default">
                <Terminal size={14} className="text-[#1E94A5]" />
                <span className="text-sm font-semibold text-white/90 tracking-wide">Caz real, nu teorie</span>
                <span className="absolute inset-x-0 w-2/3 mx-auto -bottom-px bg-gradient-to-r from-transparent via-[#1E94A5] to-transparent h-px" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Nu îți vând povești.<br />
                Îți arăt <span className="text-[#0A2540] bg-white px-2 whitespace-nowrap">ce am construit.</span>
              </h2>
              <p className="text-blue-100 mb-8">
                La Tokeny (Apex Group), în ultimul an m-am ocupat de integrarea AI în echipa mea de dezvoltare. Metoda e simplă: găsești blocajul, îl automatizezi, treci la următorul.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 p-1 bg-[#0A2540] rounded text-white h-fit">
                    <Workflow size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Primele agent loops din echipă</h4>
                    <p className="text-blue-100">Un tichet intră, agenții AI scriu specificația, implementează codul și deschid un pull request gata de livrare. Spec-driven development, cap-coadă.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 p-1 bg-[#0A2540] rounded text-white h-fit">
                    <Search size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Următorul blocaj: QA-ul</h4>
                    <p className="text-blue-100">Când codul a început să vină mai repede, testarea a devenit punctul lent. Așa se întâmplă în orice proces: rezolvi un blocaj și apare următorul.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 p-1 bg-[#0A2540] rounded text-white h-fit">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Agenți autonomi care testează</h4>
                    <p className="text-blue-100">Am integrat agenți AI care apelează singuri endpoint-urile noi și le verifică. O bună parte din QA rulează acum automat.</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-5 rounded-xl border border-[#2AAF7F]/30 bg-[#2AAF7F]/10">
                <p className="text-white font-semibold">Orice companie are un astfel de blocaj. Rolul meu este să-l găsesc și să-l automatizez, ca să câștigi timp și bani și să te adaptezi la lumea cu AI.</p>
                <p className="mt-2 text-sm text-slate-400">Garanție „fără BS”: dacă sistemul nu aduce eficiență măsurabilă, îl rescriem.</p>
              </div>
            </div>

            <div className="relative p-8 rounded-2xl bg-[#39B5C4]/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(57,181,196,0.15)] hover:-translate-y-[2px] hover:shadow-[0_30px_80px_rgba(57,181,196,0.25)] border border-white/10">
              <div className="absolute top-0 left-0 right-0 mx-2 h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
              <div className="absolute -top-4 -right-8 bg-white text-[#0A2540] px-4 py-2 font-bold rounded shadow-lg transform rotate-12">
                TESTAT ÎN PRODUCȚIE
              </div>
              <div className="space-y-4 font-mono text-sm text-slate-300">
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span>AGENȚI:</span>
                  <span className="text-[#2AAF7F]">ACTIVI</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span>MOD:</span>
                  <span className="text-white">SPEC-DRIVEN</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span>QA:</span>
                  <span className="text-[#1E94A5]">AUTOMATIZAT</span>
                </div>
                <div className="p-4 bg-black/30 rounded mt-4">
                  <code className="block text-xs text-green-500 mb-1">$ agent-loop --ticket 142</code>
                  <code className="block text-xs text-slate-400">› specificație generată</code>
                  <code className="block text-xs text-slate-400">› cod și teste implementate</code>
                  <code className="block text-xs text-slate-400">› pull request deschis</code>
                  <code className="block text-xs text-green-500 mt-2 mb-1">$ qa-agents --test endpoints</code>
                  <code className="block text-xs text-slate-400">› endpoint-uri noi verificate</code>
                  <code className="block text-xs text-green-500 mt-2">Gata. Blocaj eliminat.</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficii tangibile → Flow Boost Benefits */}
      {/* <section className="relative z-10 py-16 px-6 bg-[#39B5C4]/8 backdrop-blur-xl border-y border-white/5">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ce primești când instalezi un „Sistem Flow Boost”?</h2>
          <p className="mt-4 text-slate-300">Nu cumpăra „servicii”. Cumpără rezultate și liniște.</p>
          <div className="mt-6 grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#1E94A5]" size={20} />
              <p className="text-slate-300"><span className="font-semibold">Timp Câștigat:</span> Scapi de sarcinile repetitive. AI-ul răspunde la întrebări frecvente, face programări și trimite oferte. Tu te ocupi de business, nu de secretariat.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#1E94A5]" size={20} />
              <p className="text-slate-300"><span className="font-semibold">Marketing Automatizat (Sistematic):</span> Nu facem doar „reclame”. Creăm sisteme care urmăresc clientul automat până cumpără. Dacă un client nu a venit de 3 luni, sistemul îl reactivează singur.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#1E94A5]" size={20} />
              <p className="text-slate-300"><span className="font-semibold">Ordine și Control:</span> Treci de la haos la un panou de control digital (CRM). Vezi exact câți clienți ai, cine a plătit și cine trebuie sunat.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#1E94A5]" size={20} />
              <p className="text-slate-300"><span className="font-semibold">Avantaj Competitiv:</span> În timp ce concurenții tăi dorm, sistemul tău lucrează 24/7.</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Case Studies → Use Cases */}
      <section id="case-studies" className="relative z-10 py-24 px-6 bg-[#39B5C4]/8 backdrop-blur-xl">
        <div className="container mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2AAF7F]/30 bg-[#2AAF7F]/10 text-[#2AAF7F] text-xs font-mono uppercase tracking-widest mb-4">Exemple de aplicare</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Cum arată AI-ul aplicat în afacerea ta</h2>
          <p className="mt-4 text-slate-300">Trei scenarii în care AI-ul poate aduce bani înapoi:</p>
          <div ref={casesRevealRef} className={`mt-6 grid sm:grid-cols-3 gap-6 ${revealCls(casesRevealed)}`}>
            <div className="relative p-6 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10">
              <div className="absolute top-0 left-0 right-0 mx-2  h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
              <h3 className="text-white font-semibold">„Mina de Aur Abandonată”</h3>
              <p className="text-slate-400 text-sm">Reactivarea bazei de date</p>
              <p className="mt-3 text-slate-300">Ai sute de numere vechi și nu ai timp să le suni. Un sistem AI le trimite mesaje personalizate, ca să readuci clienți vechi fără să plătești reclame.</p>
            </div>
            <div className="relative p-6 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10">
              <div className="absolute top-0 left-0 right-0 mx-2  h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
              <h3 className="text-white font-semibold">„Secretara Virtuală care nu doarme”</h3>
              <p className="text-slate-400 text-sm">Asistent AI 24/7</p>
              <p className="mt-3 text-slate-300">Pierzi clienți pentru că nu răspunzi în weekend/seara. Asistentul AI răspunde la întrebări și face programarea direct în calendarul tău.</p>            </div>
            <div className="relative p-6 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10">
              <div className="absolute top-0 left-0 right-0 mx-2  h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
              <h3 className="text-white font-semibold">„Marketingul care nu uită”</h3>
              <p className="text-slate-400 text-sm">Nurturing automat</p>
              <p className="mt-3 text-slate-300">Plătești reclame, oamenii intră pe site, dar nu cumpără. Sistemul trimite mail/SMS util timp de 2 săptămâni până când sunt gata să cumpere.</p>            </div>
          </div>
        </div>
      </section>



      {/* Final CTA */}
      {/* <section className="relative z-10 py-16 px-6 bg-[#39B5C4]/8 backdrop-blur-xl border-y border-white/5">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Nu mai lăsa încă o lună să treacă în haos.</h2>
          <p className="mt-4 text-slate-300">Tehnologia nu așteaptă pe nimeni. Dacă vrei să vezi cum AI-ul și automatizările pot fi aplicate specific în business-ul tău, hai să vorbim.</p>
          <p className="mt-2 text-slate-400">Nu este un apel de vânzare. Este o Sesiune de Descoperire Strategică. Analizăm ce faci acum și îți spun onest dacă te pot ajuta să digitalizezi.</p>
          <p className="mt-2 text-slate-400">Notă: Lucrez singur la implementare, așa că pot prelua un număr limitat de proiecte pe lună.</p>
          <div className="mt-8">
            <button
              onClick={scrollToBooking}
              className="group relative h-16 w-full sm:w-80 md:w-[32rem] mx-auto bg-[#000022]/60 border-2 border-[#39B5C4] text-white text-base font-bold rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:border-[#2AAF7F] hover:text-[#2AAF7F] px-6 text-center before:absolute before:w-10 before:h-10 before:content-[''] before:right-2 before:top-2 before:z-10 before:bg-[#76007D] before:rounded-full before:blur-lg before:transition-all before:duration-500 after:absolute after:z-10 after:w-16 after:h-16 after:content-[''] after:bg-[#39B5C4] after:right-6 after:top-4 after:rounded-full after:blur-lg after:transition-all after:duration-500 hover:before:right-10 hover:before:-bottom-4 hover:after:-right-6 hover:after:scale-110"
            >
              PROGRAMEAZĂ SESIUNEA DE DESCOPERIRE (30 MIN)
            </button>
          </div>
        </div>
      </section> */}

      {/* Services Section */}
      <section id="services" className="relative z-10 py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 sticky top-32">
                Ce construiesc pentru tine
                <div className="w-20 h-1 bg-[#76007D] mt-4 rounded-full"></div>
              </h2>
            </div>

            <div ref={servicesRevealRef} className={`lg:col-span-2 space-y-6 ${revealCls(servicesRevealed)}`}>
              {/* Service 1 */}
              <TiltCard>
              <div className="relative p-8 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#76007D]/10 rounded-lg text-[#76007D]">
                    <Code2 size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Dezvoltare Web AI-Driven</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Nu doar un site de prezentare, ci o mașinărie de conversie. Construiesc platforme custom cu sisteme integrate de captare a lead-urilor și CRM, optimizate pentru viteză și UX.
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Arhitectură React/Next.js</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Integrări API Native</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Dashboard Admin Custom</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Securitate Enterprise</li>
                </ul>
              </div>
              </TiltCard>

              {/* Service 2 */}
              <TiltCard>
              <div className="relative p-8 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#76007D]/10 rounded-lg text-[#76007D]">
                    <Zap size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white">SEO & Optimizare Automată</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Audit tehnic profund și implementare automată. Sistemele mele monitorizează constant performanța, ajustează meta-datele și optimizează conținutul pentru a domina rezultatele de căutare.
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Audit Tehnic Automat</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Schema Markup Dinamic</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Optimizare Viteză Core Web Vitals</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Rapoarte KPI Automate</li>
                </ul>
              </div>
              </TiltCard>

              {/* Service 3 */}
              <TiltCard>
              <div className="relative p-8 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#76007D]/10 rounded-lg text-[#76007D]">
                    <Database size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Reactivare Baze de Date & CRM</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Transformă listele de contacte „moarte” în venituri. Configurez sisteme care scanează baza de date, segmentează clienții și inițiază conversații personalizate prin AI pentru a-i readuce în pipeline.
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Lead Scoring Automat</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Campanii de Reactivare AI</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Integrare CRM Bidirecțională</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Curățare Date Automată</li>
                </ul>
              </div>
              </TiltCard>

              {/* Service 4 - CUSTOM PERSONALIZED (Premium Cyan Neon) */}
              <TiltCard>
              <div className="relative p-8 rounded-2xl bg-[#00FFFF]/8 backdrop-blur-xl border border-[#00FFFF]/25   transition-all overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#00FFFF] via-[#39B5C4] to-[#00FFFF] opacity-80"></div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#00FFFF] via-[#39B5C4] to-[#00FFFF] opacity-60"></div>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-10 -left-14 w-[260px] h-[260px] bg-gradient-to-br from-white/15 to-transparent rounded-full blur-3xl opacity-20"></div>
                  <div className="absolute -bottom-12 -right-16 w-[300px] h-[300px] bg-gradient-to-tr from-[#00FFFF]/15 to-transparent rounded-full blur-3xl opacity-20"></div>
                </div>
                <div className="absolute top-0 right-0 p-2 bg-[#00FFFF]/10 text-[#00FFFF] text-xs font-bold rounded-bl-lg border-b border-l border-[#00FFFF]/25">
                  PREMIUM
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#00FFFF]/10 border border-[#00FFFF]/25 rounded-lg text-[#00FFFF]">
                    <Layers size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Integrare AI Custom & Audit</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Analizez procesele afacerii tale, găsesc blocajul care te costă cel mai mult și integrez agenți AI exact acolo. Aceeași metodă pe care o folosesc în echipa mea, adaptată <span className="text-[#39B5C4] font-semibold">100% modelului tău</span>.
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00FFFF]" /> Audit de procese 1-la-1</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00FFFF]" /> Agenți AI construiți pe măsură</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00FFFF]" /> Integrare cu sistemele existente</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00FFFF]" /> Rezultate măsurabile</li>
                </ul>
                <div className="mt-6 items-center justify-center pt-4  border-t border-white/10">
                  <button
                    onClick={scrollToBooking}
                    className="w-full inline-flex h-12 animate-shimmer items-center justify-center rounded-xl border border-[#00FFFF]/25 bg-[linear-gradient(110deg,#000022,45%,#39B5C4,55%,#000022)] bg-[length:200%_100%] px-6 font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E94A5] focus:ring-offset-2 focus:ring-offset-[#000022]"
                  >
                    Cere Ofertă Personalizată <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
              </TiltCard>

            </div>
          </div>
        </div>
      </section>

      {/* Calendly / Booking Section */}
      <section id="booking" className="relative z-10 py-24 px-6">
        <div ref={bookingRevealRef} className={`container mx-auto max-w-4xl text-center ${revealCls(bookingRevealed)}`}>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Discutăm Sisteme, Nu Strategii</h2>
          <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
            Aceasta nu este o convorbire de vânzări. Este o evaluare tehnică a fluxului tău de lucru: găsim împreună blocajul și îți arăt unde AI-ul aduce cei mai mulți bani.
          </p>
          <div className="relative bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(57,181,196,0.20)] w-full p-8 text-left">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="md:col-span-1">
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">Nume</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E94A5]" placeholder="Numele tău" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">Email</label>
                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E94A5]" placeholder="nume@exemplu.ro" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">Telefon</label>
                <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E94A5]" placeholder="+40 7xx xxx xxx" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">Ce ai vrea să îmbunătățești? (opțional)</label>
                <textarea value={formGoal} onChange={(e) => setFormGoal(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 h-28 resize-y text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E94A5]" placeholder="Descrie pe scurt" />
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 items-center">
                <button
                  type="submit" disabled={submitting}
                  className="relative inline-flex h-10 w-32 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-[#1E94A5] focus:ring-offset-2 focus:ring-offset-[#000022]"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00FFFF_0%,#76007D_50%,#39B5C4_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[#000022] px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                    {submitting ? 'Se trimite...' : 'Trimite cererea'}
                  </span>
                </button>

                {/* <button type="button" onClick={handleScheduleClick} className="border border-[#1E94A5] text-[#1E94A5] rounded px-4 py-2 hover:shadow-[0_0_22px_rgba(30,148,165,0.35)] font-semibold flex items-center gap-2">
                  <Calendar size={20} className="text-[#1E94A5]" />
                  Programează prin Calendly
                </button> */}
              </div>
              {submitMessage && <p className="md:col-span-2 text-sm text-slate-300 mt-2">{submitMessage}</p>}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hidden md:block bg-[#051321] text-slate-500 py-4 border-t border-white/5 relative z-10 text-sm">
        <div className="container flex-row mx-auto px-6 text-center">
          <div className='flex text-center items-center justify-center gap-4'>
            <Wordmark className="text-xl mb-4" />
            <div className="flex justify-center  gap-4 mb-4">
              <a href="https://www.linkedin.com/in/benedek-robert/" className="text-[#0077b5] hover:text-white transition-colors">LinkedIn</a>
              <a href="mailto:benedek.robertgeorge@gmail.com" className="hover:text-white transition-colors">Email</a>
            </div>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Benedek Systems. Built by an Engineer.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
