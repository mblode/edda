"use client";

import { useEffect, useRef } from "react";

let savedScrollTop = 0;

export const SidebarScrollArea = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    if (savedScrollTop > 0) {
      el.scrollTop = savedScrollTop;
      return;
    }

    // Defer to allow SidebarActiveHighlight to mark the active link first.
    const id = requestAnimationFrame(() => {
      const active = el.querySelector<HTMLElement>("[data-active]");
      if (active) {
        active.scrollIntoView({ behavior: "instant", block: "center" });
      }
    });
    return () => cancelAnimationFrame(id);
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        savedScrollTop = el.scrollTop;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={scrollRef} className={className}>
      {children}
    </div>
  );
};
