"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  UserPlus,
  FileText,
  Check,
  X,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  approveFarmerVerification,
  rejectFarmerVerification,
} from "./actions";

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

const getStatusUI = (status: string) => {
  switch (status) {
    case "verified":
      return {
        icon: CheckCircle,
        className: "bg-green-100 text-green-700 border-green-200",
        label: "Verified",
      };
    case "pending":
      return {
        icon: Clock,
        className: "bg-amber-100 text-amber-700 border-amber-200",
        label: "Pending",
      };
    case "rejected":
      return {
        icon: XCircle,
        className: "bg-red-100 text-red-700 border-red-200",
        label: "Rejected",
      };
    default:
      return {
        icon: AlertCircle,
        className: "bg-gray-100 text-gray-700 border-gray-200",
        label: "Unverified",
      };
  }
};

export default function FarmersTableClient({
  initialFarmers,
}: {
  initialFarmers: FarmerProfile[];
}) {
  const [farmers, setFarmers] = useState<FarmerProfile[]>(initialFarmers);
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [rejectModalFarmer, setRejectModalFarmer] =
    useState<FarmerProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredFarmers = farmers.filter((f) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const name = [f.firstname, f.lastname].filter(Boolean).join(" ").toLowerCase();
    const email = (f.email || "").toLowerCase();
    const phone = (f.phone || "").toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  const total = farmers.length;
  const pendingCount = farmers.filter((f) => f.verification_status === "pending").length;
  const verifiedCount = farmers.filter((f) => f.verification_status === "verified").length;
  const rejectedCount = farmers.filter((f) => f.verification_status === "rejected").length;

  const handleApprove = async (farmer: FarmerProfile) => {
    const docUrl = farmer.id_card_url || farmer.verification_doc_url;
    if (!docUrl) {
      alert("Cannot approve farmer who hasn't uploaded a verification document.");
      return;
    }

    const fullName =
      [farmer.firstname, farmer.lastname].filter(Boolean).join(" ") || "this farmer";
    if (!confirm(`Are you sure you want to approve verification for ${fullName}?`)) {
      return;
    }

    setLoadingAction(farmer.id);
    const res = await approveFarmerVerification(farmer.id);
    setLoadingAction(null);

    if (res.success) {
      setFarmers((prev) =>
        prev.map((f) =>
          f.id === farmer.id
            ? { ...f, verification_status: "verified", verified_status: true }
            : f
        )
      );
    } else {
      alert(res.error || "Failed to approve farmer verification.");
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalFarmer) return;
    if (!rejectionReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }

    setLoadingAction(rejectModalFarmer.id);
    const res = await rejectFarmerVerification(
      rejectModalFarmer.id,
      rejectionReason.trim()
    );
    setLoadingAction(null);

    if (res.success) {
      setFarmers((prev) =>
        prev.map((f) =>
          f.id === rejectModalFarmer.id
            ? { ...f, verification_status: "rejected", verified_status: false }
            : f
        )
      );
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Reject Verification
              </h3>
              <button
                onClick={() => {
                  setRejectModalFarmer(null);
                  setRejectionReason("");
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Rejecting verification for{" "}
              <strong className="text-gray-900">
                {[rejectModalFarmer.firstname, rejectModalFarmer.lastname]
                  .filter(Boolean)
                  .join(" ") || "this farmer"}
              </strong>
              . Please state the reason:
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. ID card image is blurred or expired."
                rows={3}
                required
                className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalFarmer(null);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === rejectModalFarmer.id}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {loadingAction === rejectModalFarmer.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Reject Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review, verify, and manage all registered farmers and their verification documents.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Farmers", value: total, color: "text-gray-900" },
          { label: "Pending Review", value: pendingCount, color: "text-amber-600" },
          { label: "Verified", value: verifiedCount, color: "text-green-600" },
          { label: "Rejected", value: rejectedCount, color: "text-rose-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-700">All Farmers</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Farmer
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contact
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Plan
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Verification
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Document
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Joined
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredFarmers.map((farmer) => {
                const statusUI = getStatusUI(
                  farmer.verification_status ?? "unverified"
                );
                const StatusIcon = statusUI.icon;
                const fullName =
                  [farmer.firstname, farmer.lastname].filter(Boolean).join(" ") ||
                  "Unnamed Farmer";
                const docUrl = farmer.id_card_url || farmer.verification_doc_url;

                return (
                  <tr
                    key={farmer.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-emerald-200">
                          {farmer.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={farmer.avatar_url}
                              alt={fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-emerald-700">
                              {(farmer.firstname?.[0] ?? "?").toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {fullName}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            ID: {farmer.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{farmer.email ?? "—"}</p>
                      <p className="text-xs text-gray-400">
                        {farmer.phone ?? "No phone"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                          farmer.subscription_tier === "premium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {farmer.subscription_tier ?? "free"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusUI.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusUI.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {docUrl ? (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Doc <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400 border border-gray-200">
                          No Doc
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(farmer.created_at).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(farmer)}
                          disabled={
                            !docUrl ||
                            farmer.verification_status === "verified" ||
                            loadingAction === farmer.id
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm inline-flex items-center gap-1"
                          title={
                            !docUrl
                              ? "Upload document required"
                              : farmer.verification_status === "verified"
                              ? "Already verified"
                              : "Approve Verification"
                          }
                        >
                          {loadingAction === farmer.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          Approve
                        </button>

                        <button
                          onClick={() => setRejectModalFarmer(farmer)}
                          disabled={
                            loadingAction === farmer.id ||
                            farmer.verification_status === "rejected"
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                          title={
                            farmer.verification_status === "rejected"
                              ? "Already rejected"
                              : "Reject Verification"
                          }
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>

                        <Link
                          href={`/admin/farmers/${farmer.id}`}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-800 hover:underline ml-1"
                        >
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
          <div className="text-center py-16 px-4">
            <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">
              No Farmers Found
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
