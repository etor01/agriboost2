// app/(auth)/layout.tsx

import React from 'react';

// This layout component will be shared by the login and signup pages.
// The (auth) route group ensures this layout applies only to routes within it.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      {/* Optional: Adds a subtle background image like on the landing page */}
      <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{backgroundImage: "url('https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=2787&auto=format&fit=crop')"}}></div>
      
      {/* This div centers the content and sets a max width for the form container */}
      <div className="relative w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
