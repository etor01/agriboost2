import type { Metadata } from "next";
import React from "react";
import Header from "../components/ui/Header";
import Hero from "../components/ui/Hero";
import Footer from "@/components/ui/Footer";
import CTA from "@/components/CTA";
import FeatureSection from "@/components/FeatureSection";

export const metadata: Metadata = {
  title: "AgriBoost — AI-Powered Farm Management for Ghanaian Farmers",
  description:
    "Manage your farms, sell produce directly, get AI crop disease detection, and track your earnings — all in one platform built for Ghana's agricultural sector.",
  keywords: ["agriculture", "Ghana", "farming", "AI", "crop disease", "marketplace", "farmers"],
  openGraph: {
    title: "AgriBoost — Smart Farming Platform",
    description:
      "AI crop care, direct marketplace, escrow payments, and farm management for Ghanaian farmers.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="bg-gray-50 text-gray-800 font-sans">
      <Header />

      <main className="bg-gray-300">
        <Hero />
        <FeatureSection />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
