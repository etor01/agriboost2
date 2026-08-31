// app/careers/page.tsx
import React from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { Users, GraduationCap, Code, Sprout, Mail, Info, ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Careers & Collaboration | AgriBoost",
  description:
    "Opportunities to collaborate on AgriBoost — a KNUST final-year student project digitizing Ghanaian agriculture.",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-emerald-50/20 to-zinc-50 text-zinc-900 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="pt-28 sm:pt-32 pb-20 px-4 sm:px-6 max-w-6xl mx-auto w-full flex-grow space-y-12 sm:space-y-16">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Collaboration &amp; Opportunities</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Join Our <span className="text-emerald-600">Student &amp; Research</span> Community
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            AgriBoost is an academic research and final-year capstone project developed at KNUST Ghana by{" "}
            <strong className="text-zinc-900">Etornam</strong> and{" "}
            <strong className="text-zinc-900">Doreen</strong>. While we are not hiring commercial staff, we actively welcome student collaborators, testers, and agronomic advisors!
          </p>
        </section>

        {/* Status Notice Banner (Amber / Gold Accent) */}
        <section className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-5 sm:p-6 flex items-start gap-3.5 text-amber-950 shadow-2xs max-w-4xl mx-auto">
          <div className="p-2.5 bg-amber-100/90 rounded-lg text-amber-800 shrink-0 border border-amber-200/80">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <h2 className="font-bold text-amber-900">Current Collaboration Status</h2>
            <p className="text-amber-900/90 leading-relaxed">
              Because AgriBoost is currently a <strong>final-year student project</strong> under academic review at KNUST, we do not have open salaried positions. However, if you are a student, developer, agronomist, or farmer looking to contribute to research, test our AI diagnostics, or share datasets, we would love to connect!
            </p>
          </div>
        </section>

        {/* Opportunities Grid */}
        <section className="space-y-6 max-w-5xl mx-auto">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Ways to Get Involved
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Explore how you can participate in our agricultural technology research initiative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Collaborator */}
            <div className="bg-white/85 backdrop-blur-md rounded-xl p-6 sm:p-7 border border-white/60 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="p-2.5 w-fit rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Student Collaborator</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Are you a KNUST or university student interested in AI, agronomy, software engineering, or UX design? Collaborate with us on project features and user testing.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full w-fit">
                Academic Interest
              </span>
            </div>

            {/* Beta Farm Tester */}
            <div className="bg-white/85 backdrop-blur-md rounded-xl p-6 sm:p-7 border border-white/60 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="p-2.5 w-fit rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
                  <Sprout className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Beta Farm Tester</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Are you a farmer, extension worker, or agricultural researcher in Ghana? Help us test our crop disease scanner and farm logging tools on real field parcels.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full w-fit">
                Field Feedback
              </span>
            </div>

            {/* Open Source & AI */}
            <div className="bg-white/85 backdrop-blur-md rounded-xl p-6 sm:p-7 border border-white/60 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="p-2.5 w-fit rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">AI &amp; Open Datasets</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Interested in computer vision models for tropical crop diagnostics? Share ideas or provide dataset suggestions to improve disease detection accuracy.
                </p>
              </div>
              <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-full w-fit">
                Tech &amp; Datasets
              </span>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl p-8 sm:p-10 text-center max-w-3xl mx-auto space-y-4 shadow-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connect with the Team</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Want to Partner or Collaborate?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
            Reach out directly to <strong>Etornam</strong> and <strong>Doreen</strong> with your ideas, testing requests, or collaboration proposals.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors shadow-2xs active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>Get in Touch with Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

