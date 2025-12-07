'use client';
import React, { useState, useEffect } from 'react';
import { 
   Terminal, 
  Database, 
  BarChart3, 
  ArrowRight, 
  Code2, 
  ShieldCheck, 
  Workflow, 
  Linkedin,
  Server,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
 } from 'lucide-react';

import dynamic from "next/dynamic";
import Script from 'next/script';

const Scene = dynamic(() => import("./Scene"), { ssr: false });

const App = () => {
  const [scrolled, setScrolled] = useState(false);
  // Stare pentru pop-up-ul animat la scroll
  const [showInitialPopup, setShowInitialPopup] = useState(false);
  const [hasScrolledPast, setHasScrolledPast] = useState(false);
  // Contact form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formGoal, setFormGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Logică pentru a declanșa pop-up-ul animat o singură dată la scroll (după secțiunea Hero)
      if (window.scrollY > 600 && !hasScrolledPast) {
        setShowInitialPopup(true);
        setHasScrolledPast(true); // Marcam ca declanșat o dată

        // Ascundem pop-up-ul animat după 3 secunde
        const timer = setTimeout(() => {
          setShowInitialPopup(false);
        }, 3000); 

        return () => clearTimeout(timer); // Curățăm timer-ul
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
      setSubmitMessage('Please fill in name, email, and phone.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/callback-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, email: formEmail, phone: formPhone, goal: formGoal }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMessage('Request received. I will call you soon.');
        setFormName('');
        setFormEmail('');
        setFormPhone('');
        setFormGoal('');
      } else {
        setSubmitMessage(data?.error || 'Something went wrong.');
      }
    } catch (err) {
      setSubmitMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B172C] text-[#E5E7EB] font-sans selection:bg-[#973CFF] selection:text-white overflow-x-hidden">
      {/* Gradient de fundal */}
      <div className="fixed inset-0 -z-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#973CFF]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-[#973CFF]/10 rounded-full blur-[100px]" />
      </div>

      {/* 3D Robot Background Canvas */}
      <div className="fixed left-0 top-0 h-screen w-[30vw] z-[999] pointer-events-none">
        <Scene />
      </div>

      {/* Navigation */}
      <nav className={`${scrolled ? 'bg-[#0B172C]/90 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'} fixed w-full z-50 transition-all duration-300`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 font-mono text-xl font-bold tracking-tighter text-white">
            <Terminal className="text-[#973CFF]" size={24} />
            <span>BENEDEK<span className="text-[#973CFF]">.SYS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#case-studies" className="hover:text-white transition-colors">Studii de Caz</a>
            <a href="#services" className="hover:text-white transition-colors">Servicii</a>
            <a href="#philosophy" className="hover:text-white transition-colors">Abordare</a>
          </div>
          <div className="flex items-center gap-4">
             <a 
              href="https://www.linkedin.com/in/benedek-robert/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-white hover:text-[#0077b5] transition-colors font-medium"
            >
              <Linkedin size={20} />
              <span>Conectează-te</span>
            </a>
            <button 
              onClick={scrollToBooking}
              className="bg-[#973CFF] hover:bg-[#7e30d6] text-white px-5 py-2 rounded-md text-sm font-semibold transition-all shadow-[0_0_40px_rgba(151,60,255,0.2)] hover:shadow-[0_0_60px_rgba(151,60,255,0.35)]"
            >
              Audit Tehnic
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 border-y border-white/5 bg-[#122440] backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#973CFF] text-xs font-mono mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#973CFF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#973CFF]"></span>
            </span>
            SYSTEM ARCHITECTURE & AUTOMATION
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Ineficiența operațională <br/>
            te costă <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#973CFF] to-[#FBAA60]">venituri zilnic.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
            Nu sunt o agenție de marketing. Sunt un inginer backend care construiește sisteme autonome pentru a elimina pierderile, a automatiza procesele și a scala afacerea ta pe baza datelor, nu a presupunerilor.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button 
              onClick={scrollToBooking}
              className="flex items-center justify-center gap-3 bg-white text-[#0A2540] px-8 py-4 rounded-lg font-bold hover:bg-slate-200 transition-all shadow-lg shadow-white/10"
            >
              <Calendar size={20} />
              Diagnostichează Problema
            </button>
            <a 
              href="#case-studies"
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-medium text-white border border-white/10 hover:bg-white/5 transition-all"
            >
              Vezi Rezultate Tehnice
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Credibility Frame - ENHANCED LINKEDIN WITH AVATAR POPUP */}
      <section className="relative z-10 border-y border-white/5 bg-[#0A2540]/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Tech Cred */}
            <div className="flex items-center justify-center md:justify-start gap-4 py-8 md:pr-8">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <Code2 size={28} className="text-[#0066FF]" />
              </div>
              <div className="text-sm">
                <div className="text-white font-bold text-lg">Backend Engineer</div>
                <div className="text-slate-400">Arhitectură de Sistem</div>
              </div>
            </div>

            {/* Experience */}
            <div className="flex items-center justify-center gap-4 py-8 md:px-8">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <Server size={28} className="text-[#973CFF]" />
              </div>
              <div className="text-sm">
                <div className="text-white font-bold text-lg">Tokeny Experience</div>
                <div className="text-slate-400">1 An+ în Mediu Startup</div>
              </div>
            </div>

            {/* LinkedIn Prominent + Avatar + Animated Popup */}
            <div className="relative group flex items-center justify-center md:justify-end py-6 md:pl-8">
              
               {/* Animated Pop-up Bubble - Vizibilitate controlată de scroll (cu bounce) și hover (static) */}
               <div className={`absolute top-2 right-12 md:right-32 z-20 pointer-events-none select-none transition-all duration-300 transform ${showInitialPopup ? 'opacity-100 translate-y-0 animate-bounce' : 'opacity-0 translate-y-4'} group-hover:opacity-100 group-hover:translate-y-0 group-hover:animate-none`}>
                  <div className="bg-white text-[#0A2540] px-4 py-2 rounded-xl rounded-tr-none shadow-[0_0_15px_rgba(255,255,255,0.4)] border border-[#973CFF]/30 flex items-center gap-2 text-xs font-bold whitespace-nowrap transform -rotate-2">
                    <span className="text-base">👋</span> Salut! Hai să ne conectăm!
                  </div>
                  {/* Triangle for bubble */}
                  <div className="absolute -bottom-1 right-0 w-3 h-3 bg-white transform rotate-45 border-b border-r border-[#973CFF]/30 translate-x-[-10px]"></div>
               </div>

              <a 
                href="https://www.linkedin.com/in/benedek-robert/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 hover:bg-[#0077b5]/10 p-2 rounded-xl transition-all cursor-pointer relative"
              >
                
                <div className="text-right hidden sm:block">
                  <div className="text-white font-bold text-lg group-hover:text-[#0077b5] transition-colors">Robert Benedek</div>
                  <div className="text-slate-400 flex items-center gap-1 justify-end text-sm">
                     Vezi Profilul <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                  </div>
                </div>

                {/* Avatar Container with Glow */}
                <div className="relative">
                  <div className="absolute inset-0 bg-[#973CFF] rounded-full blur-md opacity-40 group-hover:opacity-70 animate-pulse"></div>
                  {/* Sursa imaginii actualizată la /portret.jpg */}
                  <img 
                    src="/portret.jpg" 
                    alt="Robert Benedek" 
                    className="relative w-16 h-16 rounded-full border-2 border-[#0077b5] object-cover shadow-2xl group-hover:scale-105 transition-transform duration-300 z-10 bg-[#0B172C]"
                  />
                  {/* LinkedIn Logo Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-[#0077b5] p-1.5 rounded-full border-2 border-[#0B172C] z-20 shadow-lg">
                    <Linkedin size={14} className="text-white" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="relative z-10 py-24 px-6 bg-[#082038]">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Date din Producție</h2>
            <p className="text-slate-400">Implementări reale. Rezultate măsurabile. Fără estimări vagi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Case Study 1 */}
            <div className="group bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/[0.07] transition-all hover:border-[#0066FF]/30">
              <div className="flex justify-between items-start mb-6">
                <div className="text-[#0066FF] font-mono text-sm">PRODUCȚIE INDUSTRIALĂ</div>
                <Workflow className="text-slate-500 group-hover:text-[#973CFF] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Automatizare Inventar & Logistică</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Companie medie de producție cu pierderi de 15% din cauza gestionării manuale a stocurilor. Am implementat un sistem AI care prezice necesarul de materiale și automatizează comenzile către furnizori.
              </p>
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div>
                  <div className="text-2xl font-bold text-white">40%</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Reducere Erori</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">25h</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Salvate Săptămânal</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0066FF]">+18%</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Eficiență</div>
                </div>
              </div>
            </div>

            {/* Case Study 2 */}
            <div className="group bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/[0.07] transition-all hover:border-[#0066FF]/30">
              <div className="flex justify-between items-start mb-6">
                <div className="text-[#0066FF] font-mono text-sm">SERVICII PROFESIONALE</div>
                <ShieldCheck className="text-slate-500 group-hover:text-[#973CFF] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Onboarding Client Automated Flow</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Firmă de consultanță juridică cu bottleneck în procesarea documentelor. Am creat un portal securizat cu generare automată de contracte și flow-uri de aprobare.
              </p>
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div>
                  <div className="text-2xl font-bold text-white">300%</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Viteză Procesare</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Erori Umane</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0066FF]">+45%</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Conversie Lead</div>
                </div>
              </div>
            </div>

            {/* Case Study 3 */}
            <div className="group bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/[0.07] transition-all hover:border-[#0066FF]/30">
              <div className="flex justify-between items-start mb-6">
                <div className="text-[#0066FF] font-mono text-sm">E-COMMERCE</div>
                <BarChart3 className="text-slate-500 group-hover:text-[#973CFF] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Prețuri Dinamice & Retenție</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Retailer online cu marje scăzute. Implementare algoritm de ajustare prețuri în timp real și sistem de reactivare coșuri abandonate prin SMS/Email personalizat AI.
              </p>
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div>
                  <div className="text-2xl font-bold text-white">22%</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Creștere Venit</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">3.5x</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">ROI Sistem</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0066FF]">12k€</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Recuperat Lunar</div>
                </div>
              </div>
            </div>

            {/* Case Study 4 */}
            <div className="group bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/[0.07] transition-all hover:border-[#0066FF]/30">
              <div className="flex justify-between items-start mb-6">
                <div className="text-[#0066FF] font-mono text-sm">IMOBILIARE</div>
                <Database className="text-slate-500 group-hover:text-[#973CFF] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lead Qualification Engine</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Agenție imobiliară inundată de lead-uri necalificate. Sistemul AI preia conversația inițială, califică bugetul și programează automat vizionările doar pentru clienții serioși.
              </p>
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div>
                  <div className="text-2xl font-bold text-white">70%</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Timp Salvat</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">2x</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Rată Închidere</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0066FF]">Auto</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Calendar Sync</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative z-10 py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 sticky top-32">
                Stack Tehnologic & Servicii
                <div className="w-20 h-1 bg-[#973CFF] mt-4 rounded-full"></div>
              </h2>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              {/* Service 1 */}
              <div className="p-8 bg-[#0D2D4D] rounded-xl border-l-4 border-[#973CFF] hover:translate-x-2 transition-transform">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#973CFF]/10 rounded-lg text-[#973CFF]">
                    <Code2 size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Dezvoltare Web AI-Driven</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Nu doar un site de prezentare, ci o mașinărie de conversie. Construiesc platforme custom cu sisteme integrate de captare a lead-urilor și CRM, optimizate pentru viteză și UX.
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Arhitectură React/Next.js</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Integrări API Native</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Dashboard Admin Custom</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Securitate Enterprise</li>
                </ul>
              </div>

              {/* Service 2 */}
              <div className="p-8 bg-[#0D2D4D] rounded-xl border-l-4 border-[#973CFF] hover:translate-x-2 transition-transform">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#973CFF]/10 rounded-lg text-[#973CFF]">
                    <Zap size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white">SEO & Optimizare Automată</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Audit tehnic profund și implementare automată. Sistemele mele monitorizează constant performanța, ajustează meta-datele și optimizează conținutul pentru a domina rezultatele de căutare.
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Audit Tehnic Automat</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Schema Markup Dinamic</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Optimizare Viteză Core Web Vitals</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Rapoarte KPI Automate</li>
                </ul>
              </div>

              {/* Service 3 */}
              <div className="p-8 bg-[#0D2D4D] rounded-xl border-l-4 border-[#973CFF] hover:translate-x-2 transition-transform">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#973CFF]/10 rounded-lg text-[#973CFF]">
                    <Database size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Reactivare Baze de Date & CRM</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Transformă listele de contacte "moarte" în venituri. Configurez sisteme care scanează baza de date, segmentează clienții și inițiază conversații personalizate prin AI pentru a-i readuce în pipeline.
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Lead Scoring Automat</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Campanii de Reactivare AI</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Integrare CRM Bidirecțională</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#973CFF]" /> Curățare Date Automată</li>
                </ul>
              </div>

              {/* Service 4 - CUSTOM PERSONALIZED */}
              <div className="p-8 bg-gradient-to-br from-[#1a3a5a] to-[#0D2D4D] rounded-xl border border-orange-400/30 hover:border-orange-400 transition-all shadow-[0_0_30px_rgba(251,146,60,0.1)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 bg-orange-500/10 text-orange-400 text-xs font-bold rounded-bl-lg border-b border-l border-orange-500/20">
                  PREMIUM
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
                    <Layers size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Arhitectură Custom & Audit</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Soluțiile standard nu se potrivesc modelului tău? Analizez business-ul de la zero și construiesc un sistem <span className="text-orange-300 font-semibold">100% personalizat</span>. Rezolv probleme complexe pe care agențiile "copy-paste" le ignoră.
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-orange-400" /> Consultanță 1-la-1</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-orange-400" /> Integrare Sisteme Legacy</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-orange-400" /> Soluții Non-Standard</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-orange-400" /> Scalabilitate Garantată</li>
                </ul>
                <div className="mt-6 pt-4 border-t border-white/5">
                   <button onClick={scrollToBooking} className="w-full py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded font-medium transition-colors text-sm flex items-center justify-center gap-2">
                     Cere Ofertă Personalizată <ArrowRight size={14}/>
                   </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* USPs / Philosophy */}
      <section id="philosophy" className="relative z-10 py-24 px-6 bg-[#0B172C] text-[#E5E7EB] font-sans selection:bg-[#973CFF] selection:text-white overflow-x-hidden">
        {/* Abstract Pattern */}
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
              <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-mono mb-6 backdrop-blur-md">
                HARDWARE MENTALITY
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
            
            <div className="bg-[#0A2540] p-8 rounded-2xl shadow-2xl border border-white/10 relative">
              <div className="absolute -top-4 -right-4 bg-white text-[#0A2540] px-4 py-2 font-bold rounded shadow-lg transform rotate-3">
                PROVEN IN PRODUCTION
              </div>
              <div className="space-y-4 font-mono text-sm text-slate-300">
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span>STATUS:</span>
                  <span className="text-green-400">ONLINE</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span>UPTIME:</span>
                  <span className="text-white">99.9%</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span>OPTIMIZATION:</span>
                  <span className="text-[#0066FF]">AI-ENABLED</span>
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
      <section id="booking" className="relative z-10 py-24 px-6 bg-[#122440] [background:linear-gradient(#122440,#122440),linear-gradient(135deg,#973CFF,#FBAA60)] [background-clip:padding-box,border-box] [background-origin:border-box] rounded-2xl border border-transparent">
        {/* Contact form replacing Calendly inline widget */}
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Discutăm Sisteme, Nu Strategii</h2>
          <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
            Aceasta nu este o convorbire de vânzări. Este o evaluare tehnică a fluxului tău de lucru. Voi analiza unde pierzi bani și îți voi propune o soluție inginerească.
          </p>
      
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl w-full relative p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-[#0B172C] mb-2">Name</label>
                <input type="text" value={formName} onChange={(e)=>setFormName(e.target.value)} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#973CFF]" placeholder="Your name" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-[#0B172C] mb-2">Email</label>
                <input type="email" value={formEmail} onChange={(e)=>setFormEmail(e.target.value)} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#973CFF]" placeholder="you@example.com" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-[#0B172C] mb-2">Phone</label>
                <input type="tel" value={formPhone} onChange={(e)=>setFormPhone(e.target.value)} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#973CFF]" placeholder="+40 7xx xxx xxx" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-[#0B172C] mb-2">What would you like to improve? (optional)</label>
                <textarea value={formGoal} onChange={(e)=>setFormGoal(e.target.value)} className="w-full rounded-md border border-gray-300 px-4 py-2 h-28 resize-y focus:outline-none focus:ring-2 focus:ring-[#973CFF]" placeholder="Describe briefly" />
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 items-center">
                <button type="submit" disabled={submitting} className="bg-[#973CFF] hover:bg-[#7e30d6] text-white px-6 py-3 rounded-md font-semibold shadow-[0_0_40px_rgba(151,60,255,0.2)] hover:shadow-[0_0_60px_rgba(151,60,255,0.35)] disabled:opacity-70">
                  {submitting ? 'Submitting...' : 'Request a callback'}
                </button>
                <button type="button" onClick={handleScheduleClick} className="text-[#973CFF] hover:text-[#7e30d6] font-semibold flex items-center gap-2">
                  <Calendar size={20} className="text-[#973CFF]" />
                  Schedule time via Calendly
                </button>
              </div>
              {submitMessage && <p className="md:col-span-2 text-sm text-[#0B172C] mt-2">{submitMessage}</p>}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#051321] text-slate-500 py-12 border-t border-white/5 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 font-mono text-xl font-bold tracking-tighter text-white mb-6">
            <Terminal className="text-[#973CFF]" size={24} />
            <span>BENEDEK<span className="text-[#973CFF]">.SYS</span></span>
          </div>
          <div className="flex justify-center gap-6 mb-8">
            <a href="https://www.linkedin.com/in/benedek-robert/" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="mailto:contact@example.com" className="hover:text-white transition-colors">Email</a>
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