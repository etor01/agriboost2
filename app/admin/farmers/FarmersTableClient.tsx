"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search, CheckCircle, Clock, XCircle, AlertCircle,
  UserPlus, FileText, Check, X, RefreshCw, ExternalLink,
} from "lucide-react";
import { approveFarmerVerification, rejectFarmerVerification } from "./actions";
import { AdminBadge, AdminEmptyState } from "@/components/admin/ui";

export interface FarmerProfile {
  id: string;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  email: string | null;
  verification_status: string | null;
  verified_status?: boolean | null;
  verification_doc_url: string | null;
  id_card_url: string | null;
  avatar_url: string | null;
  subscription_tier: string | null;
  created_at: string;
}

type BadgeVariant = 'success' | 'warn' | 'danger' | 'muted';

const getStatusBadge = (status: string): { variant: BadgeVariant; label: string; icon: typeof CheckCircle } => {
  switch (status) {
    case "verified":  return { variant: "success", label: "Verified",   icon: CheckCircle };
    case "pending":   return { variant: "warn",    label: "Pending",    icon: Clock };
    case "rejected":  return { variant: "danger",  label: "Rejected",   icon: XCircle };
    default:          return { variant: "muted",   label: "Unverified", icon: AlertCircle };
  }
};

export default function FarmersTableClient({ initialFarmers }: { initialFarmers: FarmerProfile[] }) {
  const [farmers, setFarmers] = useState<FarmerProfile[]>(initialFarmers);
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [rejectModalFarmer, setRejectModalFarmer] = useState<FarmerProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredFarmers = farmers.filter((f) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const name = [f.firstname, f.lastname].filter(Boolean).join(" ").toLowerCase();
    return name.includes(q) || (f.email || "").toLowerCase().includes(q) || (f.phone || "").toLowerCase().includes(q);
  });

  const total = farmers.length;
  const pendingCount = farmers.filter((f) => f.verification_status === "pending").length;
  const verifiedCount = farmers.filter((f) => f.verification_status === "verified").length;
  const rejectedCount = farmers.filter((f) => f.verification_status === "rejected").length;

  const handleApprove = async (farmer: FarmerProfile) => {
    const docUrl = farmer.id_card_url || farmer.verification_doc_url;
    if (!docUrl) { alert("Cannot approve farmer who hasn't uploaded a verification document."); return; }
    const fullName = [farmer.firstname, farmer.lastname].filter(Boolean).join(" ") || "this farmer";
    if (!confirm(`Approve verification for ${fullName}?`)) return;
    setLoadingAction(farmer.id);
    const res = await approveFarmerVerification(farmer.id);
    setLoadingAction(null);
    if (res.success) {
      setFarmers((prev) => prev.map((f) => f.id === farmer.id ? { ...f, verification_status: "verified", verified_status: true } : f));
    } else {
      alert(res.error || "Failed to approve farmer verification.");
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalFarmer) return;
    if (!rejectionReason.trim()) { alert("Please enter a reason for rejection."); return; }
    setLoadingAction(rejectModalFarmer.id);
    const res = await rejectFarmerVerification(rejectModalFarmer.id, rejectionReason.trim());
    setLoadingAction(null);
    if (res.success) {
      setFarmers((prev) => prev.map((f) => f.id === rejectModalFarmer.id ? { ...f, verification_status: "rejected", verified_status: false } : f));
      setRejectModalFarmer(null);
      setRejectionReason("");
    } else {
      alert(res.error || "Failed to reject farmer verification.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Rejection Modal */}
      {rejectModalFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-zinc-200 shadow-xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900">Reject Verification</h3>
              <button onClick={() => { setRejectModalFarmer(null); setRejectionReason(""); }}
                className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-zinc-600">
              Rejecting verification for{" "}
              <strong className="text-zinc-900">
                {[rejectModalFarmer.firstname, rejectModalFarmer.lastname].filter(Boolean).join(" ") || "this farmer"}
              </strong>. Please state the reason:
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. ID card image is blurred or expired."
                rows={3}
                required
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button"
                  onClick={() => { setRejectModalFarmer(null); setRejectionReason(""); }}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-md transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  disabled={loadingAction === rejectModalFarmer.id}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 inline-flex items-center gap-1.5">
                  {loadingAction === rejectModalFarmer.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                  Reject Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Farmer Management</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Review, verify, and manage all registered farmers and their verification documents.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Farmers",  value: total,         color: "text-zinc-900" },
          { label: "Pending Review", value: pendingCount,  color: "text-amber-600" },
          { label: "Verified",       value: verifiedCount, color: "text-emerald-600" },
          { label: "Rejected",       value: rejectedCount, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm text-center">
            <p className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-zinc-900">All Farmers</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                {["Farmer", "Contact", "Plan", "Verification", "Document", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredFarmers.map((farmer) => {
                const { variant, label, icon: StatusIcon } = getStatusBadge(farmer.verification_status ?? "unverified");
                const fullName = [farmer.firstname, farmer.lastname].filter(Boolean).join(" ") || "Unnamed Farmer";
                const docUrl = farmer.id_card_url || farmer.verification_doc_url;
                return (
                  <tr key={farmer.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {farmer.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={farmer.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-medium text-zinc-600">{(farmer.firstname?.[0] ?? "?").toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-800">{fullName}</p>
                          <p className="text-[11px] text-zinc-400">ID: {farmer.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-zinc-600">{farmer.email ?? "—"}</p>
                      <p className="text-xs text-zinc-400">{farmer.phone ?? "No phone"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <AdminBadge variant={farmer.subscription_tier === "premium" ? "warn" : "muted"}>
                        {farmer.subscription_tier ?? "free"}
                      </AdminBadge>
                    </td>
                    <td className="px-5 py-3.5">
                      <AdminBadge variant={variant} icon={StatusIcon}>{label}</AdminBadge>
                    </td>
                    <td className="px-5 py-3.5">
                      {docUrl ? (
                        <a href={docUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline">
                          <FileText className="w-3 h-3" />
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <AdminBadge variant="muted">No Doc</AdminBadge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400">
                      {new Date(farmer.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(farmer)}
                          disabled={!docUrl || farmer.verification_status === "verified" || loadingAction === farmer.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {loadingAction === farmer.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModalFarmer(farmer)}
                          disabled={loadingAction === farmer.id || farmer.verification_status === "rejected"}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                        <Link href={`/admin/farmers/${farmer.id}`}
                          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
                          Details →
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredFarmers.length === 0 && (
          <AdminEmptyState
            icon={UserPlus}
            title="No Farmers Found"
            description="Try adjusting your search query."
          />
        )}
      </div>
    </div>
  );
}
