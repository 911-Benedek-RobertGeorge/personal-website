'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, Calendar, ChevronDown, Database, FlaskConical, Workflow, X } from 'lucide-react';
import { BEATS, PANELS, panelT, type PanelSpec } from './stage';

type Props = {
  onPrimaryCta: () => void;
  onSecondaryCta: () => void;
};

const glass = 'rounded-xl bg-[#000022]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]';
const chip = `${glass} px-4 py-2.5 text-sm font-semibold text-white flex items-center gap-2`;
const painCard = `${glass} border-red-500/20 px-4 py-3`;
const stepCard = `${glass} border-[#2AAF7F]/25 px-5 py-4`;

// Desktop outer-wrapper position classes per panel id (mobile m-* handled separately).
const POS: Record<string, string> = {
  'wake-headline': 'left-1/2 -translate-x-1/2 top-[12vh] w-[min(92vw,760px)] text-center',
  'helper-title': 'left-1/2 -translate-x-1/2 top-[13vh] text-center',
  'helper-chip-1': 'left-[7vw] top-[27vh]',
  'helper-chip-2': 'right-[7vw] top-[31vh]',
  'helper-chip-3': 'left-[9vw] bottom-[28vh]',
  'helper-chip-4': 'right-[9vw] bottom-[24vh]',
  'chaos-title': 'left-1/2 -translate-x-1/2 top-[13vh] text-center',
  'chaos-pain-1': 'left-[6vw] top-[27vh] w-[min(30vw,320px)]',
  'chaos-pain-2': 'right-[6vw] top-[31vh] w-[min(30vw,320px)]',
  'chaos-pain-3': 'left-[8vw] bottom-[24vh] w-[min(30vw,320px)]',
  'process-title': 'left-1/2 -translate-x-1/2 top-[13vh] text-center',
  'process-1': 'left-[9vw] top-[28vh] w-[min(24vw,260px)]',
  'process-2': 'right-[9vw] top-[28vh] w-[min(24vw,260px)]',
  'process-3': 'left-[11vw] bottom-[26vh] w-[min(24vw,260px)]',
  'process-4': 'right-[11vw] bottom-[26vh] w-[min(24vw,260px)]',
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
  const railFillRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lastPRef = useRef(-1);
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
        if (p !== lastPRef.current) {
          lastPRef.current = p;
          for (const spec of PANELS) {
            const node = innerRefs.current.get(spec.id);
            if (!node) continue;
            const t = panelT(spec, p);
            node.style.opacity = t.toFixed(3);
            node.style.transform = `translateY(${((1 - t) * 24).toFixed(1)}px)`;
            node.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
          }
          if (railFillRef.current) railFillRef.current.style.transform = `scaleY(${p.toFixed(4)})`;
          let active = 0;
          BEATS.forEach((b, i) => {
            if (p >= b.range[0]) active = i;
          });
          dotRefs.current.forEach((dot, i) => {
            if (dot) dot.dataset.on = String(i <= active);
          });
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
    { title: 'Muncă manuală repetitivă', body: 'Oameni buni blocați în emailuri, copy-paste și tabele.' },
    { title: 'Un blocaj pe care nu-l vede nimeni', body: 'Un singur pas lent încetinește tot procesul și costă în fiecare zi.' },
  ];

  const chips = [
    { icon: <Bot size={16} className="text-[#1E94A5]" />, label: 'Asistent AI care răspunde 24/7' },
    { icon: <Workflow size={16} className="text-[#1E94A5]" />, label: 'Agenți AI pentru munca repetitivă' },
    { icon: <Database size={16} className="text-[#1E94A5]" />, label: 'Follow-up și CRM automat' },
    { icon: <FlaskConical size={16} className="text-[#1E94A5]" />, label: 'Testare automată cu agenți AI' },
  ];

  const steps = [
    { n: '01', title: 'Audit', body: 'Găsim blocajul care te costă cel mai mult.' },
    { n: '02', title: 'Prototip', body: 'Un agent AI care rezolvă blocajul, testat pe datele tale.' },
    { n: '03', title: 'Integrare', body: 'Îl conectez la sistemele pe care le folosești deja.' },
    { n: '04', title: 'Măsurăm', body: 'Vedem cât timp și câți bani câștigi, apoi trecem la următorul blocaj.' },
  ];

  const stepCards = steps.map((s) => (
    <div key={s.n} className={stepCard}>
      <div className="font-mono text-sm text-[#2AAF7F]">{s.n}</div>
      <div className="text-white font-semibold">{s.title}</div>
      <p className="text-slate-400 text-xs mt-1">{s.body}</p>
    </div>
  ));

  const content: Record<string, React.ReactNode> = {
    'wake-headline': (
      <>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.05]">
          Găsesc blocajul.<br />
          Îl automatizez <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#39B5C4] to-[#2AAF7F]">cu AI.</span>
        </h1>
        <p className="mt-3 text-slate-300 text-base md:text-lg">Integrez agenți AI acolo unde afacerea ta pierde timp și bani.</p>
        <div className="mt-5">
          <CtaButton onClick={onPrimaryCta}>Programează un audit AI</CtaButton>
        </div>
      </>
    ),
    'helper-title': <h2 className="text-3xl md:text-4xl font-bold text-white">Ce automatizez cu AI</h2>,
    'helper-chip-1': <div className={chip}>{chips[0].icon}{chips[0].label}</div>,
    'helper-chip-2': <div className={chip}>{chips[1].icon}{chips[1].label}</div>,
    'helper-chip-3': <div className={chip}>{chips[2].icon}{chips[2].label}</div>,
    'helper-chip-4': <div className={chip}>{chips[3].icon}{chips[3].label}</div>,
    'chaos-title': <h2 className="text-3xl md:text-4xl font-bold text-white">Unde se pierd azi timp și bani</h2>,
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
    'process-title': <h2 className="text-3xl md:text-4xl font-bold text-white">Cum lucrăm împreună</h2>,
    'process-1': stepCards[0],
    'process-2': stepCards[1],
    'process-3': stepCards[2],
    'process-4': stepCards[3],
    'activate-cta': (
      <>
        <p className="text-[#2AAF7F] font-bold text-lg mb-4">Hai să găsim blocajul din afacerea ta.</p>
        <CtaButton onClick={onPrimaryCta}>Programează un audit AI</CtaButton>
        <button onClick={onSecondaryCta} className="mt-3 mx-auto text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
          sau trimite o cerere <ArrowRight size={14} />
        </button>
      </>
    ),
  };

  // Mobile per-beat cards: one bottom-anchored card per beat.
  const mobileContent: Record<string, React.ReactNode> = {
    'm-wake': (
      <div className={`${glass} px-5 py-6 text-center`}>
        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
          Găsesc blocajul.<br />
          Îl automatizez <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#39B5C4] to-[#2AAF7F]">cu AI.</span>
        </h1>
        <p className="mt-2 text-slate-300 text-sm">Integrez agenți AI acolo unde afacerea ta pierde timp și bani.</p>
        <div className="mt-4"><CtaButton onClick={onPrimaryCta}>Programează un audit AI</CtaButton></div>
      </div>
    ),
    'm-helper': (
      <div className={`${glass} px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Ce automatizez cu AI</h2>
        <div className="grid grid-cols-2 gap-2">
          {chips.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-xs text-white font-medium">{c.icon}{c.label}</div>
          ))}
        </div>
      </div>
    ),
    'm-chaos': (
      <div className={`${glass} border-red-500/20 px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Unde se pierd azi timp și bani</h2>
        <ul className="space-y-2">
          {pains.map((pn) => (
            <li key={pn.title} className="flex items-start gap-2 text-xs text-slate-300"><X size={12} className="text-red-400 mt-0.5 shrink-0" />{pn.title} — {pn.body}</li>
          ))}
        </ul>
      </div>
    ),
    'm-process': (
      <div className={`${glass} border-[#2AAF7F]/25 px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Cum lucrăm împreună</h2>
        <ol className="space-y-2">
          {steps.map((s) => (
            <li key={s.n} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="font-mono text-[#2AAF7F] shrink-0">{s.n}</span>
              <span><span className="text-white font-semibold">{s.title}</span> — {s.body}</span>
            </li>
          ))}
        </ol>
      </div>
    ),
    'm-activate': (
      <div className={`${glass} px-5 py-6 text-center`}>
        <p className="text-[#2AAF7F] font-bold mb-3">Hai să găsim blocajul din afacerea ta.</p>
        <CtaButton onClick={onPrimaryCta}>Programează un audit AI</CtaButton>
      </div>
    ),
  };

  const renderContent = (id: string) => content[id] ?? mobileContent[id] ?? null;

  const wrapperClass = (spec: PanelSpec) =>
    spec.id.startsWith('m-')
      ? 'absolute md:hidden inset-x-4 bottom-[5vh] pointer-events-none'
      : `absolute hidden md:block pointer-events-none ${POS[spec.id] ?? ''}`;

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
          {content['process-title']}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl">{stepCards}</div>
        </div>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">{content['activate-cta']}</div>
      </section>
    );
  }

  return (
    // z-[1000] on mobile lifts the bottom cards above the z-[999] canvas (an 812px screen can't fit robot + card
    // separated, so the glass sheet covers his feet). md:z-auto keeps the desktop robot painting in front.
    <section ref={stageRef} data-stage className="relative h-[600vh] md:h-[800vh] z-[1000] md:z-auto">
      <div className="sticky top-0 h-screen supports-[height:100dvh]:h-dvh overflow-hidden">
        {PANELS.map((spec) => (
          <div key={spec.id} className={wrapperClass(spec)}>
            <div ref={setInner(spec.id)} className={innerClass(spec)}>
              {renderContent(spec.id)}
            </div>
          </div>
        ))}
        {/* Scroll rail: fills with stage progress; one dot per beat lights up as it starts. */}
        <div aria-hidden="true" className="absolute left-[3vw] top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-3 pointer-events-none select-none">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#39B5C4]/80 [writing-mode:vertical-rl]">Derulează</span>
          <div className="relative w-px h-[30vh] bg-white/15">
            <div ref={railFillRef} className="absolute inset-0 origin-top scale-y-0 bg-gradient-to-b from-[#39B5C4] to-[#2AAF7F]" />
            {BEATS.map((b, i) => (
              <span
                key={b.id}
                ref={(node) => {
                  dotRefs.current[i] = node;
                }}
                data-on={i === 0}
                style={{ top: `${b.range[0] * 100}%` }}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/25 transition-all duration-300 data-[on=true]:bg-[#39B5C4] data-[on=true]:shadow-[0_0_10px_#39B5C4]"
              />
            ))}
          </div>
          <ChevronDown size={16} className="text-[#39B5C4]/80 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
