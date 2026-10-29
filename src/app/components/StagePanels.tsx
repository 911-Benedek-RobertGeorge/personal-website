'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Calendar, ChevronDown, X } from 'lucide-react';
import { BEATS, PANELS, panelT, type PanelSpec } from './stage';

type Props = {
  onPrimaryCta: () => void;
  onSecondaryCta: () => void;
};

type Tone = 'red' | 'teal' | 'green';

const TONE = {
  red: { border: 'border-red-500/25', mark: 'text-red-400', line: 'to-red-400/80', dot: 'bg-red-400 shadow-[0_0_10px_#f87171]' },
  teal: { border: 'border-[#39B5C4]/30', mark: 'text-[#39B5C4]', line: 'to-[#39B5C4]/80', dot: 'bg-[#39B5C4] shadow-[0_0_10px_#39B5C4]' },
  green: { border: 'border-[#2AAF7F]/30', mark: 'text-[#2AAF7F]', line: 'to-[#2AAF7F]/80', dot: 'bg-[#2AAF7F] shadow-[0_0_10px_#2AAF7F]' },
} as const;

const glass = 'rounded-xl bg-[#000022]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]';
const card = 'w-[min(30vw,340px)]';
// Cards sit in an arc around the robot, measured from the screen center in vh (his size follows the
// viewport height). Upper cards hug him; lower cards clear his orbiting props (about ±30vh), and
// min() keeps them on screen when the window is narrow.
const TITLE = 'left-1/2 -translate-x-1/2 top-[13vh] w-[min(92vw,900px)] text-center';
const TL = `right-[calc(50%+12vh)] top-[21vh] ${card}`;
const TR = `left-[calc(50%+12vh)] top-[21vh] ${card}`;
const BL = `right-[min(calc(50%+32vh),calc(100%-340px-5vw))] top-[46vh] ${card}`;
const BR = `left-[min(calc(50%+32vh),calc(100%-340px-5vw))] top-[46vh] ${card}`;

// Desktop outer-wrapper position classes per panel id (mobile m-* handled separately).
const POS: Record<string, string> = {
  'wake-headline': 'left-1/2 -translate-x-1/2 top-[12vh] w-[min(92vw,760px)] text-center',
  'pains-title': TITLE,
  'pains-1': TL,
  'pains-2': TR,
  'pains-3': BL,
  'method-title': TITLE,
  'method-1': TL,
  'method-2': TR,
  'method-3': BL,
  'method-4': BR,
  'process-title': TITLE,
  'process-1': TL,
  'process-2': TR,
  'process-3': BL,
  'process-4': BR,
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

function HudCard({ tone, mark, title, body }: { tone: Tone; mark: React.ReactNode; title: string; body: string }) {
  const t = TONE[tone];
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#000022]/70 backdrop-blur-xl border ${t.border} shadow-[0_8px_32px_rgba(0,0,0,0.35)] px-6 py-5`}>
      <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-[#76007D] via-[#1E94A5] to-[#2AAF7F] opacity-70" />
      <div className={`font-mono text-xs tracking-widest ${t.mark}`}>{mark}</div>
      <div className="mt-1 text-white text-lg font-semibold leading-snug">{title}</div>
      <p className="mt-1.5 text-slate-300 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

// A line and a dot from the card's inner edge toward the robot, so each card reads as a callout on him.
function Callout({ side, tone, children }: { side: 'left' | 'right'; tone: Tone; children: React.ReactNode }) {
  const t = TONE[tone];
  return (
    <div className="relative">
      {children}
      <span aria-hidden="true" className={`absolute top-1/2 h-px w-[5vh] from-white/10 ${t.line} ${side === 'left' ? 'left-full bg-gradient-to-r' : 'right-full bg-gradient-to-l'}`} />
      <span aria-hidden="true" className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${t.dot} ${side === 'left' ? 'left-[calc(100%+5vh)]' : 'right-[calc(100%+5vh)]'}`} />
    </div>
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
    { title: 'Date copiate de mână', body: 'Aceeași informație introdusă de mai multe ori, în sisteme diferite.' },
    { title: 'Cereri care așteaptă un om', body: 'Oferte, aprobări și răspunsuri care stau zile întregi în inbox.' },
    { title: 'Verificări făcute manual', body: 'Ore în fiecare săptămână pe controale și rapoarte repetitive.' },
  ];

  const method = [
    { n: '01', title: 'Urmăresc fluxul', body: 'De la cerere la livrare: cine face ce și cu ce unelte.' },
    { n: '02', title: 'Găsesc așteptările', body: 'Unde stă munca și unde se repetă de mână.' },
    { n: '03', title: 'Calculez costul', body: 'Câte ore și câți bani consumă fiecare pas, în fiecare lună.' },
    { n: '04', title: 'Aleg blocajul', body: 'Pasul unde automatizarea aduce cel mai mult, cel mai repede.' },
  ];

  const solve = [
    { n: '05', title: 'Prototip', body: 'Un agent AI care preia pasul blocat, testat pe datele tale.' },
    { n: '06', title: 'Integrare', body: 'Îl conectez la sistemele pe care le folosești deja.' },
    { n: '07', title: 'Măsurăm', body: 'Vedem cât timp și câți bani câștigi.' },
    { n: '08', title: 'Următorul blocaj', body: 'Rezolvi unul și apare altul. Îl luăm și pe el.' },
  ];

  const painCards = pains.map((x) => <HudCard key={x.title} tone="red" mark={<X size={14} />} title={x.title} body={x.body} />);
  const methodCards = method.map((x) => <HudCard key={x.n} tone="teal" mark={x.n} title={x.title} body={x.body} />);
  const solveCards = solve.map((x) => <HudCard key={x.n} tone="green" mark={x.n} title={x.title} body={x.body} />);

  const stepList = (steps: { n: string; title: string; body: string }[]) => (
    <ol className="space-y-2">
      {steps.map((s) => (
        <li key={s.n} className="flex items-start gap-2 text-xs text-slate-300">
          <span className="font-mono text-[#2AAF7F] shrink-0">{s.n}</span>
          <span><span className="text-white font-semibold">{s.title}</span> — {s.body}</span>
        </li>
      ))}
    </ol>
  );

  const title = (text: string) => <h2 className="text-3xl md:text-4xl font-bold text-white">{text}</h2>;

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
    'pains-title': title('Blocaje pe care le au multe firme'),
    'pains-1': <Callout side="left" tone="red">{painCards[0]}</Callout>,
    'pains-2': <Callout side="right" tone="red">{painCards[1]}</Callout>,
    'pains-3': <Callout side="left" tone="red">{painCards[2]}</Callout>,
    'method-title': title('Cum găsesc blocajul tău'),
    'method-1': <Callout side="left" tone="teal">{methodCards[0]}</Callout>,
    'method-2': <Callout side="right" tone="teal">{methodCards[1]}</Callout>,
    'method-3': <Callout side="left" tone="teal">{methodCards[2]}</Callout>,
    'method-4': <Callout side="right" tone="teal">{methodCards[3]}</Callout>,
    'process-title': title('Cum îl rezolvăm'),
    'process-1': <Callout side="left" tone="green">{solveCards[0]}</Callout>,
    'process-2': <Callout side="right" tone="green">{solveCards[1]}</Callout>,
    'process-3': <Callout side="left" tone="green">{solveCards[2]}</Callout>,
    'process-4': <Callout side="right" tone="green">{solveCards[3]}</Callout>,
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
    'm-pains': (
      <div className={`${glass} border-red-500/20 px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Blocaje pe care le au multe firme</h2>
        <ul className="space-y-2">
          {pains.map((pn) => (
            <li key={pn.title} className="flex items-start gap-2 text-xs text-slate-300"><X size={12} className="text-red-400 mt-0.5 shrink-0" /><span><span className="text-white font-semibold">{pn.title}</span> — {pn.body}</span></li>
          ))}
        </ul>
      </div>
    ),
    'm-method': (
      <div className={`${glass} border-[#39B5C4]/25 px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Cum găsesc blocajul tău</h2>
        {stepList(method)}
      </div>
    ),
    'm-process': (
      <div className={`${glass} border-[#2AAF7F]/25 px-5 py-5`}>
        <h2 className="text-lg font-bold text-white mb-3">Cum îl rezolvăm</h2>
        {stepList(solve)}
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
          {content['pains-title']}
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl">{painCards}</div>
        </div>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-5">
          {content['method-title']}
          <div className="grid md:grid-cols-4 gap-4 max-w-6xl">{methodCards}</div>
        </div>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-5">
          {content['process-title']}
          <div className="grid md:grid-cols-4 gap-4 max-w-6xl">{solveCards}</div>
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
