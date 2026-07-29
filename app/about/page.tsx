import React from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { GraduationCap, Sprout, Cpu, ShoppingBag, Users, Target, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Us | AgriBoost",
  description: "Learn about AgriBoost — a KNUST final-year project by Etornam and Doreen digitizing Ghanaian agriculture with AI.",
};

export default function AboutPage() {
  return (
    <div className="bg-gray-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
      <Header />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto w-full flex-grow space-y-16">
        {/* Hero Section */}
        <section className="relative text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-green-600" />
            KNUST Final Year Capstone Project
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Onboarding Ghana&apos;s Agricultural Ecosystem into the <span className="text-green-600">Digital & AI Era</span>
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
            AgriBoost was conceived as an academic final-year project at Kwame Nkrumah University of Science and Technology (KNUST). Developed by <strong>Etornam</strong> and <strong>Doreen</strong>, AgriBoost explores how modern web tools, real-time metrics, and artificial intelligence can simplify farm management, empower local farmers, and bridge market gaps in Ghana.
          </p>
        </section>

        {/* Academic Project Status Disclaimer Banner */}
        <section className="bg-emerald-900 text-white rounded-3xl p-8 md:p-10 shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-700/30 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-300 bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-700">
              Project Status & Disclaimer
            </span>
            <h2 className="text-2xl md:text-3xl font-bold">A Student Prototype for Real Impact</h2>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
              AgriBoost is currently a <strong>Beta research initiative</strong> and final-year graduation thesis project. While fully functional for testing, AgriBoost is not operating as a commercial corporate enterprise. Our goal is to demonstrate practical software engineering and AI solutions tailored specifically to the needs of Ghanaian farmers and agricultural stakeholders.
            </p>
          </div>
        </section>

        {/* The Founders / Student Team */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Meet the Student Leads</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
              The project is driven by two final-year students at KNUST passionate about agricultural technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center font-bold text-xl">
                E
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Etornam</h3>
                <p className="text-xs font-semibold uppercase text-green-600 tracking-wider mt-0.5">
                  Co-Creator & Developer (KNUST)
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Focused on full-stack web architecture, backend infrastructure, and integrating AI diagnostic services tailored for local crop health monitoring.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
                D
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Doreen</h3>
                <p className="text-xs font-semibold uppercase text-emerald-600 tracking-wider mt-0.5">
                  Co-Creator & Developer (KNUST)
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Focused on agricultural user experience design, marketplace mechanics, and data visualization to make complex farm metrics accessible to every farmer.
              </p>
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">What AgriBoost Demonstrates</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
              Key agricultural digital innovations built into our platform prototype.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <div className="p-3 w-fit rounded-2xl bg-green-50 text-green-600">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smart Farm Tracking</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Log crop schedules, track acreage, monitor weeding cycles, and keep yield records all in one intuitive interface.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <div className="p-3 w-fit rounded-2xl bg-purple-50 text-purple-600">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Crop Insights</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Leveraging machine learning assistance to diagnose potential crop diseases early and offer agronomy suggestions.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <div className="p-3 w-fit rounded-2xl bg-sky-50 text-sky-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Direct Marketplace</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connecting local produce buyers directly with Ghanaian farmers to eliminate unnecessary middlemen and reduce post-harvest waste.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-green-50 border border-green-200/80 rounded-3xl p-10 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Explore the Beta Platform</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Test out our features, view live metrics, or send us your feedback as we refine our final-year project.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-full shadow-md transition-all flex items-center gap-2"
            >
              Try Beta Access <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-sm rounded-full transition-all"
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
