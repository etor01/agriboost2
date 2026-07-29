import React from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { ShieldCheck, Info, Lock, Eye, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | AgriBoost",
  description: "Privacy Policy and academic data handling practices for AgriBoost — a KNUST final-year student project.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
      <Header />

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto w-full flex-grow space-y-10">
        {/* Header */}
        <section className="space-y-4 border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Data Transparency & Ethics
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>

          <p className="text-sm text-slate-500 font-medium">
            Last Updated: July 2026 &bull; AgriBoost Academic Beta Project (KNUST)
          </p>
        </section>

        {/* Academic Context Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3 text-slate-700 text-sm leading-relaxed">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong>Academic Project Notice:</strong> AgriBoost is a final-year graduation capstone project at Kwame Nkrumah University of Science and Technology (KNUST), Kumasi, Ghana, authored by <strong>Etornam</strong> and <strong>Doreen</strong>. Any data submitted during beta testing is handled responsibly and strictly for testing platform features and AI diagnostic capabilities.
          </div>
        </div>

        {/* Policy Body Content */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm md:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <Eye className="w-5 h-5 text-green-600" /> 1. Information We Collect
            </div>
            <p>
              When you register or interact with the AgriBoost beta web platform, we may collect the following limited information:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
              <li><strong>Account Credentials & Profile:</strong> Full name, email address, user role (Farmer, Buyer, or Extension Officer), and location details if provided.</li>
              <li><strong>Farm & Agricultural Data:</strong> Farm parcel size (acres), crop types, planted dates, and yield estimates logged into the dashboard.</li>
              <li><strong>Diagnostic Images:</strong> Crop leaf images uploaded for AI plant disease analysis.</li>
              <li><strong>Marketplace Postings:</strong> Produce listings, price quotes, and quantity figures created by users.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <FileText className="w-5 h-5 text-green-600" /> 2. How We Use Your Information
            </div>
            <p>
              Because AgriBoost is an academic research prototype, collected data is used exclusively to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
              <li>Provide essential web platform features (e.g., dashboard tracking, marketplace connections, escrow simulation).</li>
              <li>Train, validate, and evaluate AI image diagnostic models for tropical crop health as part of our KNUST project deliverables.</li>
              <li>Analyze aggregated user engagement to refine system performance and user experience.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <Lock className="w-5 h-5 text-green-600" /> 3. Data Protection & Non-Commercialization
            </div>
            <p>
              We prioritize data privacy and transparency:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
              <li><strong>No Data Monetization:</strong> We do not sell, rent, or trade any personal or agricultural data to third-party advertisers or commercial entities.</li>
              <li><strong>Anonymized Metrics:</strong> Public dashboard statistics (such as overall cultivated acreage or diagnostic counts) are displayed only as aggregated, anonymized figures.</li>
              <li><strong>Secure Infrastructure:</strong> User authentication and data storage are secured using Supabase cloud security protocols.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <ShieldCheck className="w-5 h-5 text-green-600" /> 4. Data Deletion & Inquiries
            </div>
            <p>
              Users participating in our beta test may request deletion of their account or farm logs at any time during the evaluation phase.
            </p>
            <p className="text-slate-600">
              For any questions regarding data handling or privacy practices, please contact the student leads (Etornam & Doreen) via our{" "}
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
