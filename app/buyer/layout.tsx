// app/(buyer)/layout.tsx
"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import {
  type LucideIcon,
  ShoppingBag,
  ClipboardList,
  Heart,
  UserCircle2,
  LogOut,
  Menu,
  X,
  Sparkles,
  Wallet,
} from "lucide-react";
import BuyerWalletWidget from "@/components/wallet/BuyerWalletWidget";

// ── Buyer Nav Items ────────────────────────────────────────────────
const navItems: Array<{
  name: string;
  href: string;
  icon: LucideIcon;
  desc: string;
}> = [
    { name: "Shop", href: "/buyer/shop", icon: ShoppingBag, desc: "Browse produce" },
    { name: "My Orders", href: "/buyer/orders", icon: ClipboardList, desc: "Order history" },
    { name: "Wallet", href: "/buyer/wallet", icon: Wallet, desc: "Balance & top-up" },
    { name: "Wishlist", href: "/buyer/wishlist", icon: Heart, desc: "Saved items" },
    { name: "Account", href: "/buyer/account", icon: UserCircle2, desc: "Profile & settings" },
  ];

// ── Sidebar Component ──────────────────────────────────────────────
function BuyerSidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<{
    firstname: string | null;
    lastname: string | null;
    email: string | null;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      setProfileLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setProfileLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("firstname, lastname, email")
        .eq("id", user.id)
        .single();
      if (!cancelled) {
        setProfile(data ?? null);
        setProfileLoading(false);
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/market");
  };

  const displayName = profileLoading
    ? null
    : profile?.firstname
      ? `${profile.firstname}${profile.lastname ? ` ${profile.lastname}` : ""}`
      : "Buyer";

  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : "B";

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-full flex flex-col bg-white/80 backdrop-blur-xl border-r border-white/60 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-gray-100/80">
            <Link href="/buyer/shop" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-200">
                <Image
                  src="/icons/logo.png"
                  alt="AgriBoost"
                  width={26}
                  height={26}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-base font-bold text-gray-900">AgriBoost</span>
                <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">
                  Buyer Portal
                </p>
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
              My Portal
            </p>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/buyer/shop" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                    ${isActive
                        ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-200"
                        : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                      }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isActive
                        ? "bg-white/20"
                        : "bg-gray-100 group-hover:bg-teal-100"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p
                        className={`text-[10px] truncate ${isActive ? "text-white/70" : "text-gray-400"
                          }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-white/70 flex-shrink-0" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Wallet Widget */}
          <BuyerWalletWidget />

          {/* Bottom section */}
          <div className="px-4 pb-6 space-y-3 border-t border-gray-100/80 pt-4">

            {/* Profile strip */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow">
                {avatarLetter}
              </div>
              <div className="flex-1 min-w-0">
                {profileLoading ? (
                  <>
                    <div className="h-3.5 w-24 bg-gray-200 rounded animate-pulse mb-1.5" />
                    <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {profile?.email ?? "Buyer"}
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Layout ─────────────────────────────────────────────────────────
export default function BuyerLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: "url('/features.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-teal-900/30 via-white/60 to-emerald-900/20 -z-10" />

      <BuyerSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="lg:pl-72">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/icons/logo.png" alt="AgriBoost" width={30} height={30} />
            <span className="text-lg font-bold text-gray-900">AgriBoost</span>
          </div>
          {/* Wallet quick-access on mobile */}
          <div className="w-auto">
            <BuyerWalletWidget compact />
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
