// app/about/page.tsx
import React from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import {
  GraduationCap,
  Sprout,
  Cpu,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  MapPin,
  HeartHandshake,
  Code2,
} from "lucide-react";

export const metadata = {
  title: "About Us | AgriBoost",
  description:
    "Learn about AgriBoost — a KNUST final-year capstone project by Etornam and Doreen digitizing Ghanaian agriculture with AI.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-emerald-50/20 to-zinc-50 text-zinc-900 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="pt-28 sm:pt-32 pb-20 px-4 sm:px-6 max-w-6xl mx-auto w-full flex-grow space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>KNUST Final Year Capstone Project</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Digitizing Ghana&apos;s Agriculture in the{" "}
            <span className="text-emerald-600">AI &amp; Smart Era</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            AgriBoost was conceived as an academic final-year project at Kwame
            Nkrumah University of Science and Technology (KNUST). Developed by{" "}
            <strong className="text-zinc-900">Etornam</strong> and{" "}
            <strong className="text-zinc-900">Doreen</strong>, AgriBoost explores
            how modern web architectures, instant escrow trade, and artificial
            intelligence can empower Ghanaian farmers.
          </p>
        </section>

        {/* Academic Project Status Disclaimer Banner */}
        <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm border border-emerald-800/60 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3 max-w-3xl">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-800/80 px-2.5 py-0.5 rounded-full border border-emerald-700/80 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              <span>Project Status &amp; Beta Research</span>
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              A Student Prototype for Real-World Agricultural Impact
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm md:text-base leading-relaxed">
              AgriBoost is currently an <strong>academic research initiative</strong> and graduation thesis project. While fully operational for testing and demonstration, it operates as a prototype to illustrate how digital technology can eliminate intermediaries and detect crop diseases across Ghana.
            </p>
          </div>
        </section>

        {/* The Founders / Student Team */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Meet the Student Creators
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
              Driven by two final-year students at KNUST passionate about agricultural technology and software innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Etornam */}
            <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-xl p-6 sm:p-7 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 flex items-center justify-center font-bold text-lg shadow-2xs">
                  E
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Etornam</h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    Co-Creator &amp; Full-Stack Architect
                  </p>
                  <p className="text-[11px] text-zinc-400">KNUST, Kumasi</p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Spearheaded the full-stack architecture, Supabase cloud database models, offline PWA infrastructure, and integrated the deep learning models for crop disease scanning.
              </p>
              <div className="pt-2 border-t border-zinc-100 flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
                <Code2 className="w-3.5 h-3.5" />
                <span>Core System &amp; AI Integration</span>
              </div>
            </div>

            {/* Doreen */}
            <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-xl p-6 sm:p-7 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-teal-100/80 text-teal-800 border border-teal-200/80 flex items-center justify-center font-bold text-lg shadow-2xs">
                  D
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Doreen</h3>
                  <p className="text-xs font-semibold text-teal-700">
                    Co-Creator &amp; Product Designer
                  </p>
                  <p className="text-[11px] text-zinc-400">KNUST, Kumasi</p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Focused on agricultural UX research, marketplace escrow mechanics, accessibility for Ghanaian smallholders, and intuitive visual data reporting for farm managers.
              </p>
              <div className="pt-2 border-t border-zinc-100 flex items-center gap-2 text-[11px] text-teal-700 font-medium">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Agricultural UX &amp; Trade Dynamics</span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              What AgriBoost Demonstrates
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
              Key agricultural digital innovations built into our prototype.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/85 backdrop-blur-md rounded-xl p-6 border border-white/60 shadow-xs hover:border-emerald-500/40 transition-all space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-2xs">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Smart Farm Tracking</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Log crop schedules, track acreage, monitor weeding cycles, and keep yield records all in one intuitive interface.
              </p>
            </div>

            <div className="bg-white/85 backdrop-blur-md rounded-xl p-6 border border-white/60 shadow-xs hover:border-emerald-500/40 transition-all space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-violet-50 text-violet-600 border border-violet-200/60 shadow-2xs">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">AI Crop Diagnostics</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Leveraging machine learning assistance to diagnose potential crop diseases early and offer agronomy treatment suggestions.
              </p>
            </div>

            <div className="bg-white/85 backdrop-blur-md rounded-xl p-6 border border-white/60 shadow-xs hover:border-emerald-500/40 transition-all space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-sky-50 text-sky-600 border border-sky-200/60 shadow-2xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Escrow Marketplace</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Connecting local produce buyers directly with Ghanaian farmers with secure fund protection, cutting middleman losses.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl p-8 sm:p-10 shadow-xs space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Explore the Beta Platform
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
            Test out our features, view live metrics, or send us your feedback as we refine our final-year project.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow-2xs transition-colors flex items-center gap-2 active:scale-95"
            >
              <span>Try Beta Access</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-white/90 hover:bg-white text-zinc-800 border border-zinc-200/90 font-medium text-xs sm:text-sm rounded-lg shadow-2xs transition-colors"
            >
              Contact Team
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

