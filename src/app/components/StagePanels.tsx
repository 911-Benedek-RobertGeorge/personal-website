'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, Calendar, Database, Globe, Workflow, X } from 'lucide-react';
import Counter from './Counter';
import { BEATS, PANELS, panelT, type PanelSpec } from './stage';

type Props = {
  onPrimaryCta: () => void;
  onSecondaryCta: () => void;
};

const glass = 'rounded-xl bg-[#000022]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]';
const chip = `${glass} px-4 py-2.5 text-sm font-semibold text-white flex items-center gap-2`;
const painCard = `${glass} border-red-500/20 px-4 py-3`;
const counterCard = `${glass} border-[#2AAF7F]/25 px-6 py-4 text-center`;

// Desktop outer-wrapper position classes per panel id (mobile m-* handled separately).
const POS: Record<string, string> = {
  'wake-headline': 'left-1/2 -translate-x-1/2 top-[10vh] w-[min(92vw,760px)] text-center',
  'wake-cue': 'left-1/2 -translate-x-1/2 bottom-[5vh]',
  'helper-title': 'left-1/2 -translate-x-1/2 top-[9vh] text-center',
  'helper-chip-1': 'left-[7vw] top-[27vh]',
  'helper-chip-2': 'right-[7vw] top-[31vh]',
  'helper-chip-3': 'left-[9vw] bottom-[28vh]',
  'helper-chip-4': 'right-[9vw] bottom-[24vh]',
  'chaos-title': 'left-1/2 -translate-x-1/2 top-[9vh] text-center',
  'chaos-pain-1': 'left-[6vw] top-[27vh] w-[min(30vw,320px)]',
  'chaos-pain-2': 'right-[6vw] top-[31vh] w-[min(30vw,320px)]',
  'chaos-pain-3': 'left-[8vw] bottom-[24vh] w-[min(30vw,320px)]',
  'results-title': 'left-1/2 -translate-x-1/2 top-[9vh] text-center',
  'results-c1': 'left-[9vw] top-[28vh]',
  'results-c2': 'right-[9vw] top-[28vh]',
  'results-c3': 'left-[11vw] bottom-[26vh]',
  'results-c4': 'right-[11vw] bottom-[26vh]',
  // Top-center like wake (bookend): the z-999 canvas paints the robot OVER panels, and only ~120px clears
  // the podium at the bottom — a bottom-centered CTA gets buried. Above the head it is always readable.
  'activate-cta': 'left-1/2 -translate-x-1/2 top-[12vh] w-[min(92vw,560px)] text-center',
};

function CtaButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 px-7 h-14 rounded-xl border-2 border-[#39B5C4] bg-[#000022]/50 text-white font-semibold hover:scale-105 hover:border-[#2AAF7F] hover:text-[#2AAF7F] transition-all duration-300"
    >
      <Calendar size={18} />
      {children}
    </button>
  );
}

export default function StagePanels({ onPrimaryCta, onSecondaryCta }: Props) {
  const stageRef = useRef<HTMLElement | null>(null);
  const innerRefs = useRef(new Map<string, HTMLDivElement>());
  const countersOnRef = useRef(false);
  const [countersOn, setCountersOn] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = () => {
      const el = stageRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const span = rect.height - window.innerHeight;
        const p = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;
        for (const spec of PANELS) {
          const node = innerRefs.current.get(spec.id);
          if (!node) continue;
          const t = panelT(spec, p);
          node.style.opacity = t.toFixed(3);
          node.style.transform = `translateY(${((1 - t) * 24).toFixed(1)}px)`;
          node.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
        }
        if (!countersOnRef.current && p >= BEATS[3].range[0]) {
          countersOnRef.current = true;
          setCountersOn(true);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const setInner = (id: string) => (node: HTMLDivElement | null) => {
    if (node) innerRefs.current.set(id, node);
    else innerRefs.current.delete(id);
  };

  const pains = [
    { title: 'Lead-uri care scapă', body: 'Clienți care întreabă seara și cumpără de la altcineva dimineața.' },
    { title: 'Follow-up manual, uitat', body: 'Mesaje trimise doar când îți aduci aminte.' },
    { title: 'Zero vizibilitate în cifre', body: 'Excel-uri pe care nu le mai înțelege nimeni.' },
  ];

  const chips = [
    { icon: <Bot size={16} className="text-[#1E94A5]" />, label: 'Asistent AI 24/7' },
    { icon: <Workflow size={16} className="text-[#1E94A5]" />, label: 'CRM + automatizări' },
    { icon: <Database size={16} className="text-[#1E94A5]" />, label: 'Reactivare bază de date' },
    { icon: <Globe size={16} className="text-[#1E94A5]" />, label: 'Web AI-driven' },
  ];

  const counterData = [
    { to: 3.5, decimals: 1, prefix: '', suffix: 'x', label: 'ROI', static: '3.5x' },
    { to: 0, decimals: 0, prefix: '', suffix: '', label: 'erori umane', static: '0' },
    { to: 40, decimals: 0, prefix: '+', suffix: '%', label: 'eficiență', static: '+40%' },
    { to: 24, decimals: 0, prefix: '', suffix: '/7', label: 'mereu activ', static: '24/7' },
  ];

  const counterCards = (size: 'md' | 'lg') =>
    counterData.map((c) => (
      <div key={c.label} className={counterCard}>
        <div className={`${size === 'lg' ? 'text-4xl' : 'text-2xl'} font-extrabold text-[#2AAF7F]`}>
          <Counter to={c.to} decimals={c.decimals} prefix={c.prefix} suffix={c.suffix} active={countersOn} />
        </div>
        <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">{c.label}</div>
      </div>
    ));

  const staticCounterCards = counterData.map((c) => (
    <div key={c.label} className={counterCard}>
      <div className="text-4xl font-extrabold text-[#2AAF7F]">{c.static}</div>
      <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">{c.label}</div>
    </div>
  ));

  const content: Record<string, React.ReactNode> = {
    'wake-headline': (
      <>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-widest text-[#39B5C4] mb-5">
          Sistem de automatizare AI
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">Motorul de Clienți Noi</h1>
        <p className="mt-4 text-slate-300 text-lg md:text-xl">Sisteme AI care lucrează non-stop pentru afacerea ta</p>
        <div className="mt-7">
          <CtaButton onClick={onPrimaryCta}>Activează Sistemul</CtaButton>
        </div>
      </>
    ),
    'wake-cue': (
      <div className="flex flex-col items-center gap-1 text-slate-500 text-xs uppercase tracking-widest">
        <span>derulează</span>
        <span className="animate-bounce">↓</span>
      </div>
    ),
    'helper-title': <h2 className="text-3xl md:text-4xl font-bold text-white">Ce implementez</h2>,
    'helper-chip-1': <div className={chip}>{chips[0].icon}{chips[0].label}</div>,
    'helper-chip-2': <div className={chip}>{chips[1].icon}{chips[1].label}</div>,
    'helper-chip-3': <div className={chip}>{chips[2].icon}{chips[2].label}</div>,
    'helper-chip-4': <div className={chip}>{chips[3].icon}{chips[3].label}</div>,
    'chaos-title': <h2 className="text-3xl md:text-4xl font-bold text-white">Haosul de azi</h2>,
    'chaos-pain-1': (
      <div className={painCard}>
        <div className="flex items-center gap-2 text-white font-semibold text-sm"><X size={14} className="text-red-400" />{pains[0].title}</div>
        <p className="text-slate-400 text-xs mt-1">{pains[0].body}</p>
      </div>
    ),
    'chaos-pain-2': (
      <div className={painCard}>
        <div className="flex items-center gap-2 text-white font-semibold text-sm"><X size={14} className="text-red-400" />{pains[1].title}</div>
        <p className="text-slate-400 text-xs mt-1">{pains[1].body}</p>
      </div>
    ),
    'chaos-pain-3': (
      <div className={painCard}>
        <div className="flex items-center gap-2 text-white font-semibold text-sm"><X size={14} className="text-red-400" />{pains[2].title}</div>
        <p className="text-slate-400 text-xs mt-1">{pains[2].body}</p>
      </div>
    ),
    'results-title': <h2 className="text-3xl md:text-4xl font-bold text-white">Rezultate din producție</h2>,
    'activate-cta': (
      <>
        <p className="text-[#2AAF7F] font-bold text-lg mb-4">Nu lăsa lead-uri să scape.</p>
        <CtaButton onClick={onPrimaryCta}>Activează Sistemul</CtaButton>
        <button onClick={onSecondaryCta} className="mt-3 mx-auto text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
          sau trimite o cerere <ArrowRight size={14} />
        </button>
      </>
    ),
  };

  // The four result counters are separate desktop panels.
  const counterPanels: Record<string, React.ReactNode> = {};
  const counterNodes = counterCards('lg');
  ['results-c1', 'results-c2', 'results-c3', 'results-c4'].forEach((id, i) => {
    counterPanels[id] = counterNodes[i];
  });

  // Mobile per-beat cards: one bottom-anchored card per beat.
  const mobileContent: Record<string, React.ReactNode> = {
    'm-wake': (
      <div className={`${glass} px-5 py-6 text-center`}>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Motorul de Clienți Noi</h1>
        <p className="mt-2 text-slate-300 text-sm">Sisteme AI care lucrează non-stop pentru afacerea ta</p>
        <div className="mt-4"><CtaButton onClick={onPrimaryCta}>Activează Sistemul</CtaButton></div>
      </div>
    ),
    'm-helper': (
      <div className={`${glass} px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Ce implementez</h2>
        <div className="grid grid-cols-2 gap-2">
          {chips.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-xs text-white font-medium">{c.icon}{c.label}</div>
          ))}
        </div>
      </div>
    ),
    'm-chaos': (
      <div className={`${glass} border-red-500/20 px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Haosul de azi</h2>
        <ul className="space-y-2">
          {pains.map((pn) => (
            <li key={pn.title} className="flex items-start gap-2 text-xs text-slate-300"><X size={12} className="text-red-400 mt-0.5 shrink-0" />{pn.title} — {pn.body}</li>
          ))}
        </ul>
      </div>
    ),
    'm-results': (
      <div className={`${glass} border-[#2AAF7F]/25 px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Rezultate din producție</h2>
        <div className="grid grid-cols-2 gap-2">{counterCards('md')}</div>
      </div>
    ),
    'm-activate': (
      <div className={`${glass} px-5 py-6 text-center`}>
        <p className="text-[#2AAF7F] font-bold mb-3">Nu lăsa lead-uri să scape.</p>
        <CtaButton onClick={onPrimaryCta}>Activează Sistemul</CtaButton>
      </div>
    ),
  };

  const renderContent = (id: string) => content[id] ?? counterPanels[id] ?? mobileContent[id] ?? null;

  const wrapperClass = (spec: PanelSpec) =>
    spec.id.startsWith('m-')
      ? 'absolute md:hidden inset-x-4 bottom-[5vh]'
      : `absolute hidden md:block ${POS[spec.id] ?? ''}`;

  // First-paint default: beat-1 panels visible, the rest hidden (rAF corrects after hydration).
  const innerClass = (spec: PanelSpec) =>
    `will-change-transform ${spec.enterAt === 0 ? 'opacity-100' : 'opacity-0'}`;

  if (reduced) {
    // Reduced motion: no pinning — the beats stack as normal static sections.
    return (
      <section data-stage className="relative">
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 gap-4">{content['wake-headline']}</div>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-5">
          {content['helper-title']}
          <div className="flex flex-wrap justify-center gap-3">{chips.map((c) => (<div key={c.label} className={chip}>{c.icon}{c.label}</div>))}</div>
        </div>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-5">
          {content['chaos-title']}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl">{['chaos-pain-1', 'chaos-pain-2', 'chaos-pain-3'].map((id) => (<div key={id}>{content[id]}</div>))}</div>
        </div>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-5">
          {content['results-title']}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{staticCounterCards}</div>
        </div>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">{content['activate-cta']}</div>
      </section>
    );
  }

  return (
    // z-[1000] on mobile lifts the bottom cards above the z-[999] canvas (an 812px screen can't fit robot + card
    // separated, so the glass sheet covers his feet). md:z-auto keeps the desktop robot painting in front.
    <section ref={stageRef} data-stage className="relative h-[400vh] md:h-[500vh] z-[1000] md:z-auto">
      <div className="sticky top-0 h-screen overflow-hidden">
        {PANELS.map((spec) => (
          <div key={spec.id} className={wrapperClass(spec)}>
            <div ref={setInner(spec.id)} className={innerClass(spec)}>
              {renderContent(spec.id)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
