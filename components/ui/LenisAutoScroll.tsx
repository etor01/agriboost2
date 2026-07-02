"use client";
import { useLenis } from "lenis/react";
import { useEffect } from "react";

export default function LenisAutoScroll() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return; // Wait for lenis to be available

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const hash = href.slice(hashIndex);
      if (hash.length <= 1) return;

      const targetUrl = new URL(href, window.location.href);
      const isSamePageLink =
        targetUrl.origin === window.location.origin &&
        targetUrl.pathname === window.location.pathname;

      if (isSamePageLink) {
        e.preventDefault();
        lenis.scrollTo(hash, {
          offset: -100,
          duration: 1.5,
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [lenis]);

  return null;
}
