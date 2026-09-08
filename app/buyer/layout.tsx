// app/buyer/layout.tsx
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
  Wallet,
  ChevronRight,
} from "lucide-react";
import BuyerWalletWidget from "@/components/wallet/BuyerWalletWidget";
import NotificationBell from "@/components/NotificationBell";

// ── Buyer Nav Items ────────────────────────────────────────────────
const navItems: Array<{
  name: string;
  href: string;
  icon: LucideIcon;
  desc: string;
}> = [
  { name: "Shop", href: "/buyer/shop", icon: ShoppingBag, desc: "Browse produce" },
  { name: "My Orders", href: "/buyer/orders", icon: ClipboardList, desc: "Order history & escrow" },
  { name: "Wallet", href: "/buyer/wallet", icon: Wallet, desc: "Balance & top-up" },
  { name: "Wishlist", href: "/buyer/wishlist", icon: Heart, desc: "Saved items" },
  { name: "Account", href: "/buyer/account", icon: UserCircle2, desc: "Profile & settings" },
];

// ── Sidebar Component ──────────────────────────────────────────────
function BuyerSidebar({
  isOpen,
  setIsOpen,
  profile,
  profileLoading,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  profile: any;
  profileLoading: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/market");
  };

  const displayName = profileLoading
    ? "Buyer"
    : profile?.firstname
      ? `${profile.firstname}${profile.lastname ? ` ${profile.lastname}` : ""}`
      : "Buyer";

  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : "B";

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          bg-white border-r border-zinc-200/90 shadow-xs
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo & Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <Link href="/buyer/shop" className="flex items-center gap-2.5 group" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-2xs group-hover:bg-emerald-700 transition-colors">
              <Image
                src="/icons/logo.png"
                alt="AgriBoost"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 tracking-tight">AgriBoost</p>
              <p className="text-[10px] text-emerald-600 font-semibold leading-none">Buyer Portal</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-zinc-800 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
            My Portal
          </p>
          <div className="space-y-0.5">
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
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors border-l-2 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-950 font-semibold border-emerald-600 pl-[10px] shadow-2xs"
                      : "text-zinc-600 border-transparent hover:text-emerald-700 hover:bg-emerald-50/60"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? "text-emerald-600" : "text-zinc-400 group-hover:text-emerald-600"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold">{item.name}</p>
                    <p className={`text-[10px] truncate ${isActive ? "text-emerald-800/80 font-normal" : "text-zinc-400"}`}>
                      {item.desc}
                    </p>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Wallet Widget */}
        <BuyerWalletWidget />

        {/* User profile & sign-out */}
        <div className="border-t border-zinc-100 p-3">
          <div className="flex items-center gap-2.5 px-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800 flex-shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-900 truncate">{displayName}</p>
              <p className="text-[10px] text-emerald-600 font-medium truncate">
                {profile?.email ?? "Buyer Account"}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Layout ─────────────────────────────────────────────────────────
export default function BuyerLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
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
        .select("id, firstname, lastname, email, avatar_url")
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
  }, [supabase]);

  const mobileAvatarLetter = profile?.firstname
    ? profile.firstname.charAt(0).toUpperCase()
    : (profile?.email?.charAt(0).toUpperCase() || "B");

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <BuyerSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        profile={profile}
        profileLoading={profileLoading}
      />

      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center shadow-2xs">
              <Image
                src="/icons/logo.png"
                alt="AgriBoost"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-bold text-zinc-900 tracking-tight">AgriBoost</span>
          </div>
          {/* Wallet quick-access on mobile */}
          <div className="flex items-center gap-2">
            <NotificationBell userId={profile?.id} />
            <Link href="/buyer/account" className="flex items-center flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 text-xs font-bold">
                {mobileAvatarLetter}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 sm:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
