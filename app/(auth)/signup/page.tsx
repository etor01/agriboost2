"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Tractor, ShoppingBag, Check } from "lucide-react";

type Role = "farmer" | "buyer";

export default function SignUpPage() {
  const [role, setRole] = useState<Role>("farmer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Passed to the handle_new_user trigger which populates profiles
        data: {
          firstname: firstName.trim(),
          lastname: lastName.trim(),
          role,  // 'farmer' | 'buyer'
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccessMessage(
        "Success! Please check your email to verify your account."
      );
    }

    setIsLoading(false);
  };

  const roleOptions: Array<{
    value: Role;
    label: string;
    subtitle: string;
    Icon: React.ElementType;
  }> = [
    {
      value: "farmer",
      label: "I'm a Farmer",
      subtitle: "List & sell your produce",
      Icon: Tractor,
    },
    {
      value: "buyer",
      label: "I'm a Buyer",
      subtitle: "Browse & order fresh produce",
      Icon: ShoppingBag,
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 md:p-10 transition-all">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block mb-4 hover:scale-[1.05] transition-all"
            aria-label="Go to Homepage"
          >
            <Image
              alt="leaf icon"
              src="/icons/logo.png"
              width={60}
              height={60}
            />
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Join AgriBoost — growing together.
          </p>
        </div>

        {/* Success State */}
        {successMessage ? (
          <div className="text-center px-4 py-5 bg-green-50/70 border border-green-200 rounded-2xl">
            <h3 className="font-semibold text-green-800 tracking-tight">
              Check your inbox
            </h3>
            <p className="text-sm text-green-700 mt-1">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Role Selection ─────────────────────────────────── */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                I am registering as a…
              </p>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map(({ value, label, subtitle, Icon }) => {
                  const isSelected = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      id={`role-${value}`}
                      onClick={() => setRole(value)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.02] active:scale-95 ${
                        isSelected
                          ? "border-green-500 bg-green-50/80 shadow-md shadow-green-100"
                          : "border-white/30 bg-white/40 hover:border-gray-200"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                        </span>
                      )}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? "bg-green-500 text-white shadow-lg shadow-green-200"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            isSelected ? "text-green-700" : "text-slate-700"
                          }`}
                        >
                          {label}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Name ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  disabled={isLoading}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g., Ama"
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/20 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-slate-700 mb-1"
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
                  placeholder="e.g., Serwaa"
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/20 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all"
                />
              </div>
            </div>

            {/* ── Email ─────────────────────────────────────────── */}
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
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/20 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all"
              />
            </div>

            {/* ── Password ──────────────────────────────────────── */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/20 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all"
              />
            </div>

            {/* ── Confirm Password ──────────────────────────────── */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/20 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all"
              />
            </div>

            {/* ── Error ─────────────────────────────────────────── */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50/70 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* ── Submit ────────────────────────────────────────── */}
            <button
              id="signup-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-full bg-green-600 text-white text-sm font-medium tracking-tight transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Creating Account..."
                : `Sign Up as ${role === "farmer" ? "Farmer 🌾" : "Buyer 🛒"}`}
            </button>

            {/* ── Footer ────────────────────────────────────────── */}
            <p className="mt-2 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 transition-all hover:scale-[1.02]"
              >
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
