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
      // If the link is an anchor link (starts with #)
      if (href?.startsWith("#")) {
        e.preventDefault();
        lenis.scrollTo(href, {
          offset: -100,
          duration: 1.5, // Custom duration
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [lenis]);

  return null;
}
