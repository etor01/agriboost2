// app/market/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { BadgeCheck, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import MarketplaceClient from "@/app/marketplace/MarketplaceClient";

export const metadata = {
  title: "Fresh Produce Market | AgriBoost",
  description:
    "Browse fresh, locally grown produce directly from verified farmers across Ghana. No account needed to browse.",
};

const perks = [
  {
    icon: BadgeCheck,
    title: "Verified Farmers",
    desc: "Every listing comes from an identity-verified and agronomy-audited farmer across Ghana.",
  },
  {
    icon: Truck,
    title: "Reliable Logistics",
    desc: "Direct farm dispatch, standard courier delivery, or convenient pickup points.",
  },
  {
    icon: ShieldCheck,
    title: "Escrow Protected",
    desc: "Funds are locked in escrow and only released to the farmer after you verify receipt with your OTP.",
  },
];

export default function PublicMarketPage() {
  return (
    <>
      {/* ── Perks Strip ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-zinc-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {perks.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-3.5 rounded-lg border border-zinc-200 bg-zinc-50/50 shadow-2xs"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">{title}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Produce Listings (reused from internal marketplace) ─── */}
      <section className="pb-12">
        <Suspense
          fallback={
            <div className="min-h-96 animate-pulse bg-zinc-100/50 flex items-center justify-center">
              <span className="text-xs text-zinc-400">Loading marketplace…</span>
            </div>
          }
        >
          <MarketplaceClient />
        </Suspense>
      </section>

      {/* ── Sign-Up CTA Banner ────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-zinc-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-emerald-800/40">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
            Join the Agritech Network
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ready to order farm-fresh produce?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl mx-auto">
            Create your free account in less than a minute. Secure your orders with built-in escrow protection and real-time tracking.
          </p>
          <div className="pt-3">
            <Link
              href="/signup"
              id="bottom-signup-cta"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs sm:text-sm transition-colors shadow-sm"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

