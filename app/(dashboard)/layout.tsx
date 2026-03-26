// app/(dashboard)/layout.tsx
"use client";

import React, { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// --- ICONS ---
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const LogOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// Sidebar Navigation Links
const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "My Profile", href: "/profile" },
  { name: "Finances", href: "/finances" },
  { name: "AI Center", href: "/ai-center" },
];

// sideBar type definitions
type NavItem = {
  name: string;
  href: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
};

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

// Sidebar Component
function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-full flex flex-col justify-between bg-slate-950 text-slate-200 px-5 py-6 border-r border-slate-800">
          {/* Top */}
          <div>
            {/* Brand */}
            <div className="flex items-center justify-between mb-10">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="text-lg font-semibold text-white">
                  AgriBoost
                </span>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer
                      ${
                        isActive
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {item.icon && (
                        <item.icon
                          size={18}
                          className={`${
                            isActive
                              ? "text-white"
                              : "text-slate-500 group-hover:text-white"
                          }`}
                        />
                      )}
                      <span>{item.name}</span>

                      {isActive && (
                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/20">
                          Active
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom */}
          <div className="space-y-4">
            {/* Profile */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                A
              </div>
              <div>
                <p className="text-sm font-medium text-white">Ama Serwaa</p>
                <p className="text-xs text-slate-400">Farmer</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <LogOutIcon className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>

    // <>
    //   <div
    //     className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${isOpen ? "block" : "hidden"}`}
    //     onClick={() => setIsOpen(false)}
    //   ></div>
    //   <aside
    //     className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    //   >
    //     <div className="flex items-center justify-between p-6 border-b border-gray-700">
    //       <Link href="/dashboard" className="flex items-center space-x-3">
    //         <Image
    //           alt="leaf icon"
    //           src="/icons/logo.png"
    //           width={40}
    //           height={40}
    //         />
    //         <span className="text-2xl font-bold">AgriBoost</span>
    //       </Link>
    //       <button
    //         onClick={() => setIsOpen(false)}
    //         className="lg:hidden text-gray-400 hover:text-white"
    //       >
    //         <XIcon className="h-6 w-6" />
    //       </button>
    //     </div>

    //     <nav className="flex-1 px-4 py-6 space-y-2">
    //       {navItems.map((item) => (
    //         <Link
    //           key={item.name}
    //           href={item.href}
    //           className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white`}
    //         >
    //           {item.name}
    //         </Link>
    //       ))}
    //     </nav>

    //     <div className="p-6 border-t border-gray-700">
    //       <button
    //         onClick={handleSignOut}
    //         className="flex w-full items-center px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
    //       >
    //         <LogOutIcon className="h-5 w-5 mr-3" />
    //         Logout
    //       </button>
    //     </div>
    //   </aside>
    // </>
  );
}

// Main Layout Component
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:pl-64">
        <header className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)}>
            <MenuIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <Image
              alt="leaf icon"
              src="/icons/logo.png"
              width={35}
              height={35}
            />
            <span className="text-xl font-bold text-gray-800">AgriBoost</span>
          </div>
          <div className="w-6"></div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
