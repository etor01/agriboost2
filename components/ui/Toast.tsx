// components/ui/Toast.tsx
// Custom branded toast system — wraps react-hot-toast with AgriBoost styling.
// Usage: import { toast } from "@/components/ui/Toast"
//        toast.success("Crop added!") | toast.error("...") | toast.warning("...") | toast.info("...")
// The <AgriBoostToaster /> must be mounted once in the root layout.

"use client";

import React from "react";
import {
  Toaster,
  toast as hotToast,
  type Toast as HotToast,
} from "react-hot-toast";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ── Variant config ─────────────────────────────────────────────────────────────
type Variant = "success" | "error" | "warning" | "info";

interface ToastConfig {
  Icon: React.ElementType;
  leftBorder: string;
  iconCls: string;
  bgCls: string;
}

const CONFIGS: Record<Variant, ToastConfig> = {
  success: {
    Icon: CheckCircle2,
    leftBorder: "border-l-emerald-500",
    iconCls: "text-emerald-500",
    bgCls: "from-emerald-50/95 to-white/95",
  },
  error: {
    Icon: XCircle,
    leftBorder: "border-l-red-500",
    iconCls: "text-red-500",
    bgCls: "from-red-50/95 to-white/95",
  },
  warning: {
    Icon: AlertTriangle,
    leftBorder: "border-l-amber-500",
    iconCls: "text-amber-500",
    bgCls: "from-amber-50/95 to-white/95",
  },
  info: {
    Icon: Info,
    leftBorder: "border-l-blue-500",
    iconCls: "text-blue-500",
    bgCls: "from-blue-50/95 to-white/95",
  },
};

// ── Toast card component ───────────────────────────────────────────────────────
function ToastCard({
  t,
  message,
  variant,
}: {
  t: HotToast;
  message: string;
  variant: Variant;
}) {
  const { Icon, leftBorder, iconCls, bgCls } = CONFIGS[variant];

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3.5 rounded-xl
        border border-gray-100/80 border-l-4 ${leftBorder}
        shadow-[0_8px_30px_rgba(0,0,0,0.13)] backdrop-blur-xl
        bg-gradient-to-r ${bgCls}
        max-w-[380px] w-full pointer-events-auto
        transition-all duration-300
        ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${iconCls}`} />
      <p className="text-sm font-semibold text-gray-800 flex-1 leading-snug">
        {message}
      </p>
      <button
        onClick={() => hotToast.dismiss(t.id)}
        className="ml-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Internal show helper ───────────────────────────────────────────────────────
const show = (message: string, variant: Variant) =>
  hotToast.custom(
    (t) => <ToastCard t={t} message={message} variant={variant} />,
    { duration: variant === "error" ? 5000 : 3500 }
  );

// ── Public API ─────────────────────────────────────────────────────────────────
export const toast = {
  success: (message: string) => show(message, "success"),
  error:   (message: string) => show(message, "error"),
  warning: (message: string) => show(message, "warning"),
  info:    (message: string) => show(message, "info"),
};

// ── Toaster mount — add once to dashboard layout ───────────────────────────────
export function AgriBoostToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{ top: 20, right: 20, zIndex: 9999 }}
    />
  );
}
