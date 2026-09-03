// app/contact/page.tsx
"use client";

import React, { useState } from "react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import {
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  GraduationCap,
  User,
  Sparkles,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Farmer",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Thank you! Your message has been sent to Etornam & Doreen.");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-emerald-50/20 to-zinc-50 text-zinc-900 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="pt-28 sm:pt-32 pb-20 px-4 sm:px-6 max-w-6xl mx-auto w-full flex-grow space-y-10 sm:space-y-14">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto space-y-3 pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <Mail className="w-3.5 h-3.5 text-emerald-600" />
            <span>Get In Touch</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Contact the <span className="text-emerald-600">AgriBoost</span> Project Team
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Have questions, feedback, or testing suggestions regarding our final-year capstone project? Kindly reach out to us and we would be happy to respond.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 max-w-5xl mx-auto items-start">
          {/* Info Card (Left) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-800/60 space-y-6 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-2 relative z-10">

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-center">KNUST Academic Project</h2>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
                The student leads and supervisor of the AgriBoost project.
              </p>
            </div>

            <div className="space-y-4 relative z-10 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-800/80 rounded-lg text-emerald-300 shrink-0 border border-emerald-700/60">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-emerald-200">Student Developers</h3>
                  <p className="font-bold text-white mt-0.5">Etornam Ahiataku &amp; Doreen Techie</p>
                  <p className="text-[11px] text-emerald-300">Final Year Students, KNUST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-800/80 rounded-lg text-emerald-300 shrink-0 border border-emerald-700/60">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-emerald-200">Suppervisor</h3>
                  <p className="font-bold text-white mt-0.5">Dr. Benjamin Tie Partey</p>
                  <p className="text-[11px] text-emerald-300">Computer Science Dept. College of Science, KNUST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-800/80 rounded-lg text-emerald-300 shrink-0 border border-emerald-700/60">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-emerald-200">Institution</h3>
                  <p className="font-bold text-white mt-0.5">Kwame Nkrumah University of Science and Technology</p>
                  <p className="text-[11px] text-emerald-300">Kumasi, Ashanti Region, Ghana</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-800/80 relative z-10 text-[11px] text-emerald-300/90 leading-relaxed text-center">
              Please be kind and constructive with your feedback. This is an academic project and we are always looking to improve.
            </div>
          </div>

          {/* Contact Form (Right) */}
          <div className="lg:col-span-7 bg-white/85 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/60 shadow-xs space-y-6">
            {submitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Message Received!</h3>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to Etornam and Doreen. We appreciate your feedback on the AgriBoost project!
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", role: "Farmer", subject: "", message: "" });
                    }}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-xs rounded-lg transition-colors shadow-2xs"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900">Send Us a Direct Message</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={loading}
                      placeholder="e.g. Kwame Mensah"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/90 border border-zinc-200/90 rounded-lg text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      disabled={loading}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white/90 border border-zinc-200/90 rounded-lg text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      I Am A…
                    </label>
                    <select
                      value={formData.role}
                      disabled={loading}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-white/90 border border-zinc-200/90 rounded-lg text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-colors"
                    >
                      <option value="Farmer">Farmer / Producer</option>
                      <option value="Buyer">Produce Buyer / Wholesaler</option>
                      <option value="Student">Student / Researcher</option>
                      <option value="Agronomist">Agronomist / Extension Officer</option>
                      <option value="Other">Other Stakeholder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      disabled={loading}
                      placeholder="e.g. Beta testing feedback"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-white/90 border border-zinc-200/90 rounded-lg text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    disabled={loading}
                    placeholder="Share your thoughts, suggestions, or collaboration proposals with the AgriBoost team..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 bg-white/90 border border-zinc-200/90 rounded-lg text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Message…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message to Project Leads</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

