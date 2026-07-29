// app/market/page.tsx
import Link from "next/link";
import { BadgeCheck, ShieldCheck, Truck } from "lucide-react";
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
    desc: "Every listing comes from a farmer whose identity and farm have been verified by AgriBoost.",
  },
  {
    icon: Truck,
    title: "Flexible Delivery",
    desc: "Farmers offer delivery right to your door or convenient pick-up options near you.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "Payments are held in escrow and only released after you confirm your delivery.",
  },
];

export default function PublicMarketPage() {
  return (
    <>
      {/* ── Hero Banner ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500 py-16 px-4">
        {/* decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            🌾 100% locally grown
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Fresh Produce,<br />
            <span className="text-emerald-100">Direct from Farmers.</span>
          </h1>

          <p className="mt-5 text-lg text-white/80 max-w-xl mx-auto">
            Skip the middleman. Browse seasonal fruits, vegetables, and grains
            grown by verified local farmers — and order at the best prices.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              id="hero-signup-cta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-emerald-700 font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-95 transition-all"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              id="hero-login-cta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white/15 border border-white/30 text-white font-bold text-sm backdrop-blur-sm hover:bg-white/25 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Sign In to Order
            </Link>
          </div>
        </div>
      </section>

      {/* ── Perks Strip ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-emerald-100 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {perks.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Produce Listings (reused from internal marketplace) ─── */}
      <section className="pb-16">
        <MarketplaceClient />
      </section>

      {/* ── Sign-Up CTA Banner ────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-500 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Ready to start ordering?
          </h2>
          <p className="mt-3 text-white/80 text-base">
            Create your free buyer account in under a minute. No credit card required.
          </p>
          <Link
            href="/signup"
            id="bottom-signup-cta"
            className="mt-7 inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-emerald-700 font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-95 transition-all"
          >
            Get Started Free →
          </Link>
        </div>
      </section>
    </>
  );
}
