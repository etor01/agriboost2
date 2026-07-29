import React from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { FileText, AlertTriangle, Cpu, CheckSquare, GraduationCap } from "lucide-react";

export const metadata = {
  title: "Terms of Service | AgriBoost",
  description: "Terms of Service and Beta usage agreement for AgriBoost — a KNUST final-year student project.",
};

export default function TermsPage() {
  return (
    <div className="bg-gray-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
      <Header />

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto w-full flex-grow space-y-10">
        {/* Header */}
        <section className="space-y-4 border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-4 h-4 text-green-600" />
            Beta Usage Terms
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>

          <p className="text-sm text-slate-500 font-medium">
            Last Updated: July 2026 &bull; AgriBoost Academic Beta Project (KNUST)
          </p>
        </section>

        {/* Academic Context Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3 text-slate-700 text-sm leading-relaxed">
          <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong>Academic Beta Disclaimer:</strong> AgriBoost is a final-year student graduation capstone project developed at Kwame Nkrumah University of Science and Technology (KNUST), Kumasi, Ghana, by <strong>Etornam</strong> and <strong>Doreen</strong>. By accessing or testing this web application, you acknowledge its status as an academic prototype.
          </div>
        </div>

        {/* Terms Body */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm md:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <CheckSquare className="w-5 h-5 text-green-600" /> 1. Acceptance of Beta Terms
            </div>
            <p>
              By creating an account or exploring AgriBoost, you agree to these Terms of Service. If you are participating in our beta test phase, your feedback will help refine our final-year project deliverables.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <Cpu className="w-5 h-5 text-green-600" /> 2. AI Advisory & Crop Diagnostic Disclaimer
            </div>
            <p>
              AgriBoost incorporates experimental machine learning algorithms for crop health diagnosis and agronomy recommendations:
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs md:text-sm space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Educational Assistance Only
              </div>
              <p>
                AI diagnosis outputs are provided strictly as automated decision-support tools. Users should cross-reference diagnostic suggestions with certified Ghanaian agricultural extension officers or qualified agronomists before applying heavy chemical treatments or critical farm inputs.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <FileText className="w-5 h-5 text-green-600" /> 3. Marketplace & Transactions
            </div>
            <p>
              The marketplace module is built to demonstrate direct digital trade between farmers and produce buyers in Ghana. During the beta evaluation period, transactions and listings are conducted for testing and system verification purposes.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <GraduationCap className="w-5 h-5 text-green-600" /> 4. Intellectual Property & Academic Project Status
            </div>
            <p>
              The AgriBoost application design, source code, and project documentation were authored by <strong>Etornam</strong> and <strong>Doreen</strong> for academic evaluation at KNUST. All original logos, UI assets, and custom code remain the property of the project authors.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <AlertTriangle className="w-5 h-5 text-green-600" /> 5. Limitation of Liability
            </div>
            <p className="text-slate-600">
              As an academic final-year student project provided free of charge during testing, AgriBoost is provided on an &quot;as is&quot; and &quot;as available&quot; basis without commercial warranties. The project authors and KNUST assume no financial liability for farming outcomes or production decisions made during the beta testing phase.
            </p>
            <p className="text-slate-600 pt-2">
              For any questions regarding these terms, please visit our{" "}
              <Link href="/contact" className="text-green-600 font-semibold underline hover:text-green-700">
                Contact Page
              </Link>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
