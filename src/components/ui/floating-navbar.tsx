"use client";
import React, { useEffect, useState } from "react";

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
  const [visible, setVisible] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY || 0;
      const direction = current - lastScroll;
      if (current < 50) setVisible(false);
      else setVisible(direction < 0);
      setLastScroll(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScroll]);

  return (
    <div
      className={`flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-white/[0.2] rounded-full bg-[#000022] text-white shadow-[0_0_20px_rgba(0,0,0,0.35)] z-[7000] px-4 py-2 items-center justify-center space-x-4 transition-all duration-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-24"} ${className ?? ""}`}
    >
      <div className="hidden sm:flex space-x-4">
        {navItems.map((navItem, idx) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            className={"relative items-center flex space-x-1 text-white hover:text-neutral-300"}
           
           >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </a>
        ))}
      </div>
      <a href={ctaLink} className="border text-sm font-medium relative border-white/[0.2] text-white px-4 py-2 rounded-full">
        <span>{ctaLabel}</span>
        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
      </a>
    </div>
  );
};
