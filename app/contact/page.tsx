"use client";

import React, { useState } from "react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { Mail, MapPin, Send, CheckCircle2, GraduationCap, User } from "lucide-react";
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
    // Simulate sending message to project team
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Thank you! Your message has been sent to Etornam & Doreen.");
    }, 800);
  };

  return (
    <div className="bg-gray-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
      <Header />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto w-full flex-grow space-y-12">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold uppercase tracking-wider">
            <Mail className="w-4 h-4 text-green-600" />
            Get In Touch
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Contact the <span className="text-green-600">AgriBoost</span> Project Team
          </h1>

          <p className="text-base md:text-lg text-slate-600 leading-relaxed">
            Have questions, suggestions, or feedback regarding our KNUST final-year project? We&apos;d love to hear from you! Reach out directly to Etornam and Doreen.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto items-start">
          {/* Info Card */}
          <div className="lg:col-span-5 bg-emerald-900 text-white rounded-3xl p-8 shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-700/40 rounded-full blur-2xl" />

            <div className="space-y-3 relative z-10">
              <span className="inline-block px-3 py-1 bg-emerald-800 border border-emerald-700 text-emerald-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                Project Info
              </span>
              <h2 className="text-2xl font-bold">KNUST Student Leads</h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                AgriBoost is an academic research project focused on agricultural technology in Ghana.
              </p>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-800/80 rounded-2xl text-emerald-300 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-200">Creators & Developers</h3>
                  <p className="text-base font-bold text-white mt-0.5">Etornam & Doreen</p>
                  <p className="text-xs text-emerald-300">Final Year Students, Computer Science / Tech</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-800/80 rounded-2xl text-emerald-300 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-200">Institution</h3>
                  <p className="text-base font-bold text-white mt-0.5">KNUST (Kwame Nkrumah University of Science and Technology)</p>
                  <p className="text-xs text-emerald-300">Kumasi, Ashanti Region, Ghana</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-800/80 rounded-2xl text-emerald-300 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-200">Location Target</h3>
                  <p className="text-base font-bold text-white mt-0.5">Ghana Agricultural Sector</p>
                  <p className="text-xs text-emerald-300">Onboarding farmers & agricultural stakeholders</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-800/80 relative z-10 text-xs text-emerald-300">
              Note: This contact form submits feedback directly to the project authors for testing and evaluation purposes.
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for reaching out to Etornam and Doreen. We appreciate your interest and feedback on AgriBoost!
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", role: "Farmer", subject: "", message: "" });
                  }}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-full transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-bold text-slate-900">Send Us a Message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kwame Mensah"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      I Am A...
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    >
                      <option value="Farmer">Farmer / Producer</option>
                      <option value="Buyer">Produce Buyer / Wholesaler</option>
                      <option value="Student">Student / Researcher</option>
                      <option value="Other">Other Agricultural Stakeholder</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Beta testing feedback"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share your thoughts, suggestions, or inquiries with the AgriBoost team..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-full shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70"
                >
                  {loading ? (
                    "Sending message..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message to Project Leads
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
