// app/marketplace/page.tsx
import { Leaf } from "lucide-react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import MarketplaceClient from "./MarketplaceClient";

export const metadata = {
  title: "Marketplace | AgriBoost – Fresh Produce from Ghana's Farmers",
  description:
    "Browse 100+ fresh crops, grains, fruits, vegetables and spices listed directly by verified farmers across Ghana.",
};

export default function MarketplacePage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-110 -z-10"
        style={{ backgroundImage: "url('/features.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-emerald-900/20 -z-10" />

      <Header />

      {/* Hero Banner */}
      <section className="pt-28 pb-10 px-4 text-center">
        <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-emerald-400/30 mb-4">
          <Leaf className="h-3.5 w-3.5" />
          Farm-to-Market Platform
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">
          AgriBoost Marketplace
        </h1>
        <p className="text-lg text-gray-200 mt-4 max-w-2xl mx-auto">
          Buy fresh produce directly from verified farmers across Ghana: grains,
          vegetables, fruits, spices &amp; more.
        </p>
      </section>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50/90 backdrop-blur-md rounded-t-3xl">
        <MarketplaceClient />
      </main>

      <Footer />
    </div>
  );
}
