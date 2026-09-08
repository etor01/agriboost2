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
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
        >
          <Wallet className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
          {loading ? (
            <RefreshCw className="h-3 w-3 animate-spin text-emerald-600" />
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
      <div className="mx-3 mb-3 rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-emerald-100 border border-emerald-200 rounded flex items-center justify-center text-emerald-700">
              <Wallet className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
              My Wallet
            </span>
          </div>
          <button
            onClick={fetchBalance}
            className="p-1 hover:bg-emerald-100/70 rounded text-emerald-700 transition-colors"
            title="Refresh balance"
          >
            <RefreshCw
              className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <p className="text-xl font-bold tracking-tight text-zinc-900 mb-0.5">
          {loading ? (
            <span className="text-zinc-400 text-sm font-normal">Loading...</span>
          ) : (
            `GH₵ ${(balance ?? 0).toLocaleString("en-GH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          )}
        </p>
        <p className="text-zinc-500 text-[10px] mb-2.5">
          Available for instant escrow checkout
        </p>

        <button
          onClick={() => setShowTopUp(true)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium text-xs shadow-2xs transition-colors active:scale-98"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Money
        </button>
      </div>
    </>
  );
}

