// app/(dashboard)/layout.tsx
"use client";

import React, { useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

// ── Nav Items ──────────────────────────────────────────────────────
const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    emoji: "🏠",
    desc: "Overview",
  },
  {
    name: "My Profile",
    href: "/profile",
    emoji: "👤",
    desc: "Account",
  },
  {
    name: "Finances",
    href: "/finances",
    emoji: "💰",
    desc: "Earnings",
  },
  {
    name: "AI Center",
    href: "/ai-center",
    emoji: "🤖",
    desc: "Smart Tools",
  },
  {
    name: "Marketplace",
    href: "/marketplace",
    emoji: "🛒",
    desc: "Sell Produce",
  },
];

// ── Sidebar ────────────────────────────────────────────────────────
function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-full flex flex-col bg-white/80 backdrop-blur-xl border-r border-white/60 shadow-2xl">

          {/* Brand */}
          <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-gray-100/80">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Image src="/icons/logo.png" alt="AgriBoost" width={26} height={26} className="object-contain" />
              </div>
              <div>
                <span className="text-base font-bold text-gray-900">AgriBoost</span>
                <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Farm Dashboard</p>
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">Main Menu</p>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                  <div
                    className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-200"
                        : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                      isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-emerald-100"
                    }`}>
                      {item.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className={`text-[10px] truncate ${isActive ? "text-white/70" : "text-gray-400"}`}>{item.desc}</p>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-white/70 flex-shrink-0" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-4 pb-6 space-y-3 border-t border-gray-100/80 pt-4">
            {/* Upgrade Banner */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-4 text-white shadow-lg shadow-emerald-200">
              <p className="text-xs font-bold mb-1">🌟 Upgrade to Pro</p>
              <p className="text-[11px] text-white/80 mb-3">Unlock AI crop analysis & premium market insights</p>
              <button className="w-full py-1.5 rounded-lg bg-white text-emerald-700 text-xs font-bold hover:bg-emerald-50 transition-colors">
                Upgrade Now
              </button>
            </div>

            {/* User Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-sm font-bold shadow">
                F
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">Farmer</p>
                <p className="text-xs text-gray-400 truncate">Free Plan</p>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Layout ─────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Global Background */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: "url('/features.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/30 via-white/60 to-green-900/20 -z-10" />

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="lg:pl-72">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-600">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Image src="/icons/logo.png" alt="AgriBoost" width={30} height={30} />
            <span className="text-lg font-bold text-gray-900">AgriBoost</span>
          </div>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
