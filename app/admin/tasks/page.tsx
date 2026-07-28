// app/admin/tasks/page.tsx
"use client";

import React, { useState } from "react";
import {
  type LucideIcon,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  Sparkles,
  Settings,
  UserCheck,
  Send,
  Sliders,
  FileCheck,
  Search,
  CheckCircle,
} from "lucide-react";

interface AdminTask {
  id: number;
  title: string;
  category: string;
  description: string;
  target: string;
  status: "Action Required" | "Active Alert" | "Operational" | "Pending Review";
  statusColor: string;
  icon: LucideIcon;
  actionLabel: string;
  actionMessage: string;
}

const INITIAL_ADMIN_TASKS: AdminTask[] = [
  {
    id: 1,
    title: "Verify Farmer Identity Documents",
    category: "Security & Trust",
    description: "Review newly uploaded government ID documents and certificates for pending farmers to authorize verification badges.",
    target: "Ama Osei (ID: #4092)",
    status: "Pending Review",
    statusColor: "bg-amber-100 text-amber-800 border-amber-200",
    icon: UserCheck,
    actionLabel: "Verify Documents",
    actionMessage: "Farmer verified successfully. Badges updated.",
  },
  {
    id: 2,
    title: "Moderate Flagged Listings",
    category: "Marketplace Integrity",
    description: "Inspect active listings flagged by buyers for incorrect weights, pricing discrepancies, or outdated harvest dates.",
    target: "Listing: 'Tomatoes Crate' by Boateng",
    status: "Action Required",
    statusColor: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
    actionLabel: "Inspect & Clear",
    actionMessage: "Listing reviewed. Flag dismissed after checking details.",
  },
  {
    id: 3,
    title: "Audit Escrow Payout Releases",
    category: "Finances & Payments",
    description: "Verify buyer OTP delivery confirmations and authorize the release of GHS escrow payments to farmer wallets.",
    target: "Order #AB-7491 (GHS 340.00)",
    status: "Pending Review",
    statusColor: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Wallet,
    actionLabel: "Release Escrow",
    actionMessage: "Escrow funds successfully released to farmer Mensah.",
  },
  {
    id: 4,
    title: "Monitor AI Diagnosis Trends",
    category: "AI Diagnostics",
    description: "Review disease scanning log entries. Identify regional trends (e.g. Maize Rust spikes in Ejisu) and update alerts.",
    target: "Ashanti Region Logs (24 scans today)",
    status: "Operational",
    statusColor: "bg-green-100 text-green-800 border-green-200",
    icon: Sparkles,
    actionLabel: "View Trend Map",
    actionMessage: "AI diagnostic models and outbreak parameters verified.",
  },
  {
    id: 5,
    title: "Configure Subscription Tiers",
    category: "Platform Settings",
    description: "Adjust global annual fees, trial durations, and benefit structures for '5-Star Farmer' subscriptions.",
    target: "Current: GHS 120 / Year",
    status: "Operational",
    statusColor: "bg-green-100 text-green-800 border-green-200",
    icon: Settings,
    actionLabel: "Modify Fees",
    actionMessage: "Subscription fee configurations updated on the database.",
  },
  {
    id: 6,
    title: "Resolve Order Delivery Disputes",
    category: "Arbitration",
    description: "Coordinate with logistics partners and mediate disputes between farmers and buyers regarding delivery delays.",
    target: "Buyer K. Mensah vs Farmer A. Osei",
    status: "Action Required",
    statusColor: "bg-red-100 text-red-800 border-red-200",
    icon: Sliders,
    actionLabel: "Mediate Dispute",
    actionMessage: "Dispute settled. Redelivery scheduled.",
  },
  {
    id: 7,
    title: "Define Crop Care templates",
    category: "AI Diagnostics",
    description: "Configure timeline parameters (planting to weeding, fertilizing offset) used to generate default crop todo lists.",
    target: "Maize, Tomato, & Cassava templates",
    status: "Operational",
    statusColor: "bg-green-100 text-green-800 border-green-200",
    icon: FileCheck,
    actionLabel: "Update Templates",
    actionMessage: "Crop care plan offsets updated for next season.",
  },
  {
    id: 8,
    title: "Manage Administrative Roles",
    category: "System Security",
    description: "Assign or revoke administrator roles for support staff, checking credentials and logging session keys.",
    target: "4 Active Administrators",
    status: "Operational",
    statusColor: "bg-green-100 text-green-800 border-green-200",
    icon: ShieldCheck,
    actionLabel: "Assign Role",
    actionMessage: "Admin access keys audited. Security logs green.",
  },
  {
    id: 9,
    title: "Broadcast Platform Weather Bulletins",
    category: "Alerts & Notifications",
    description: "Push extreme weather alerts and planting guidance bulletins to all farmers in targeted regions.",
    target: "Ashanti and Eastern Regions",
    status: "Active Alert",
    statusColor: "bg-red-100 text-red-800 border-red-200",
    icon: Send,
    actionLabel: "Broadcast Alert",
    actionMessage: "Weather warning successfully pushed to 452 dashboards.",
  },
  {
    id: 10,
    title: "Audit Paystack Webhook Logs",
    category: "Finances & Payments",
    description: "Audit automated webhook receipt notifications for any drops in subscription logs.",
    target: "Log Audit (100% success rate)",
    status: "Operational",
    statusColor: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    actionLabel: "Review Logs",
    actionMessage: "Webhook signatures and transaction reference logs verified.",
  },
];

export default function AdminTasksPage() {
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState(INITIAL_ADMIN_TASKS);
  const [toast, setToast] = useState("");

  const handleAction = (taskTitle: string, actionMsg: string) => {
    setToast(`${taskTitle}: ${actionMsg}`);
    setTimeout(() => setToast(""), 4000);
  };

  const filteredTasks = tasks.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <CheckCircle className="h-3.5 w-3.5" />
          </div>
          <p className="text-sm font-semibold">{toast}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Operations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Perform administrative tasks, manage platform configurations, and handle arbitrations.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex items-center gap-3 max-w-md">
        <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter admin tasks by name or category..."
          className="w-full bg-transparent focus:outline-none text-gray-800 text-sm placeholder-gray-400"
        />
      </div>

      {/* Grid of Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTasks.map((task) => {
          const Icon = task.icon;
          return (
            <div
              key={task.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-600">
                        {task.category}
                      </span>
                      <h3 className="text-sm font-bold text-gray-800 leading-snug">
                        {task.title}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${task.statusColor}`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {task.description}
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-500">
                  <strong className="text-gray-700">Target Entity: </strong>
                  {task.target}
                </div>
              </div>

              <button
                onClick={() => handleAction(task.title, task.actionMessage)}
                className="mt-4 w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
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
