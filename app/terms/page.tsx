// app/terms/page.tsx
import React from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import {
  FileText,
  AlertTriangle,
  Cpu,
  CheckSquare,
  GraduationCap,
  ShoppingBag,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Terms of Service | AgriBoost",
  description:
    "Terms of Service and Beta usage agreement for AgriBoost — a KNUST final-year student project.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-emerald-50/20 to-zinc-50 text-zinc-900 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="pt-28 sm:pt-32 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full flex-grow space-y-8 sm:space-y-10">
        {/* Header */}
        <section className="space-y-3 border-b border-zinc-200/80 pb-6 pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Beta Usage Terms</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Terms of Service
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            Last Updated: July 2026 &bull; AgriBoost Academic Beta Project (KNUST)
          </p>
        </section>

        {/* Academic Context Banner */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl p-4 sm:p-5 flex items-start gap-3 text-emerald-950 text-xs sm:text-sm leading-relaxed shadow-2xs">
          <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong>Academic Beta Disclaimer:</strong> AgriBoost is a final-year student graduation capstone project developed at Kwame Nkrumah University of Science and Technology (KNUST), Kumasi, Ghana, by <strong>Etornam</strong> and <strong>Doreen</strong>. By accessing or testing this web application, you acknowledge its status as an academic prototype.
          </div>
        </div>

        {/* Terms Body */}
        <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs space-y-8 text-zinc-700 leading-relaxed text-xs sm:text-sm">
          {/* Section 1 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span>1. Acceptance of Beta Terms</span>
            </div>
            <p className="text-zinc-600">
              By creating an account, browsing listings, or using diagnostic tools on AgriBoost, you agree to these Terms of Service. Your interaction as a beta evaluator provides essential data to validate our thesis project.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80">
                <Cpu className="w-4 h-4" />
              </div>
              <span>2. AI Advisory &amp; Crop Diagnostic Disclaimer</span>
            </div>
            <p className="text-zinc-600">
              AgriBoost incorporates experimental deep learning algorithms for crop health diagnosis and agronomy recommendations:
            </p>
            <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-xl text-amber-950 text-xs space-y-1 shadow-2xs">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <span>Decision Support Only</span>
              </div>
              <p className="text-amber-900/90 leading-relaxed">
                AI outputs serve as educational assistive indicators. Always cross-check automated diagnostic findings with a certified Ghanaian agricultural extension officer or agronomist before administering potent chemical treatments or critical soil inputs.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/80">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span>3. Marketplace &amp; Escrow Transactions</span>
            </div>
            <p className="text-zinc-600">
              The marketplace module demonstrates direct peer-to-peer trade with fund locking. During the beta evaluation phase, all transactions, listings, and delivery steps are conducted for platform verification and workflow simulation.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200/80">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>4. Authorship &amp; Intellectual Property</span>
            </div>
            <p className="text-zinc-600">
              The AgriBoost software architecture, source code, and design assets were authored by <strong>Etornam</strong> and <strong>Doreen</strong> for academic submission at KNUST. Original trademarks, logos, and custom code remain the intellectual property of the student authors.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm sm:text-base">
              <div className="p-1.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span>5. Limitation of Liability</span>
            </div>
            <p className="text-zinc-600">
              As an academic final-year project provided free of charge during beta testing, AgriBoost is provided on an &quot;as is&quot; basis without commercial warranties. The project authors and KNUST assume no financial liability for farming outcomes or production decisions made during testing.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                <span>Have questions? Contact the Project Team</span>
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

