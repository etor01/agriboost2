// app/(auth)/layout.tsx

import React from "react";

// This layout component will be shared by the login and signup pages.
// The (auth) route group ensures this layout applies only to routes within it.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      {/* subtle background image like on the landing page */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90"
        style={{ backgroundImage: "url('/features1.jpg')" }}
      ></div>

      {/* This div centers the content and sets a max width for the form container */}
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
