"use client";

import React from "react";
import Header from "../components/ui/Header";
import Hero from "../components/ui/Hero";
import Footer from "@/components/ui/Footer";
import CTA from "@/components/CTA";
import FeatureSection from "@/components/FeatureSection";

export default function LandingPage() {
  return (
    <div className="bg-gray-50 text-gray-800 font-sans">
      <Header />

      <main>
        <Hero />
        <FeatureSection />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
