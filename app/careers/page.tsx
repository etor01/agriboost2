import React from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { Users, GraduationCap, Code, Sprout, Mail, Info } from "lucide-react";

export const metadata = {
  title: "Careers & Collaboration | AgriBoost",
  description: "Opportunities to collaborate on AgriBoost — a KNUST final-year student project digitizing Ghanaian agriculture.",
};

export default function CareersPage() {
  return (
    <div className="bg-gray-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
      <Header />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto w-full flex-grow space-y-16">
        {/* Hero */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold uppercase tracking-wider">
            <Users className="w-4 h-4 text-green-600" />
            Collaboration & Opportunities
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Join Our <span className="text-green-600">Student & Research</span> Community
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            AgriBoost is an academic research and final-year capstone project developed at KNUST Ghana by <strong>Etornam</strong> and <strong>Doreen</strong>. While we are not hiring corporate employees, we actively welcome student collaborators, testers, and agricultural advisors!
          </p>
        </section>

        {/* Status Notice */}
        <section className="bg-amber-50 border border-amber-200 rounded-3xl p-6 md:p-8 flex items-start gap-4 text-slate-800 shadow-sm max-w-4xl mx-auto">
          <div className="p-3 bg-amber-100 rounded-2xl text-amber-700 shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Current Hiring Status</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Because AgriBoost is currently a <strong>final-year student project</strong> under academic review at KNUST, we do not have open salaried commercial positions. However, if you are a student, developer, agronomist, or farmer looking to collaborate, contribute to research, or test our AI tools, we would love to connect with you!
            </p>
          </div>
        </section>

        {/* Opportunities Grid */}
        <section className="space-y-8 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Ways to Get Involved</h2>
            <p className="text-slate-500 text-sm md:text-base">
              Explore how you can participate in our agricultural technology research initiative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:border-green-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 w-fit rounded-2xl bg-green-50 text-green-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Student Collaborator</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Are you a KNUST student interested in AI, agronomy, software engineering, or UX design? Collaborate with us on project features and user testing.
                </p>
              </div>
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Academic Interest</span>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:border-green-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 w-fit rounded-2xl bg-emerald-50 text-emerald-600">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Beta Farm Tester</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Are you a farmer, extension worker, or agricultural student in Ghana? Help us test our crop disease scanner and farm logging tools on real farms.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Field Feedback</span>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:border-green-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 w-fit rounded-2xl bg-sky-50 text-sky-600">
                  <Code className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Open Source & AI</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Interested in machine learning models for tropical crop diagnostics? Share ideas or provide dataset recommendations to improve our models.
                </p>
              </div>
              <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">Tech & Datasets</span>
            </div>
          </div>
        </section>

        {/* Contact Call to action */}
        <section className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-3xl mx-auto space-y-4 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Want to Partner or Collaborate?</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Reach out directly to <strong>Etornam</strong> and <strong>Doreen</strong> with your ideas, feedback, or collaboration proposals.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-green-600 text-white font-semibold text-sm rounded-full transition-all shadow-md"
            >
              <Mail className="w-4 h-4" /> Get in Touch with Us
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
