'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminProfile, AdminLevel } from '@/lib/admin';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Star,
  Shield,
  Sparkles,
  Settings,
  Activity,
  LogOut,
  Menu,
  X,
  Crown,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  levels: AdminLevel[];
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ── Nav Definition ───────────────────────────────────────────────────────────

const ALL_LEVELS: AdminLevel[] = ['super_admin', 'moderator', 'support'];
const MOD_AND_ABOVE: AdminLevel[] = ['super_admin', 'moderator'];
const SUPER_ONLY: AdminLevel[] = ['super_admin'];

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, levels: ALL_LEVELS },
      { name: 'Activity Log', href: '/admin/activity', icon: Activity, levels: ALL_LEVELS },
    ],
  },
  {
    title: 'USERS',
    items: [
      { name: 'Farmers', href: '/admin/farmers', icon: Users, levels: MOD_AND_ABOVE },
      { name: 'Buyers', href: '/admin/buyers', icon: ShoppingBag, levels: MOD_AND_ABOVE },
      { name: 'Admin Team', href: '/admin/team', icon: Shield, levels: SUPER_ONLY },
    ],
  },
  {
    title: 'MARKETPLACE',
    items: [
      { name: 'Orders & Disputes', href: '/admin/orders', icon: ShoppingCart, levels: MOD_AND_ABOVE },
      { name: 'AI Diagnostics', href: '/admin/diagnostics', icon: Sparkles, levels: MOD_AND_ABOVE },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { name: 'Transactions', href: '/admin/transactions', icon: CreditCard, levels: SUPER_ONLY },
      { name: 'Subscriptions', href: '/admin/subscriptions', icon: Star, levels: SUPER_ONLY },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      { name: 'Settings', href: '/admin/settings', icon: Settings, levels: SUPER_ONLY },
    ],
  },
];

// ── Level meta helpers ───────────────────────────────────────────────────────

function getLevelStyle(level: AdminLevel) {
  switch (level) {
    case 'super_admin':
      return { label: 'Super Admin', text: 'text-zinc-400', bg: 'bg-zinc-800' };
    case 'moderator':
      return { label: 'Moderator', text: 'text-zinc-400', bg: 'bg-zinc-800' };
    case 'support':
      return { label: 'Support', text: 'text-zinc-400', bg: 'bg-zinc-800' };
    default:
      return { label: 'Admin', text: 'text-zinc-400', bg: 'bg-zinc-800' };
  }
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function AdminSidebar({
  isOpen,
  setIsOpen,
  adminProfile,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  adminProfile: AdminProfile | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const adminLevel = adminProfile?.admin_level ?? 'moderator';
  const levelStyle = getLevelStyle(adminLevel);
  const initials =
    `${adminProfile?.firstname?.[0] ?? ''}${adminProfile?.lastname?.[0] ?? ''}`.toUpperCase() || 'A';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.levels.includes(adminLevel)),
  })).filter((section) => section.items.length > 0);

  return (
    <>
      <div
        className={`fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          bg-zinc-950 border-r border-zinc-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900">
          <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight">AgriBoost</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {visibleSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-2 text-[10px] font-bold tracking-wider text-zinc-600 uppercase">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/admin/dashboard'
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border-l-2
                        ${
                          isActive
                            ? 'bg-zinc-900 text-white border-emerald-500'
                            : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-zinc-900 p-4">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">
                {adminProfile?.firstname} {adminProfile?.lastname}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">{levelStyle.label}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Main Shell ───────────────────────────────────────────────────────────────

export default function AdminShell({
  children,
  adminProfile,
}: {
  children: React.ReactNode;
  adminProfile: AdminProfile | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-zinc-50 min-h-screen">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} adminProfile={adminProfile} />

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <header className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Admin Panel</span>
          </div>
          <div className="w-5" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
