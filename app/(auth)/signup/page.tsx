// app/(auth)/signup/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import {
  Tractor,
  ShoppingBag,
  Check,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type Role = "farmer" | "buyer";

export default function SignUpPage() {
  const [role, setRole] = useState<Role>("farmer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstname: firstName.trim(),
          lastname: lastName.trim(),
          role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
    } else {
      router.push("/");
    }
  };

  const roleOptions: Array<{
    value: Role;
    label: string;
    subtitle: string;
    Icon: React.ElementType;
  }> = [
    {
      value: "farmer",
      label: "Farmer",
      subtitle: "List & sell produce directly",
      Icon: Tractor,
    },
    {
      value: "buyer",
      label: "Buyer / Trader",
      subtitle: "Order fresh produce with escrow",
      Icon: ShoppingBag,
    },
  ];

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
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Join the AgriBoost farm &amp; trade ecosystem
          </p>
        </div>

        {/* Success State */}
        {successMessage ? (
          <div className="text-center p-6 bg-emerald-50/90 border border-emerald-200 rounded-lg space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-sm text-emerald-950">
              Check your inbox
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Role Selection ─────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                I want to join as a:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {roleOptions.map(({ value, label, subtitle, Icon }) => {
                  const isSelected = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      id={`role-${value}`}
                      onClick={() => setRole(value)}
                      className={`relative flex flex-col items-start p-3 rounded-lg border text-left transition-colors shadow-2xs ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/80 text-emerald-950"
                          : "border-zinc-200/90 hover:border-zinc-300 bg-white/70 text-zinc-700"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                      )}
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center mb-2 ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900">
                          {label}
                        </p>
                        <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                          {subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Name (2 Cols) ──────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-semibold text-zinc-700 mb-1.5"
                >
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    disabled={isLoading}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ama"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200/90 bg-white/90 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-colors"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-semibold text-zinc-700 mb-1.5"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  disabled={isLoading}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Serwaa"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200/90 bg-white/90 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-colors"
                />
              </div>
            </div>

            {/* ── Email ─────────────────────────────────────────── */}
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

            {/* ── Password ──────────────────────────────────────── */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-zinc-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2 rounded-lg border border-zinc-200/90 bg-white/90 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* ── Confirm Password ──────────────────────────────── */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-zinc-700 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-9 pr-10 py-2 rounded-lg border border-zinc-200/90 bg-white/90 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 focus:outline-none transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* ── Error ─────────────────────────────────────────── */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50/90 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold block">Registration error</span>
                  {error}
                </div>
              </div>
            )}

            {/* ── Submit ────────────────────────────────────────── */}
            <button
              id="signup-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating Account…</span>
                </>
              ) : (
                <>
                  <span>Create {role === "farmer" ? "Farmer" : "Buyer"} Account</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>

            {/* ── Footer ────────────────────────────────────────── */}
            <div className="pt-4 text-center border-t border-zinc-200/60">
              <p className="text-xs text-zinc-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

