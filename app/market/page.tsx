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
      {/* ── Perks Strip ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-emerald-100 py-8 mt-8 px-4">
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
