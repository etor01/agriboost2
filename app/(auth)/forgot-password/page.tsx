// app/(auth)/forgot-password/page.tsx
"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "A password reset link has been dispatched to your email address. Please check your inbox and spam folders."
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full">
      <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]">
        {/* Header */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-block mb-3 hover:scale-105 transition-transform"
            aria-label="Go to Homepage"
          >
            <Image
              alt="leaf icon"
              src="/icons/logo.png"
              width={56}
              height={56}
              className="drop-shadow-xs mx-auto"
            />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Forgot Password
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Success Alert */}
        {message && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div className="leading-relaxed">
              <span className="font-semibold block">Email sent</span>
              {message}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-red-50/90 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold block">Reset failed</span>
              {error}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-zinc-700 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200/90 bg-white/90 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Sending Link…</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-zinc-200/60 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-emerald-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
