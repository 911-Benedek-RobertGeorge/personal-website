'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
   Terminal, 
  Database, 
 
  ArrowRight, 
  Code2, 
  ShieldCheck, 
 
  Linkedin,
  Server,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
 } from 'lucide-react';

import dynamic from "next/dynamic";
import Script from 'next/script';
import { FloatingNav } from "@/components/ui/floating-navbar";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

const App = () => {
  const [showInitialPopup, setShowInitialPopup] = useState(false);
  const [hasScrolledPast, setHasScrolledPast] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formGoal, setFormGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600 && !hasScrolledPast) {
        setShowInitialPopup(true);
        setHasScrolledPast(true);

        const timer = setTimeout(() => {
          setShowInitialPopup(false);
        }, 3000);

        return () => clearTimeout(timer);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolledPast]);

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScheduleClick = () => {
    try {
      // @ts-ignore
      if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
        // @ts-ignore
        window.Calendly.initPopupWidget({ url: 'https://calendly.com/benedek-robertgeorge/30min' });
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
  const playerRef = useRef<any>(null);
  const videoSrc = `https://www.youtube.com/embed/Co4FE_SGRtI?enablejsapi=1&autoplay=0&controls=1&rel=0&modestbranding=1&playsinline=1`;

  useEffect(() => {
    const createPlayer = () => {
      try {
        const YTObj = (window as any).YT;
        if (YTObj && YTObj.Player && !playerRef.current) {
          playerRef.current = new YTObj.Player('hero-vsl', {
            playerVars: {
              origin: window.location.origin,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
            },
            events: {
              onStateChange: (e: any) => {
                const state = e?.data;
                if (state === YTObj.PlayerState.PLAYING) {
                  setVideoExpanded(true);
                }
              }
            }
          });
        }
      } catch {}
    };
    (window as any).onYouTubeIframeAPIReady = createPlayer;
    createPlayer();
  }, []);

  return (
    <div className="min-h-screen text-[#E5E7EB] font-sans selection:bg-[#76007D] selection:text-white overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#000045] via-[#000025] to-[#000010]">
      {/* Ambient & Noise */}
      <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] left-[12%] w-[700px] h-[700px] bg-[#76007D]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[10%] right-[8%] w-[600px] h-[600px] bg-[#1E94A5]/15 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[45%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-[#2AAF7F]/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* 3D Robot Background Canvas */}
      <div className="fixed left-0 bottom-0 sm:bottom-auto sm:top-0 h-[50vh] sm:h-screen w-[28vw] sm:w-[32vw] md:w-[40vw] z-[999] pointer-events-none overflow-visible">
        <Scene />
      </div>

      <nav className={`fixed top-0 w-full z-40 bg-transparent ${videoExpanded ? 'pointer-events-none' : ''}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="relative flex items-center gap-2 font-mono text-xl font-bold tracking-tighter text-white">
            <div className="absolute -inset-3 rounded-xl bg-[#000022]/50 backdrop-blur-md blur-md pointer-events-none" />
            <Terminal className="relative z-10 text-[#76007D]" size={24} />
            <span className="relative z-10">BENEDEK<span className="text-[#76007D]">.SYS</span></span>
          </div>
          {/* <button
            onClick={scrollToBooking}
            className="relative inline-flex h-10 w-32 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-[#1E94A5] focus:ring-offset-2 focus:ring-offset-[#000022]"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00FFFF_0%,#76007D_50%,#39B5C4_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[#000022] px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              Audit Tehnic
            </span>
          </button> */}
        </div>
      </nav>

      {/* Navigation */}
      <FloatingNav
        navItems={[
          { name: "Studii de Caz", link: "#case-studies" },
          { name: "Servicii", link: "#services" },
          { name: "Abordare", link: "#philosophy" },
          { name: "Despre mine", link: "https://www.linkedin.com/in/benedek-robert/" },
        ]}
        className={`bg-[#000022] dark:bg-[#000022] dark:border-white/[0.2] border-white/[0.1]`}
        ctaLabel="Programează"
        ctaLink="#booking"
      />

      {/* Hero Section with VSL */}
      <section className="relative z-10 border-y border-white/10 bg-[#39B5C4]/5 backdrop-blur-xl overflow-hidden md:min-h-[600px] lg:min-h-[700px]">
        <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
        
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[460px] h-[460px] bg-gradient-to-br from-[#76007D]/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-16 right-[10%] w-[520px] h-[520px] bg-gradient-to-tr from-[#2AAF7F]/18 to-transparent rounded-full blur-[120px]" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
        </div>
        <div className="container mx-auto max-w-7xl px-6 pt-20 md:pt-24 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Value Proposition */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#1E94A5] text-xs font-mono uppercase tracking-wider mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E94A5] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E94A5]"></span>
                </span>
                SISTEM DE AUTOMATIZARE
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight">
                Motorul de Clienți Noi
              </h1>
              <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-white max-w-3xl">
                Nu doar gestionez haosul. Îl <br></br> <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#39B5C4] to-[#2AAF7F]">transform în profit</span> 
              </h2>
              <p className="mt-4 text-slate-300 text-lg max-w-2xl">
                Îți construiesc infrastructura digitală
              </p>
                 <div className="mt-8 mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#2AAF7F] font-bold text-xs font-mono uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2AAF7F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2AAF7F]"></span>
                </span>
                Nu lăsa lead-uri să scape
              </div>
              <button 
                onClick={handleScheduleClick}
                className="group relative text-left h-16 w-full sm:w-64 bg-[#000022]/40 border-2 border-[#76007D] text-[#76007D] text-base font-semibold rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:border-[#39B5C4] hover:text-[#39B5C4] px-6 flex items-center justify-start gap-2 before:absolute before:w-8 before:h-8 before:content-[''] before:right-2 before:top-2 before:z-10 before:bg-[#76007D] before:rounded-full before:blur before:transition-all before:duration-500 after:absolute after:z-10 after:w-12 after:h-12 after:content-[''] after:bg-[#39B5C4] after:right-6 after:top-4 after:rounded-full after:blur after:transition-all after:duration-500 hover:before:right-10 hover:before:-bottom-4 hover:after:-right-6 hover:after:scale-110"
              >
                <Calendar size={20} className="text-current" />
                Activează Sistemul
              </button>
            </div>
            {/* Right: VSL Video */}
            <div className="relative">
              <div className="absolute -z-10 inset-0 -top-8 w-[560px] h-[560px] mx-auto lg:mx-0 lg:left-auto lg:right-0 bg-[#2AAF7F]/20 rounded-full blur-[100px]" />
              <div className={`${videoExpanded ? 'fixed inset-0 z-[6000] rounded-none' : 'relative z-0 rounded-2xl origin-center w-full md:scale-[1.10] lg:scale-[1.14] md:max-w-[900px] lg:max-w-[1100px] ml-auto'} group overflow-hidden bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10 shadow-none transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] transform-gpu`}>
                <div className={`${videoExpanded ? 'w-full h-full' : 'w-full h-[260px] sm:h-[280px] md:h-[340px] lg:h-[400px]'} transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]`}>
                  <iframe
                    title="VSL — Digitalizare & Automatizare"
                    className="w-full h-full"
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
                          try { playerRef.current?.playVideo?.(); } catch {}
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
                    Close
                  </button>
                </div>
              )}
           
            </div>
            {/* CTA after Video */}
            
           
          </div>
        </div>
      </section>


      {/* Credibility Frame - ENHANCED LINKEDIN WITH AVATAR POPUP */}
      <section className="relative z-10 border-y border-white/5 bg-[#39B5C4]/8 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Tech Cred */}
            <div className="flex items-center justify-center md:justify-start gap-4 py-8 md:pr-8">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <Code2 size={28} className="text-[#1E94A5]" />
              </div>
              <div className="text-sm">
                <div className="text-white font-bold text-lg">Backend Engineer</div>
                <div className="text-slate-400">Arhitectură de Sistem</div>
              </div>
            </div>

            {/* Experience */}
            <div className="flex items-center justify-center gap-4 py-8 md:px-8">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <Server size={28} className="text-[#76007D]" />
              </div>
              <div className="text-sm">
                <div className="text-white font-bold text-lg">Itheum + Tokeny</div>
                <div className="text-slate-400">3 Ani+ în mediu startup</div>
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
                     Vezi Profilul <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
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

      {/* Problemă + haos actual → Reality Check */}
      <section className="relative z-10 py-16 px-6 bg-[#39B5C4]/8 backdrop-blur-xl border-y border-white/5">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Dacă nu folosești AI-ul pentru a fi mai productiv, lași bani pe masă.</h2>
          <p className="mt-4 text-slate-300">Poate crezi că „Inteligența Artificială” este doar un termen de marketing. Sau poate știi că ar putea ajuta, dar nu ai nicio idee de unde să începi.</p>
          <p className="mt-2 text-slate-400">Adevărul este că, dacă business-ul tău încă se bazează pe:</p>
          <ul className="mt-6 space-y-3">
            <li className="flex items-start gap-3 text-slate-300"><span className="text-red-500">❌</span>Agende fizice și post-it-uri pierdute;</li>
            <li className="flex items-start gap-3 text-slate-300"><span className="text-red-500">❌</span>Mesaje date manual clienților când îți aduci aminte;</li>
            <li className="flex items-start gap-3 text-slate-300"><span className="text-red-500">❌</span>Excel-uri pe care nu le mai înțelege nimeni;</li>
            <li className="flex items-start gap-3 text-slate-300"><span className="text-red-500">❌</span>„Speranța” că vor veni clienți noi...</li>
          </ul>
        <p className="mt-4 text-slate-300">…atunci te lupți cu o mână legată la spate. La Work Flow Boost, nu vindem iluzii. Luăm tehnologia din start-up-urile de top și o aplicăm în afacerea ta locală pentru a elimina munca inutilă.</p>
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
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Cum arată digitalizarea în practică?</h2>
          <p className="mt-4 text-slate-300">Câteva scenarii reale unde sistemele mele fac diferența:</p>
          <div className="mt-6 grid sm:grid-cols-3 gap-6">
            <div className="relative p-6 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10">
              <div className="absolute top-0 left-0 right-0 mx-2  h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
              <h3 className="text-white font-semibold">„Mina de Aur Abandonată”</h3>
              <p className="text-slate-400 text-sm">Reactivarea bazei de date</p>
              <p className="mt-3 text-slate-300">Ai sute de numere vechi. Nu ai timp să le suni. Sistem AI care trimite mesaje personalizate și empatice tuturor. Clienți vechi se reîntorc în 24 de ore, fără reclame.</p>
            </div>
            <div className="relative p-6 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10">
              <div className="absolute top-0 left-0 right-0 mx-2  h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
              <h3 className="text-white font-semibold">„Secretara Virtuală care nu doarme”</h3>
              <p className="text-slate-400 text-sm">Asistent AI 24/7</p>
              <p className="mt-3 text-slate-300">Pierzi clienți pentru că nu răspunzi în weekend/seara. Asistentul AI răspunde la întrebări și face programarea direct în calendarul tău.</p>
            </div>
            <div className="relative p-6 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10">
              <div className="absolute top-0 left-0 right-0 mx-2  h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
              <h3 className="text-white font-semibold">„Marketingul care nu uită”</h3>
              <p className="text-slate-400 text-sm">Nurturing automat</p>
              <p className="mt-3 text-slate-300">Plătești reclame, oamenii intră pe site, dar nu cumpără. Sistemul trimite mail/SMS util timp de 2 săptămâni până când sunt gata să cumpere.</p>
            </div>
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
                Stack Tehnologic & Servicii
                <div className="w-20 h-1 bg-[#76007D] mt-4 rounded-full"></div>
              </h2>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              {/* Service 1 */}
              <div className="relative p-8 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10 hover:translate-x-2 transition-transform overflow-hidden">
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

              {/* Service 2 */}
              <div className="relative p-8 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10 hover:translate-x-2 transition-transform overflow-hidden">
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

              {/* Service 3 */}
              <div className="relative p-8 rounded-xl bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10 hover:translate-x-2 transition-transform overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#76007D]/10 rounded-lg text-[#76007D]">
                    <Database size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Reactivare Baze de Date & CRM</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Transformă listele de contacte "moarte" în venituri. Configurez sisteme care scanează baza de date, segmentează clienții și inițiază conversații personalizate prin AI pentru a-i readuce în pipeline.
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Lead Scoring Automat</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Campanii de Reactivare AI</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Integrare CRM Bidirecțională</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#1E94A5]" /> Curățare Date Automată</li>
                </ul>
              </div>

              {/* Service 4 - CUSTOM PERSONALIZED (Premium Cyan Neon) */}
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
                  <h3 className="text-xl font-bold text-white">Arhitectură Custom & Audit</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Soluțiile standard nu se potrivesc modelului tău? Analizez business-ul de la zero și construiesc un sistem <span className="text-[#39B5C4] font-semibold">100% personalizat</span>. Rezolv probleme complexe pe care agențiile "copy-paste" le ignoră.
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00FFFF]" /> Consultanță 1-la-1</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00FFFF]" /> Integrare Sisteme Legacy</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00FFFF]" /> Soluții Non-Standard</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00FFFF]" /> Scalabilitate Garantată</li>
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

            </div>
          </div>
        </div>
      </section>

      {/* USPs / Philosophy */}
      <section id="philosophy" className="relative z-10 py-24 px-6 text-[#E5E7EB] font-sans selection:bg-[#76007D] selection:text-white overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#000045] via-[#000025] to-[#000010]">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
  
              
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#1E94A5] text-xs font-mono uppercase tracking-wider mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E94A5] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E94A5]"></span>
                </span>
                Inginerie, nu gălăgie
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
                Nu îți vând povești.<br/>
                Îți construiesc <span className="text-[#0A2540] bg-white px-2">infrastructura.</span>
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 p-1 bg-[#0A2540] rounded text-white h-fit">
                    <Terminal size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Inginer Backend, Nu Marketer</h4>
                    <p className="text-blue-100">Gândesc în sisteme logice, fluxuri de date și eficiență computațională, nu în "buzzwords" creative.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 p-1 bg-[#0A2540] rounded text-white h-fit">
                    <Code2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Implementare Tehnică Reală</h4>
                    <p className="text-blue-100">Scriu cod, integrez API-uri și configurez servere. Soluțiile mele sunt robuste și scalabile.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 p-1 bg-[#0A2540] rounded text-white h-fit">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Garanții "Fără BS"</h4>
                    <p className="text-blue-100">Dacă sistemul nu aduce eficiență măsurabilă, îl rescriem. Transparență totală în raportare.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative p-8 rounded-2xl bg-[#39B5C4]/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(57,181,196,0.15)] hover:-translate-y-[2px] hover:shadow-[0_30px_80px_rgba(57,181,196,0.25)] border border-white/10  ">
              <div className="absolute top-0 left-0 right-0 mx-2  h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
              {/* <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-8 -left-12 w-[240px] h-[240px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl opacity-10"></div>
                <div className="absolute -bottom-12 -right-16 w-[300px] h-[300px] bg-gradient-to-tr from-[#1E94A5]/10 to-transparent rounded-full blur-2xl opacity-10"></div>
              </div> */}
              <div className="absolute -top-4 -right-8 bg-white text-[#0A2540] px-4 py-2 font-bold rounded shadow-lg transform rotate-12">
                PROVEN IN PRODUCTION
              </div>
              <div className="space-y-4 font-mono text-sm text-slate-300">
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span>STATUS:</span>
                  <span className="text-[#2AAF7F]">ONLINE</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span>UPTIME:</span>
                  <span className="text-white">99.9%</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span>OPTIMIZATION:</span>
                  <span className="text-[#1E94A5]">AI-ENABLED</span>
                </div>
                <div className="p-4 bg-black/30 rounded mt-4">
                  <code className="block text-xs text-green-500 mb-1">$ system_check --complet</code>
                  <code className="block text-xs text-slate-400">Analyzing workflow bottlenecks...</code>
                  <code className="block text-xs text-slate-400">Found: 3 critical inefficiencies</code>
                  <code className="block text-xs text-slate-400">Initiating automated fix...</code>
                  <code className="block text-xs text-green-500 mt-2">Done. Revenue increased.</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendly / Booking Section */}
      <section id="booking" className="relative z-10 py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Discutăm Sisteme, Nu Strategii</h2>
          <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
            Aceasta nu este o convorbire de vânzări. Este o evaluare tehnică a fluxului tău de lucru. Voi analiza unde pierzi bani și îți voi propune o soluție inginerească.
          </p>
          <div className="relative bg-[#39B5C4]/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(57,181,196,0.20)] w-full p-8 text-left">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70"></div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="md:col-span-1">
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">Nume</label>
                <input type="text" value={formName} onChange={(e)=>setFormName(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E94A5]" placeholder="Numele tău" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">Email</label>
                <input type="email" value={formEmail} onChange={(e)=>setFormEmail(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E94A5]" placeholder="nume@exemplu.ro" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">Telefon</label>
                <input type="tel" value={formPhone} onChange={(e)=>setFormPhone(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E94A5]" placeholder="+40 7xx xxx xxx" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">Ce ai vrea să îmbunătățești? (opțional)</label>
                <textarea value={formGoal} onChange={(e)=>setFormGoal(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 h-28 resize-y text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E94A5]" placeholder="Descrie pe scurt" />
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
      <footer className="bg-[#051321] text-slate-500 py-4 border-t border-white/5 relative z-10 text-sm">
        <div className="container flex-row mx-auto px-6 text-center">
          <div className='flex text-center items-center justify-center gap-4'> 
          <div className="flex items-center justify-center gap-2 font-mono text-lg font-bold tracking-tighter text-white mb-3">
            <Terminal className="text-[#76007D]" size={20} />
            <span>BENEDEK<span className="text-[#76007D]">.SYS</span></span>
          </div>
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
