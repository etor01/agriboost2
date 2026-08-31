// app/(auth)/layout.tsx

import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4 sm:p-6 bg-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background Image with Transparency & Soft Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-85"
        style={{ backgroundImage: "url('/features1.jpg')" }}
      />
      <div className="absolute inset-0 bg-zinc-950/25 backdrop-blur-[2px]" />

      {/* Auth Content Container */}
      <div className="relative w-full max-w-md z-10">{children}</div>

      {/* Footer Branding */}
      <footer className="relative mt-6 text-center text-xs text-white/80 font-medium drop-shadow-xs z-10">
        <p>
          &copy; {new Date().getFullYear()} AgriBoost · Better Farming, Better Ghana
        </p>
      </footer>
    </div>
  );
}
