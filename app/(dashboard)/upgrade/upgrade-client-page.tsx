// app/(dashboard)/upgrade/upgrade-client-page.tsx
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
  Crown,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";
import { upgradeToPremium, cancelSubscription } from "./actions";
import {
  FarmerPageHeader,
  FarmerBadge,
  FarmerCard,
  FarmerCardHeader,
  FarmerCardContent,
} from "@/components/farmer/ui";

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
    ? new Date(subscriptionEndDate).toLocaleDateString("en-GH", {
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
      toast.success("Success! You are now a 5-Star Premium member.");
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <FarmerPageHeader
        badge="Membership & Growth"
        badgeIcon={Crown}
        title={isPremium ? "Manage Subscription" : "Subscription Plans"}
        description={
          isPremium
            ? "Review your active 5-Star Farmer plan benefits and billing schedule."
            : "Unlock unlimited AI disease diagnostics, automated growth schedules, and verified marketplace placement."
        }
      />

      {isPremium ? (
        /* Premium Active State Card */
        <FarmerCard className="p-6 space-y-6">
          <div className="rounded-lg bg-zinc-900 text-white p-6 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    5-Star Farmer Plan
                  </h3>
                  <FarmerBadge variant="success">Active</FarmerBadge>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  All premium farming intelligence and marketplace perks are enabled.
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-zinc-400">Billing Cycle</p>
              <p className="text-sm font-semibold text-white">Annual Membership</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 mb-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                Access Expiration
              </div>
              <p className="text-sm font-bold text-zinc-900">{formattedDate}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Renews automatically unless cancelled before period end.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 mb-1">
                <Zap className="h-3.5 w-3.5 text-amber-600" />
                Active Privileges
              </div>
              <p className="text-sm font-bold text-zinc-900">Unlimited AI &amp; Priority</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Full access to crop scanners, growth planners, and lower fees.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-900">
                Cancel Membership
              </p>
              <p className="text-[11px] text-zinc-500">
                You will maintain full access until {formattedDate}.
              </p>
            </div>
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-md transition-colors shadow-2xs"
            >
              Cancel Subscription
            </button>
          </div>
        </FarmerCard>
      ) : (
        /* Plan Comparison Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Tier */}
          <FarmerCard className="p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-zinc-900">Standard Plan</h3>
                <FarmerBadge variant="muted">Current Tier</FarmerBadge>
              </div>
              <p className="text-xs text-zinc-500">
                Essential tools to manage your farm and post marketplace produce.
              </p>

              <div className="mt-4 mb-6">
                <span className="text-3xl font-extrabold text-zinc-900">GH₵ 0</span>
                <span className="text-xs text-zinc-400"> / forever</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-700">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Standard Marketplace Listings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Farm &amp; Crop Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Escrow-Protected Payouts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>3 AI Disease Scans per month</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="w-full py-2.5 rounded-md font-medium text-xs bg-zinc-100 text-zinc-400 cursor-not-allowed text-center"
            >
              Your Active Plan
            </button>
          </FarmerCard>

          {/* Premium Tier */}
          <FarmerCard className="p-6 flex flex-col justify-between space-y-6 border-zinc-900 shadow-md relative">
            <div className="absolute -top-2.5 right-6">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-white uppercase tracking-wider shadow-xs">
                Recommended
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-amber-500" />
                  5-Star Farmer Plan
                </h3>
              </div>
              <p className="text-xs text-zinc-500">
                Full AI agronomy intelligence, growth schedules, and priority sales placement.
              </p>

              <div className="mt-4 mb-6">
                <span className="text-3xl font-extrabold text-zinc-900">GH₵ 49</span>
                <span className="text-xs text-zinc-400"> / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-700">
                <li className="flex items-center gap-2 font-medium text-zinc-900">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Unlimited AI Crop Diagnostics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>AI Crop Growth Plans &amp; Weekly Schedules</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Priority Placement on Marketplace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Verified 5-Star Seller Badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Reduced Platform Commission Fees</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-2.5 rounded-md font-medium text-xs bg-zinc-900 hover:bg-zinc-800 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              {loading ? (
                <span>Activating Plan…</span>
              ) : (
                <>
                  <span>Upgrade to 5-Star Farmer</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </FarmerCard>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl border border-zinc-200 space-y-4 relative">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="w-10 h-10 rounded-md bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Cancel 5-Star Membership?
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Are you sure you want to cancel? You will keep your premium features until{" "}
                <strong className="text-zinc-800">{formattedDate}</strong>, after which your plan will revert to Free.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 py-2 rounded-md font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors text-xs text-center"
              >
                Keep Plan
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 py-2 rounded-md font-medium bg-red-600 text-white hover:bg-red-700 transition-colors text-xs text-center shadow-2xs disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

