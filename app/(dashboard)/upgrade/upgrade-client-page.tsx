"use client";

import React, { useState } from "react";
import {
  Check,
  Star,
  Zap,
  Shield,
  ArrowRight,
  BadgeCheck,
  AlertTriangle,
  Calendar,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";
import { upgradeToPremium, cancelSubscription } from "./actions";

interface UpgradeClientPageProps {
  initialTier: string;
  subscriptionEndDate?: string | null;
}

export default function UpgradeClientPage({
  initialTier,
  subscriptionEndDate,
}: UpgradeClientPageProps) {
  const [tier, setTier] = useState(initialTier);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const router = useRouter();

  const isPremium = tier === "premium";

  const formattedDate = subscriptionEndDate
    ? new Date(subscriptionEndDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "the end of your billing cycle";

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await upgradeToPremium();
      if (!res.success) {
        toast.error(res.error || "Upgrade failed.");
        return;
      }
      toast.success("Success! You are now a Premium member.");
      setTier("premium");
      router.refresh();
    } catch (e: any) {
      toast.error("Upgrade failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelSubscription();
      if (!res.success) {
        toast.error(res.error || "Failed to cancel subscription.");
        return;
      }
      setShowCancelModal(false);
      setTier("free");
      toast.success(
        `Subscription cancelled. Premium access remains until ${formattedDate}.`
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (e: any) {
      toast.error("Cancellation failed: " + e.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {isPremium ? "Manage Your Subscription" : "AgriBoost Premium"}
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          {isPremium
            ? "View your current 5-Star Premium membership details and manage your subscription."
            : "Unlock advanced AI crop insights, priority marketplace listing, and premium analytics to supercharge your farming operations."}
        </p>
      </div>

      {isPremium ? (
        /* ── Premium Subscription Management Card ───────────────────── */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6">
          {/* Amber Gradient Sidebar-Matching Badge */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-5 text-white shadow-lg shadow-amber-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <BadgeCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight">
                  Premium Member ✓
                </p>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  All 5-Star Farmer features active
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-xs font-bold rounded-full uppercase tracking-wider text-white border border-white/30">
              Active Plan
            </span>
          </div>

          {/* Membership Details */}
          <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/80 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                Subscription End Date:
              </span>
              <strong className="text-gray-900 font-bold">
                {formattedDate}
              </strong>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-emerald-100 pt-3">
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Plan Benefits:
              </span>
              <span className="text-emerald-700 font-semibold text-xs bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Unlimited AI Scans & Priority Market
              </span>
            </div>
          </div>

          {/* Cancel Subscription Action */}
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Want to modify your plan?
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                You can cancel at any time while retaining access until your end date.
              </p>
            </div>
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <AlertTriangle className="h-4 w-4" />
              Cancel Subscription
            </button>
          </div>
        </div>
      ) : (
        /* ── Standard Pricing Cards for Free Users ───────────────────── */
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Basic Plan
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Perfect for getting started
              </p>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                Free
                <span className="text-sm font-normal text-gray-400">
                  {" "}
                  / forever
                </span>
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
            </div>

            <button
              disabled
              className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-500 cursor-not-allowed text-center"
            >
              Current Plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-3xl p-8 border border-emerald-800 shadow-xl relative overflow-hidden text-white flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Star className="h-32 w-32" />
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2 text-emerald-50">
                Premium Plan
              </h3>
              <p className="text-sm text-emerald-200 mb-6">
                For professional farmers
              </p>
              <div className="text-3xl font-bold mb-6">
                GH₵ 49
                <span className="text-sm font-normal text-emerald-300">
                  {" "}
                  / month
                </span>
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

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold bg-amber-400 text-amber-950 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : "Upgrade Now"}{" "}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ─────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 relative">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Cancel Premium Subscription?
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Are you sure? You will lose access to premium features on{" "}
                <strong className="text-gray-800">{formattedDate}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm text-center"
              >
                Keep Premium
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors text-sm text-center shadow-lg shadow-red-200 disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
