// 'use client';

// import { useState } from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import { useRouter } from 'next/navigation';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const router = useRouter();

//   async function handleLogin() {
//     const { error } = await supabase.auth.signInWithPassword({ email, password });
//     if (error) alert(error.message);
//     else router.push('/dashboard');
//   }

//   return (
//     <div className="flex flex-col items-center justify-center h-screen">
//       <h1 className="text-2xl font-bold mb-4">Login</h1>
//       <input
//         className="border p-2 mb-2"
//         type="email"
//         placeholder="Email"
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         className="border p-2 mb-2"
//         type="password"
//         placeholder="Password"
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <button
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//         onClick={handleLogin}
//       >
//         Login
//       </button>
//     </div>
//   );
// }

'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // Assuming @ is configured for your project root
import { useRouter } from 'next/navigation';
import Link from "next/link";

// Reusing the LeafIcon for consistency
const LeafIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h4l2 4-2 4h4a2 2 0 0 1 2 2v2a7 7 0 0 1-7 7z" />
    <path d="M11 20A7 7 0 0 1 4 13V8" />
    <path d="M13 8V4.5A1.5 1.5 0 0 1 14.5 3L16 4.5V8" />
  </svg>
);

export default function LoginPage() {
  // State to manage form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State for loading and feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      router.push('/dashboard');
    }
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-4" aria-label="Go to Homepage">
          <LeafIcon className="h-12 w-12 text-green-600" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="text-gray-500 mt-2">Sign in to manage your farm.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                Forgot your password?
              </a>
            </div>
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
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
            placeholder="••••••••"
          />
        </div>

        {/* Error Message Display */}
        {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-500">
        Not a member?{' '}
        <Link href="/signup" className="font-medium text-green-600 hover:text-green-500">
          Sign Up
        </Link>
      </p>
    </div>
  );
}