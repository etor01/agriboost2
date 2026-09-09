/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * WalletTopUpModalContent
 *
 * IMPORTANT: usePaystackPayment is a React Hook and MUST be called at the
 * top level of a component — never inside an async function or event handler.
 * In react-paystack v6, initPayment expects an object argument:
 *   initPayment({ config, onSuccess, onClose })
 */

import React, { useState } from "react";
import { usePaystackPayment } from "react-paystack";
import {
  Wallet,
  X,
  Plus,
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const TOPUP_AMOUNTS = [50, 100, 200, 500, 1000];

interface WalletTopUpModalProps {
  userEmail: string;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export default function WalletTopUpModalContent({
  userEmail,
  onClose,
  onSuccess,
}: WalletTopUpModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successAmount, setSuccessAmount] = useState<number | null>(null);

  const effectiveAmount = customAmount
    ? Number(customAmount)
    : (selectedAmount ?? 0);

  // ── usePaystackPayment called at top-level (Rules of Hooks) ────────────────
  const config = {
    reference: `WALLET-TOPUP-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`,
    email: userEmail || "user@agriboost.com",
    amount: Math.max(Math.round(effectiveAmount * 100), 100), // pesewas, min 100
    currency: "GHS",
    publicKey:
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_02db01b19aa4b0667922552ebe724d752707caaa",
    metadata: {
      custom_fields: [
        {
          display_name: "Purpose",
          variable_name: "purpose",
          value: "AgriBoost Wallet Top-up",
        },
      ],
    } as any,
  };

  const initPayment = usePaystackPayment(config);

  // ── On Paystack success (called by Paystack popup) ────────────────────────
  const onPaystackSuccess = async (response: any) => {
    console.log("[WalletTopUp] Payment confirmed by Paystack:", response);
    const paymentRef = response?.reference || response?.ref || config.reference;

    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: paymentRef,
          amount: effectiveAmount,
        }),
      });
      const data = await res.json();
      console.log("[WalletTopUp] Backend topup API response:", data);

      if (data.success) {
        setSuccessAmount(data.amount || effectiveAmount);
        setTimeout(() => {
          onSuccess(data.amount || effectiveAmount);
          onClose();
        }, 2000);
      } else {
        setError(data.error || "Failed to credit wallet. Please contact support.");
      }
    } catch (err) {
      console.error("[WalletTopUp] Network error verifying payment:", err);
      setError("Network error verifying payment. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  // ── On Paystack popup closed ───────────────────────────────────────────────
  const onPaystackClose = () => {
    console.log("[WalletTopUp] Paystack popup closed by user");
    setLoading(false);
  };

  const handlePay = () => {
    if (!effectiveAmount || effectiveAmount < 1) {
      setError("Please select or enter an amount of at least GH₵ 1.");
      return;
    }
    if (!userEmail) {
      setError("User email not found. Please reload the page.");
      return;
    }
    setLoading(true);
    setError(null);

    // CRITICAL: In react-paystack v6, initializePayment takes an object:
    // { config, onSuccess, onClose }
    (initPayment as any)({
      config,
      onSuccess: onPaystackSuccess,
      onClose: onPaystackClose,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-50 border border-emerald-200/80 rounded-lg flex items-center justify-center text-emerald-700 shadow-2xs">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Load Your Wallet
              </h2>
              <p className="text-zinc-500 text-[11px] leading-tight">
                Secure top-up powered by Paystack (Test Mode)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* ── Success State ─────────────────────────────────────────────── */}
          {successAmount !== null ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">
                  Wallet Loaded! 🎉
                </h3>
                <p className="text-zinc-600 text-xs mt-1">
                  <strong className="text-emerald-700 font-bold">
                    GH₵ {successAmount.toFixed(2)}
                  </strong>{" "}
                  has been credited to your AgriBoost wallet.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Quick amounts */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2">
                  Select Top-up Amount
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  {TOPUP_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount("");
                        setError(null);
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${selectedAmount === amt && !customAmount
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs"
                        : "border-zinc-200 text-zinc-700 hover:border-emerald-300 hover:bg-zinc-50/80"
                        }`}
                    >
                      GH₵ {amt}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-xs">
                    GH₵
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                      setError(null);
                    }}
                    placeholder="Enter custom amount"
                    className="w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* Summary */}
              {effectiveAmount > 0 && (
                <div className="bg-emerald-50/70 rounded-lg p-3 border border-emerald-200/80 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-zinc-600">Total to credit</span>
                    <span className="text-zinc-900 font-bold">
                      GH₵ {effectiveAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
                    <span>Total Payment + Fees</span>
                    <span className="text-emerald-700 font-medium">Covered by Paystack</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-700 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}


              <button
                onClick={handlePay}
                disabled={loading || !effectiveAmount || effectiveAmount < 1}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-2xs active:scale-[0.99] flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Opening Paystack...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Add GH₵{" "}
                    {effectiveAmount > 0 ? effectiveAmount.toFixed(2) : "0.00"}{" "}
                    to Wallet
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
