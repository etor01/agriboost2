// app/privacy/page.tsx
import React from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { ShieldCheck, Info, Lock, Eye, FileText, Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | AgriBoost",
  description:
    "Privacy Policy and academic data handling practices for AgriBoost — a KNUST final-year student project.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-emerald-50/20 to-zinc-50 text-zinc-900 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="pt-28 sm:pt-32 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full flex-grow space-y-8 sm:space-y-10">
        {/* Header */}
        <section className="space-y-3 border-b border-zinc-200/80 pb-6 pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Transparency &amp; Ethics</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            Last Updated: July 2026 &bull; AgriBoost Academic Beta Project (KNUST)
          </p>
        </section>

        {/* Academic Context Banner */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl p-4 sm:p-5 flex items-start gap-3 text-emerald-950 text-xs sm:text-sm leading-relaxed shadow-2xs">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong>Academic Project Notice:</strong> AgriBoost is a final-year graduation capstone project at Kwame Nkrumah University of Science and Technology (KNUST), Kumasi, Ghana, authored by <strong>Etornam</strong> and <strong>Doreen</strong>. Any data submitted during beta testing is handled responsibly and strictly for testing platform features and AI diagnostic capabilities.
          </div>
        </div>

        {/* Policy Body Content */}
        <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs space-y-8 text-zinc-700 leading-relaxed text-xs sm:text-sm">
          {/* Section 1 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <Eye className="w-4 h-4" />
              </div>
              <span>1. Information We Collect</span>
            </div>
            <p className="text-zinc-600">
              When you register or interact with the AgriBoost beta web platform, we may collect the following limited information:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-600 pl-1">
              <li>
                <strong className="text-zinc-900">Account Credentials &amp; Profile:</strong> Full name, email address, user role (Farmer or Buyer), and optional farm location.
              </li>
              <li>
                <strong className="text-zinc-900">Farm &amp; Agricultural Data:</strong> Parcel acreage, crop varieties, planting schedules, and projected harvest logs.
              </li>
              <li>
                <strong className="text-zinc-900">Diagnostic Images:</strong> Crop leaf images uploaded for AI plant disease analysis and model accuracy evaluation.
              </li>
              <li>
                <strong className="text-zinc-900">Marketplace Postings:</strong> Produce listings, price quotes, unit sizes, and order records created during transactions.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/80">
                <FileText className="w-4 h-4" />
              </div>
              <span>2. How We Use Your Information</span>
            </div>
            <p className="text-zinc-600">
              Because AgriBoost is an academic research prototype, collected data is used exclusively to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-600 pl-1">
              <li>Provide essential web platform features (dashboard logging, simulated escrow payments, and produce catalogs).</li>
              <li>Train, validate, and evaluate deep learning image diagnostic models for tropical crop health as part of our KNUST project deliverables.</li>
              <li>Analyze aggregated system interactions to optimize offline PWA performance and usability.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200/80">
                <Lock className="w-4 h-4" />
              </div>
              <span>3. Data Protection &amp; Non-Commercialization</span>
            </div>
            <p className="text-zinc-600">
              We prioritize responsible data ethics:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-600 pl-1">
              <li>
                <strong className="text-zinc-900">No Commercial Monetization:</strong> We do not sell, rent, or trade personal or farm data to commercial advertisers or data brokers.
              </li>
              <li>
                <strong className="text-zinc-900">Aggregated Metrics:</strong> Public analytics (such as total acreage or diagnostic volume) are displayed strictly as anonymized totals.
              </li>
              <li>
                <strong className="text-zinc-900">Cloud Protection:</strong> Authentication and database storage are protected with Supabase Row Level Security (RLS).
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>4. Data Deletion &amp; Inquiries</span>
            </div>
            <p className="text-zinc-600">
              Users participating in our beta test may request deletion of their account or farm logs at any time during the evaluation phase.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                <span>Contact the Student Leads (Etornam &amp; Doreen)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

