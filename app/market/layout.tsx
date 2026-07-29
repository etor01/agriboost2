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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* ── Top Navigation ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-100/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
              <Image
                src="/icons/logo.png"
                alt="AgriBoost"
                width={22}
                height={22}
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-base font-bold text-gray-900 tracking-tight">
                AgriBoost
              </span>
              <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider leading-none">
                Fresh Market
              </p>
            </div>
          </Link>

          {/* Tagline — hidden on mobile */}
          <p className="hidden md:block text-sm text-gray-500 font-medium">
            🌿 Farm-to-table, straight from verified farmers
          </p>

          {/* Auth CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-emerald-700 border border-emerald-200 bg-white hover:bg-emerald-50 transition-all hover:scale-[1.02] active:scale-95"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow-md shadow-emerald-200 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page Content ─────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-emerald-100 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} AgriBoost · Empowering African farmers.</p>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <Link href="/login" className="hover:text-emerald-600 transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-emerald-600 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
