// 'use client';

// import { useState } from 'react';
// import { supabase } from '@/lib/supabaseClient';

// export default function SignupPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   async function handleSignup() {
//     const { error } = await supabase.auth.signUp({ email, password });
//     if (error) alert(error.message);
//     else alert('Check your email for verification!');
//   }

//   return (
//     <div className="flex flex-col items-center justify-center h-screen">
//       <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
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
//         className="bg-green-600 text-white px-4 py-2 rounded"
//         onClick={handleSignup}
//       >
//         Sign Up
//       </button>
//     </div>
//   );
// }

'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // Assuming @ is configured for your project root

// Reusing the LeafIcon for consistency
const LeafIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h4l2 4-2 4h4a2 2 0 0 1 2 2v2a7 7 0 0 1-7 7z" />
    <path d="M11 20A7 7 0 0 1 4 13V8" />
    <path d="M13 8V4.5A1.5 1.5 0 0 1 14.5 3L16 4.5V8" />
  </svg>
);

export default function SignUpPage() {
  // State to manage form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for loading and feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This 'data' object is passed to the trigger function we created in SQL.
        data: {
          full_name: fullName,
        },
        // Supabase sends a verification email by default.
        // The user must click the link in the email to be fully registered.
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage("Success! Please check your email to verify your account.");
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <a href="/" className="inline-block mb-4" aria-label="Go to Homepage">
          <LeafIcon className="h-12 w-12 text-green-600" />
        </a>
        <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
        <p className="text-gray-500 mt-2">Join AgriBoost and revolutionize your farming.</p>
      </div>

      {/* Form */}
      {/* Show success message if registration was successful */}
      {successMessage ? (
        <div className="text-center p-4 bg-green-50 text-green-800 rounded-lg">
          <h3 className="font-bold">Check your inbox!</h3>
          <p>{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              disabled={isLoading}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
              placeholder="e.g., Ama Serwaa"
            />
          </div>

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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
              placeholder="Minimum 6 characters"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-green-600 hover:text-green-500">
              Sign In
            </a>
          </p>
        </form>
      )}
    </div>
  );
}