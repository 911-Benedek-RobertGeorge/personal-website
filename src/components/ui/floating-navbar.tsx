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
      className={`flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[7000] px-4 py-2 items-center justify-center space-x-4 transition-all duration-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-24"} ${className ?? ""}`}
    >
      <div className="hidden sm:flex space-x-4">
        {navItems.map((navItem, idx) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            className={"relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500"}
           
           >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </a>
        ))}
      </div>
      <a href={ctaLink} className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full">
        <span>{ctaLabel}</span>
        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
      </a>
    </div>
  );
};
