"use client";

import React, { useState } from "react";
import { Check, Star, Zap, Shield, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { upgradeToPremium } from "./actions";

export default function UpgradeClientPage({ initialTier }: { initialTier: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await upgradeToPremium();
      if (!res.success) {
        alert(res.error);
        return;
      }
      alert("Success! You are now a Premium member.");
      router.refresh();
    } catch (e: any) {
      alert("Upgrade failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = initialTier === "premium";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          AgriBoost Premium
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Unlock advanced AI crop insights, priority marketplace listing, and premium analytics to supercharge your farming operations.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Plan</h3>
          <p className="text-sm text-gray-500 mb-6">Perfect for getting started</p>
          <div className="text-3xl font-bold text-gray-900 mb-6">
            Free<span className="text-sm font-normal text-gray-400"> / forever</span>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex gap-3 text-sm text-gray-700">
              <Check className="h-5 w-5 text-emerald-500 shrink-0" />
              Standard Marketplace Listings
            </li>
            <li className="flex gap-3 text-sm text-gray-700">
              <Check className="h-5 w-5 text-emerald-500 shrink-0" />
              Basic Farm Management
            </li>
            <li className="flex gap-3 text-sm text-gray-700">
              <Check className="h-5 w-5 text-emerald-500 shrink-0" />
              Escrow Protection
            </li>
          </ul>

          <button 
            disabled 
            className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-500 cursor-not-allowed"
          >
            {isPremium ? "Included" : "Current Plan"}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-3xl p-8 border border-emerald-800 shadow-xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star className="h-32 w-32" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2 text-emerald-50">Premium Plan</h3>
            <p className="text-sm text-emerald-200 mb-6">For professional farmers</p>
            <div className="text-3xl font-bold mb-6">
              GH₵ 49<span className="text-sm font-normal text-emerald-300"> / month</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-sm text-emerald-100">
                <Zap className="h-5 w-5 text-amber-400 shrink-0" />
                Advanced AI Crop Insights & Growth Plans
              </li>
              <li className="flex gap-3 text-sm text-emerald-100">
                <Star className="h-5 w-5 text-amber-400 shrink-0" />
                Priority Placement in Marketplace
              </li>
              <li className="flex gap-3 text-sm text-emerald-100">
                <Shield className="h-5 w-5 text-amber-400 shrink-0" />
                Premium Seller Badge
              </li>
              <li className="flex gap-3 text-sm text-emerald-100">
                <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                Lower Platform Fees (2%)
              </li>
            </ul>

            {isPremium ? (
              <button 
                disabled
                className="w-full py-3 rounded-xl font-bold bg-white/10 text-white cursor-default border border-white/20"
              >
                ✓ Active Subscription
              </button>
            ) : (
              <button 
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold bg-amber-400 text-amber-950 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : "Upgrade Now"} <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
