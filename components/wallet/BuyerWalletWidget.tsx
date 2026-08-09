"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wallet, Plus, RefreshCw } from "lucide-react";
import WalletTopUpModal from "@/components/wallet/WalletTopUpModal";

interface BuyerWalletWidgetProps {
  /** Optional: collapse to icon-only mode (for tight sidebars) */
  compact?: boolean;
}

export default function BuyerWalletWidget({
  compact = false,
}: BuyerWalletWidgetProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setEmail(user.email || "");

    const { data } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    setBalance(Number(data?.wallet_balance ?? 0));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleTopUpSuccess = () => {
    fetchBalance();
    setShowTopUp(false);
  };

  if (compact) {
    return (
      <>
        {showTopUp && (
          <WalletTopUpModal
            userEmail={email}
            onClose={() => setShowTopUp(false)}
            onSuccess={handleTopUpSuccess}
          />
        )}
        <button
          onClick={() => setShowTopUp(true)}
          title={`Wallet: GH₵ ${balance?.toFixed(2) ?? "..."}`}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors text-emerald-700 text-xs font-bold"
        >
          <Wallet className="h-4 w-4 flex-shrink-0" />
          {loading ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <span>GH₵ {balance?.toFixed(2)}</span>
          )}
        </button>
      </>
    );
  }

  return (
    <>
      {showTopUp && (
        <WalletTopUpModal
          userEmail={email}
          onClose={() => setShowTopUp(false)}
          onSuccess={handleTopUpSuccess}
        />
      )}

      {/* Wallet card in sidebar */}
      <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-4 shadow-lg shadow-emerald-900/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
              My Wallet
            </span>
          </div>
          <button
            onClick={fetchBalance}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            title="Refresh balance"
          >
            <RefreshCw
              className={`h-3 w-3 text-emerald-200 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <p className="text-2xl font-black tracking-tight mb-0.5">
          {loading ? (
            <span className="text-emerald-300 text-base">Loading...</span>
          ) : (
            `GH₵ ${(balance ?? 0).toLocaleString("en-GH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          )}
        </p>
        <p className="text-emerald-200 text-[11px] mb-3">
          Available for checkout
        </p>

        <button
          onClick={() => setShowTopUp(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-white text-emerald-700 rounded-xl font-extrabold text-xs hover:bg-emerald-50 transition-all shadow"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Money
        </button>
      </div>
    </>
  );
}
