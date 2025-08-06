// app/(auth)/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const LeafIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h4l2 4-2 4h4a2 2 0 0 1 2 2v2a7 7 0 0 1-7 7z" /><path d="M11 20A7 7 0 0 1 4 13V8" /><path d="M13 8V4.5A1.5 1.5 0 0 1 14.5 3L16 4.5V8" />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`, // Page to redirect to after password reset
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset link has been sent to your email address.');
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-4"><LeafIcon className="h-12 w-12 text-green-600" /></Link>
        <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
        <p className="text-gray-500 mt-2">Enter your email to receive a reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="you@example.com" />
        </div>

        {message && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{message}</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        <div>
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
      </form>
      <p className="mt-8 text-center text-sm text-gray-500">
        Remembered your password?{' '}
        <Link href="/login" className="font-medium text-green-600 hover:text-green-500">Sign In</Link>
      </p>
    </div>
  );
}