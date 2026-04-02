"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";

const smoothScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
  // External links — let the browser handle them
  if (link.startsWith("http")) return;

  // Hash links — smooth scroll without changing URL
  if (link.startsWith("#")) {
    e.preventDefault();
    const id = link.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
};

export const FloatingNav = ({
  navItems,
  className,
  ctaLabel = "Programează",
  ctaLink = "#booking",
}: {
  navItems: { name: string; link: string; icon?: React.ReactNode }[];
  className?: string;
  ctaLabel?: string;
  ctaLink?: string;
}) => {
  // Start visible
  const [visible, setVisible] = useState(true);
  const lastScrollRef = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    const current = window.scrollY || 0;
    const delta = current - lastScrollRef.current;

    // At the very top — always show
    if (current < 20) {
      setVisible(true);
    }
    // Scrolling down past threshold — hide
    else if (delta > 8) {
      setVisible(false);
    }
    // Scrolling up — show
    else if (delta < -8) {
      setVisible(true);
    }

    lastScrollRef.current = current;
    ticking.current = false;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(handleScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  return (
    <div
      className={`flex max-w-fit fixed top-6 inset-x-0 mx-auto border border-white/[0.15] rounded-full bg-[#000022]/90 backdrop-blur-xl text-white shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.05)] z-[7000] px-6 py-2.5 items-center justify-center space-x-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-28 pointer-events-none"} ${className ?? ""}`}
    >
      <div className="hidden sm:flex space-x-5">
        {navItems.map((navItem, idx) => (
          <a
            key={`link-${idx}`}
            href={navItem.link}
            onClick={(e) => smoothScrollTo(e, navItem.link)}
            className="relative items-center flex space-x-1 text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium cursor-pointer"
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block">{navItem.name}</span>
          </a>
        ))}
      </div>
      <a
        href={ctaLink}
        onClick={(e) => smoothScrollTo(e, ctaLink)}
        className="relative border border-white/[0.15] text-sm font-semibold text-white px-5 py-2 rounded-full bg-gradient-to-r from-[#76007D]/20 to-[#1E94A5]/20 hover:from-[#76007D]/30 hover:to-[#1E94A5]/30 transition-all duration-300 cursor-pointer"
      >
        <span>{ctaLabel}</span>
        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-[#1E94A5] to-transparent h-px" />
      </a>
    </div>
  );
};
