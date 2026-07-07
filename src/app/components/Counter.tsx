'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

type Props = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  active: boolean;
  duration?: number;
  className?: string;
};

// Counts 0 -> to with an ease-out once `active` first becomes true.
export default function Counter({ to, decimals = 0, prefix = '', suffix = '', active, duration = 1200, className }: Props) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    if (to === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      flushSync(() => setDisplay(to));
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(to * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, to, duration]);

  return (
    <span className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
