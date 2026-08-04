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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Load Your Wallet
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-emerald-100 text-xs mt-1">
            Secure top-up powered by Paystack (Test Mode)
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* ── Success State ─────────────────────────────────────────────── */}
          {successAmount !== null ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  Wallet Loaded! 🎉
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-bold text-emerald-700">
                    GH₵ {successAmount.toFixed(2)}
                  </span>{" "}
                  has been added to your AgriBoost wallet.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Quick amounts */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Select Amount (GH₵)
                </p>
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  {TOPUP_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount("");
                        setError(null);
                      }}
                      className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                        selectedAmount === amt && !customAmount
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-lg scale-105"
                          : "border-gray-200 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50"
                      }`}
                    >
                      GH₵ {amt}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
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
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                  />
                </div>
              </div>

              {/* Summary */}
              {effectiveAmount > 0 && (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Amount to load</span>
                    <span className="font-extrabold text-gray-900">
                      GH₵ {effectiveAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>Processing fee</span>
                    <span>Covered by Paystack</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Test card hint */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-700 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" /> Paystack Test Card
                </p>
                <p>
                  Card:{" "}
                  <span className="font-mono font-bold">4084 0840 8408 4081</span>
                </p>
                <p>Expiry: Any future date &nbsp;|&nbsp; CVV: Any 3 digits</p>
              </div>

              <button
                onClick={handlePay}
                disabled={loading || !effectiveAmount || effectiveAmount < 1}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-extrabold rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Opening Paystack...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
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
