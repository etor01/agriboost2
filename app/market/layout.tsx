// app/market/layout.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export const metadata = {
  title: "Fresh Produce Market | AgriBoost",
  description:
    "Browse fresh, locally grown produce directly from verified farmers across Ghana. Sign up to start ordering.",
};

export default function MarketLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      {/* ── Top Navigation ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
              <Image
                src="/icons/logo.png"
                alt="AgriBoost"
                width={22}
                height={22}
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-sm font-bold text-zinc-900 tracking-tight">
                Agri<span className="text-emerald-600">Boost</span>
              </span>
              <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider leading-none">
                Marketplace
              </p>
            </div>
          </Link>

          {/* Tagline — hidden on mobile */}
          <p className="hidden md:block text-xs text-zinc-500 font-medium">
            Farm-to-table produce directly from verified Ghanaian farmers
          </p>

          {/* Auth CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-zinc-700 border border-zinc-200 bg-white hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-2xs"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page Content ─────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-zinc-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} AgriBoost Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <Link href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-900 transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-zinc-900 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

