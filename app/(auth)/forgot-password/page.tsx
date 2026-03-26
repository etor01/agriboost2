// app/(auth)/forgot-password/page.tsx
"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`, // Page to redirect to after password reset
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset link has been sent to your email address.");
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 md:p-10 transition-all">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block mb-4 hover:scale-[1.05] transition-all"
          >
            <Image
              alt="leaf icon"
              src="/icons/logo.png"
              width={60}
              height={60}
            />
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Forgot Password
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Enter your email to receive a reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/20 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all"
            />
          </div>

          {/* Success Message */}
          {message && (
            <p className="text-sm text-green-700 bg-green-50/70 border border-green-200 rounded-xl px-4 py-3">
              {message}
            </p>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50/70 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-full bg-green-600 text-white text-sm font-medium tracking-tight transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="text-green-600 hover:text-green-700 transition-all hover:scale-[1.02]"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>

    // <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full">
    //   <div className="text-center mb-8">
    //     <Link href="/" className="inline-block mb-4">
    //       <Image alt="leaf icon" src="/icons/logo.png" width={60} height={60} />
    //     </Link>
    //     <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
    //     <p className="text-gray-500 mt-2">Enter your email to receive a reset link.</p>
    //   </div>

    //   <form onSubmit={handleSubmit} className="space-y-6">
    //     <div>
    //       <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
    //       <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="you@example.com" />
    //     </div>

    //     {message && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{message}</p>}
    //     {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

    //     <div>
    //       <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
    //         {isLoading ? 'Sending...' : 'Send Reset Link'}
    //       </button>
    //     </div>
    //   </form>
    //   <p className="mt-8 text-center text-sm text-gray-500">
    //     Remembered your password?{' '}
    //     <Link href="/login" className="font-medium text-green-600 hover:text-green-500">Sign In</Link>
    //   </p>
    // </div>
  );
}
