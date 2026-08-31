// app/admin/tasks/page.tsx
"use client";

import React, { useState } from "react";
import {
  type LucideIcon, ShieldCheck, AlertTriangle, Wallet, Sparkles,
  Settings, UserCheck, Send, Sliders, FileCheck, Search, CheckCircle,
} from "lucide-react";
import { AdminPageHeader, AdminBadge } from "@/components/admin/ui";

interface AdminTask {
  id: number;
  title: string;
  category: string;
  description: string;
  target: string;
  status: "Action Required" | "Active Alert" | "Operational" | "Pending Review";
  statusVariant: "danger" | "warn" | "success" | "blue";
  icon: LucideIcon;
  actionLabel: string;
  actionMessage: string;
}

const INITIAL_ADMIN_TASKS: AdminTask[] = [
  { id: 1, title: "Verify Farmer Identity Documents",    category: "Security & Trust",         description: "Review newly uploaded government ID documents and certificates for pending farmers to authorize verification badges.", target: "Ama Osei (ID: #4092)",                     status: "Pending Review",   statusVariant: "warn",    icon: UserCheck,   actionLabel: "Verify Documents",  actionMessage: "Farmer verified successfully. Badges updated." },
  { id: 2, title: "Moderate Flagged Listings",           category: "Marketplace Integrity",     description: "Inspect active listings flagged by buyers for incorrect weights, pricing discrepancies, or outdated harvest dates.",  target: "Listing: 'Tomatoes Crate' by Boateng",   status: "Action Required",  statusVariant: "danger",  icon: AlertTriangle, actionLabel: "Inspect & Clear",   actionMessage: "Listing reviewed. Flag dismissed after checking details." },
  { id: 3, title: "Audit Escrow Payout Releases",        category: "Finances & Payments",       description: "Verify buyer OTP delivery confirmations and authorize the release of GHS escrow payments to farmer wallets.",          target: "Order #AB-7491 (GHS 340.00)",             status: "Pending Review",   statusVariant: "warn",    icon: Wallet,      actionLabel: "Release Escrow",    actionMessage: "Escrow funds successfully released to farmer Mensah." },
  { id: 4, title: "Monitor AI Diagnosis Trends",         category: "AI Diagnostics",            description: "Review disease scanning log entries. Identify regional trends (e.g. Maize Rust spikes in Ejisu) and update alerts.",   target: "Ashanti Region Logs (24 scans today)",   status: "Operational",      statusVariant: "success", icon: Sparkles,    actionLabel: "View Trend Map",    actionMessage: "AI diagnostic models and outbreak parameters verified." },
  { id: 5, title: "Configure Subscription Tiers",        category: "Platform Settings",         description: "Adjust global annual fees, trial durations, and benefit structures for '5-Star Farmer' subscriptions.",               target: "Current: GHS 120 / Year",                status: "Operational",      statusVariant: "success", icon: Settings,    actionLabel: "Modify Fees",       actionMessage: "Subscription fee configurations updated on the database." },
  { id: 6, title: "Resolve Order Delivery Disputes",     category: "Arbitration",               description: "Coordinate with logistics partners and mediate disputes between farmers and buyers regarding delivery delays.",         target: "Buyer K. Mensah vs Farmer A. Osei",      status: "Action Required",  statusVariant: "danger",  icon: Sliders,     actionLabel: "Mediate Dispute",   actionMessage: "Dispute settled. Redelivery scheduled." },
  { id: 7, title: "Define Crop Care Templates",          category: "AI Diagnostics",            description: "Configure timeline parameters (planting to weeding, fertilizing offset) used to generate default crop todo lists.",    target: "Maize, Tomato, & Cassava templates",     status: "Operational",      statusVariant: "success", icon: FileCheck,   actionLabel: "Update Templates",  actionMessage: "Crop care plan offsets updated for next season." },
  { id: 8, title: "Manage Administrative Roles",         category: "System Security",           description: "Assign or revoke administrator roles for support staff, checking credentials and logging session keys.",               target: "4 Active Administrators",                status: "Operational",      statusVariant: "success", icon: ShieldCheck, actionLabel: "Assign Role",       actionMessage: "Admin access keys audited. Security logs green." },
  { id: 9, title: "Broadcast Platform Weather Bulletins",category: "Alerts & Notifications",    description: "Push extreme weather alerts and planting guidance bulletins to all farmers in targeted regions.",                      target: "Ashanti and Eastern Regions",            status: "Active Alert",     statusVariant: "danger",  icon: Send,        actionLabel: "Broadcast Alert",   actionMessage: "Weather warning successfully pushed to 452 dashboards." },
  { id: 10, title: "Audit Paystack Webhook Logs",        category: "Finances & Payments",       description: "Audit automated webhook receipt notifications for any drops in subscription logs.",                                     target: "Log Audit (100% success rate)",           status: "Operational",      statusVariant: "success", icon: CheckCircle, actionLabel: "Review Logs",       actionMessage: "Webhook signatures and transaction reference logs verified." },
];

export default function AdminTasksPage() {
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const handleAction = (taskTitle: string, actionMsg: string) => {
    setToast(`${taskTitle}: ${actionMsg}`);
    setTimeout(() => setToast(""), 4000);
  };

  const filteredTasks = INITIAL_ADMIN_TASKS.filter((t) => {
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 shadow-xl">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-3 w-3 text-white" />
          </div>
          <p className="text-sm text-white">{toast}</p>
        </div>
      )}

      <AdminPageHeader
        title="Admin Operations"
        description="Perform administrative tasks, manage platform configurations, and handle arbitrations."
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by task name or category…"
          className="w-full rounded-md border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const Icon = task.icon;
          return (
            <div key={task.id} className="rounded-lg border border-zinc-200 bg-white shadow-sm p-5 flex flex-col gap-3 hover:border-zinc-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">{task.category}</p>
                    <h3 className="text-sm font-medium text-zinc-900 leading-snug">{task.title}</h3>
                  </div>
                </div>
                <AdminBadge variant={task.statusVariant}>{task.status}</AdminBadge>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">{task.description}</p>

              <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                <strong className="text-zinc-700">Target: </strong>{task.target}
              </div>

              <button
                onClick={() => handleAction(task.title, task.actionMessage)}
                className="mt-auto w-full py-2 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-700 active:scale-[0.99] transition-all"
              >
                {task.actionLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
