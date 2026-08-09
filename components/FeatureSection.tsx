"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function FeatureSection() {
  const features = [
    {
      title: "AI Crop Care",
      description:
        "Receive personalized routines, disease detection, and fertilizer guides to maximize your yield.",
      icon: "/icons/logobw.png",
      alt: "leaf icon",
    },
    {
      title: "Growth Analytics",
      description:
        "Monitor your farm's performance with easy-to-understand dashboards and reports.",
      icon: "/icons/stock-market.png",
      alt: "growth icon",
    },
    {
      title: "Direct Marketplace",
      description:
        "List your harvest and sell directly to buyers, cutting out the middleman and increasing profits.",
      icon: "/icons/trolley.png",
      alt: "cart icon",
    },
    {
      title: "Financial Tools",
      description:
        "Access equipment funding, loans, and investment opportunities to grow your farming business.",
      icon: "/icons/profit.png",
      alt: "money icon",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="features"
      className="py-16 md:py-24 bg-green-50/50 relative overflow-hidden"
    >
      {/* Decorative soft glow for depth */}
      <div className="absolute -top-16 -right-16 w-64 h-64 md:-top-24 md:-right-24 md:w-96 md:h-96 bg-green-200/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12 md:mb-20">
          <span className="text-green-600 font-bold text-xs uppercase tracking-widest bg-green-100/50 px-4 py-1.5 rounded-full backdrop-blur-sm border border-green-200/20 mb-4 inline-block">
            Our Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            A Complete Toolkit for <br />
            <span className="text-green-600">Modern Farming</span>
          </h2>
          <p className="text-base text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed">
            From planting to selling, AgriBoost provides the tools you need to
            succeed in the digital age.
          </p>
        </div>

        {/* Mobile: accordion */}
        <div className="md:hidden flex flex-col gap-3">
          {features.map((feature, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="bg-green-50 text-green-600 rounded-full h-11 w-11 flex-shrink-0 flex items-center justify-center shadow-sm border border-green-100">
                    <Image
                      alt={feature.alt}
                      src={feature.icon}
                      width={24}
                      height={24}
                      className="opacity-90"
                    />
                  </div>

                  <span className="flex-1 text-base font-bold text-slate-900 tracking-tight">
                    {feature.title}
                  </span>

                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-slate-600 leading-relaxed px-4 pb-4 pl-[3.75rem]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tablet/Desktop: card grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all duration-500 hover:scale-[1.02] hover:bg-white/90 active:scale-95"
            >
              <div className="bg-green-50 text-green-600 rounded-full h-14 w-14 flex items-center justify-center mb-8 shadow-sm transition-transform duration-500 group-hover:rotate-[10deg] border border-green-100">
                <Image
                  alt={feature.alt}
                  src={feature.icon}
                  width={32}
                  height={32}
                  className="opacity-90 grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
                {feature.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>

              <div className="mt-8 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 w-0 transition-all duration-700 ease-out group-hover:w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}