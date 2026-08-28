"use client";
// components/ui/InstallPrompt.tsx
// Phase 6 — PWA Install Banner
// Shows a dismissible install prompt when the browser fires `beforeinstallprompt`.
// Renders inside the dashboard layout so farmers always see it.
// Persists dismissal in localStorage to avoid re-showing for 7 days.

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import Image from "next/image";

// Extend Window to include the non-standard beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "agriboost-pwa-install-dismissed";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if dismissed recently
    const raw = localStorage.getItem(DISMISS_KEY);
    if (raw) {
      const ts = parseInt(raw, 10);
      if (Date.now() - ts < DISMISS_TTL_MS) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Install AgriBoost app"
      className="fixed bottom-5 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50
                 bg-gradient-to-br from-emerald-900 to-green-800
                 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl
                 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300"
    >
      {/* App Icon */}
      <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-green-700 shadow-inner">
        <Image
          src="/icons/logo.png"
          alt="AgriBoost"
          width={44}
          height={44}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm leading-tight">
          Install AgriBoost
        </p>
        <p className="text-emerald-300 text-xs mt-0.5 leading-tight">
          Access your farm tools offline, anytime.
        </p>
      </div>

      {/* Install Button */}
      <button
        id="pwa-install-btn"
        onClick={handleInstall}
        className="flex-shrink-0 flex items-center gap-1.5 bg-emerald-400 hover:bg-emerald-300
                   text-emerald-950 text-xs font-bold px-3 py-1.5 rounded-xl
                   transition-colors shadow"
        aria-label="Install app"
      >
        <Download size={13} />
        Install
      </button>

      {/* Dismiss */}
      <button
        id="pwa-install-dismiss-btn"
        onClick={handleDismiss}
        className="flex-shrink-0 text-emerald-400 hover:text-white transition-colors p-1"
        aria-label="Dismiss install prompt"
      >
        <X size={15} />
      </button>
    </div>
  );
}
