"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  // State to manage form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for loading and feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Handler for form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      // On successful login, Supabase sets a session cookie.
      // We can now redirect the user to the protected dashboard page.
      router.push("/dashboard");
    }
  };

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
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Sign in to manage your farm.
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
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/20 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 transition-all hover:scale-[1.02]"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/20 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all"
            />
          </div>

          {/* Error */}
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
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Not a member?{" "}
          <Link
            href="/signup"
            className="text-green-600 hover:text-green-700 transition-all hover:scale-[1.02]"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

//     <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full">
//       {/* Header */}
//       <div className="text-center mb-8">
//         <Link href="/" className="inline-block mb-4" aria-label="Go to Homepage">
//           <Image alt="leaf icon" src="/icons/logo.png" width={60} height={60} />
//         </Link>
//         <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
//         <p className="text-gray-500 mt-2">Sign in to manage your farm.</p>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//             Email address
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             autoComplete="email"
//             required
//             disabled={isLoading}
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
//             placeholder="you@example.com"
//           />
//         </div>

//         <div>
//           <div className="flex items-center justify-between">
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <div className="text-sm">
//               <a href="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
//                 Forgot your password?
//               </a>
//             </div>
//           </div>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             autoComplete="current-password"
//             required
//             disabled={isLoading}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
//             placeholder="••••••••"
//           />
//         </div>

//         {/* Error Message Display */}
//         {error && (
//             <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
//         )}

//         <div>
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:bg-green-400 disabled:cursor-not-allowed"
//           >
//             {isLoading ? 'Signing In...' : 'Sign In'}
//             {/*add a spinner loader later*/}
//           </button>
//         </div>
//       </form>

//       {/* Footer */}
//       <p className="mt-8 text-center text-sm text-gray-500">
//         Not a member?{' '}
//         <Link href="/signup" className="font-medium text-green-600 hover:text-green-500">
//           Sign Up
//         </Link>
//       </p>
//     </div>
//   );
// }
