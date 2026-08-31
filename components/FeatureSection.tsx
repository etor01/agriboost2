// components/FeatureSection.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Sparkles, TrendingUp, ShoppingBag, Landmark } from "lucide-react";

export default function FeatureSection() {
  const features = [
    {
      title: "AI Crop Care",
      description:
        "Receive personalized agronomy routines, instant disease identification, and precise fertilizer guides to maximize your harvest yield.",
      icon: "/icons/logobw.png",
      alt: "leaf icon",
      badge: "AI Powered",
    },
    {
      title: "Growth Analytics",
      description:
        "Track planting schedules, projected harvest dates, and farm output with clean data cards and interactive financial metrics.",
      icon: "/icons/stock-market.png",
      alt: "growth icon",
      badge: "Real-time",
    },
    {
      title: "Direct Marketplace",
      description:
        "List produce directly to nationwide buyers with automated escrow fund locking, eliminating intermediaries and ensuring prompt payment.",
      icon: "/icons/trolley.png",
      alt: "cart icon",
      badge: "Escrow Secured",
    },

  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="features"
      className="py-16 md:py-24 bg-gradient-to-b from-zinc-50/50 via-emerald-50/30 to-zinc-50/50 relative overflow-hidden"
    >
      {/* Decorative Soft Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-100/40 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-emerald-800 font-semibold text-xs uppercase tracking-widest bg-emerald-50/90 px-3 py-1 rounded-full backdrop-blur-sm border border-emerald-200/80 mb-3 inline-block shadow-2xs">
            Ecosystem &amp; Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            A Complete Toolkit for <br />
            <span className="text-emerald-600">Modern Farming</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-zinc-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            From seedling diagnosis to guaranteed marketplace payments, AgriBoost
            empowers farmers across Ghana with state-of-the-art agricultural tools.
          </p>
        </div>

        {/* Mobile: Accordion */}
        <div className="md:hidden flex flex-col gap-2.5">
          {features.map((feature, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white/85 backdrop-blur-md border border-white/60 rounded-xl shadow-xs overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center gap-3 p-3.5 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="bg-emerald-50 text-emerald-600 rounded-lg h-9 w-9 flex-shrink-0 flex items-center justify-center border border-emerald-100/80 shadow-2xs">
                    <Image
                      alt={feature.alt}
                      src={feature.icon}
                      width={20}
                      height={20}
                      className="opacity-90"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-zinc-900 block truncate">
                      {feature.title}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                      {feature.badge}
                    </span>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-600" : ""
                      }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-200 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs text-zinc-600 leading-relaxed px-4 pb-3.5 pt-1 pl-[3.5rem]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tablet / Desktop: Card Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto justify-center">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 bg-white/85 backdrop-blur-md border border-white/60 rounded-xl shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="bg-emerald-50 text-emerald-600 rounded-lg h-12 w-12 flex items-center justify-center border border-emerald-100/80 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                    <Image
                      alt={feature.alt}
                      src={feature.icon}
                      width={26}
                      height={26}
                      className="opacity-90"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 mb-2 tracking-tight">
                  {feature.title}
                </h3>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 h-0.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 w-0 transition-all duration-500 ease-out group-hover:w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}