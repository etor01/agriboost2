"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  Plus,
  Search,
  Package,
  Edit3,
  Trash2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Filter,
  X,
  ExternalLink,
} from "lucide-react";
import { updateListing, deleteListing, UpdateListingPayload } from "./actions";

type ListingItem = {
  id: string;
  name: string;
  description: string;
  price_per_unit: number;
  unit_type: string;
  quantity: number;
  status: string;
  image_urls: string[] | null;
  created_at: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

const UNIT_TYPES = [
  "kg",
  "bag",
  "crate",
  "ton",
  "bunch",
  "basket",
  "tuber",
  "piece",
  "box",
];

export default function MyListingsClientPage({
  user,
  initialListings,
}: {
  user: any;
  initialListings: any[];
}) {
  const [listings, setListings] = useState<ListingItem[]>(() =>
    initialListings.map((l) => ({
      id: String(l.id ?? ""),
      name: String(l.name ?? l.title ?? "Produce Listing"),
      description: String(l.description ?? ""),
      price_per_unit: Number(l.price_per_unit ?? 0),
      unit_type: String(l.unit_type ?? "kg"),
      quantity: Number(l.quantity ?? 0),
      status: String(l.status ?? "active"),
      image_urls: Array.isArray(l.image_urls) ? l.image_urls : null,
      created_at: String(l.created_at ?? ""),
    }))
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editingListing, setEditingListing] = useState<ListingItem | null>(
    null
  );
  const [deletingListing, setDeletingListing] = useState<ListingItem | null>(
    null
  );
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Statistics
  const totalListings = listings.length;
  const activeListingsCount = listings.filter(
    (l) => l.status.toLowerCase() === "active"
  ).length;
  const totalStock = listings.reduce((sum, l) => sum + (l.quantity || 0), 0);
  const totalValue = listings.reduce(
    (sum, l) => sum + (l.price_per_unit || 0) * (l.quantity || 0),
    0
  );

  // Filtered listings
  const filteredListings = listings.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      l.name.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.unit_type.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      l.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleUpdateSuccess = (updatedItem: ListingItem) => {
    setListings((prev) =>
      prev.map((l) => (l.id === updatedItem.id ? updatedItem : l))
    );
    setEditingListing(null);
    setToast({
      type: "success",
      message: "✅ Listing updated successfully!",
    });
  };

  const handleDeleteSuccess = (
    listingId: string,
    archived: boolean,
    customMsg?: string
  ) => {
    if (archived) {
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: "inactive" } : l))
      );
    } else {
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    }
    setDeletingListing(null);
    setToast({
      type: "success",
      message: customMsg || "🗑️ Listing removed successfully.",
    });
  };

  return (
    <main className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Toast Banner */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl transition-all ${
            toast.type === "error"
              ? "bg-red-50/90 border-red-200 text-red-800"
              : "bg-emerald-50/90 border-emerald-200 text-emerald-800"
          }`}
        >
          <span className="font-bold text-sm">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-700 font-bold text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: "url('/features.jpg')" }}
        />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
            <Tag className="h-3.5 w-3.5 text-emerald-400" /> Marketplace Ads
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            My Listings
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
            Manage your produce advertisements, update stock pricing and quantity, or publish new listings to the marketplace.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            href="/marketplace/new"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-400 to-green-400 text-emerald-950 font-bold rounded-2xl shadow-lg hover:from-emerald-300 hover:to-green-300 transition-all active:scale-95 text-sm"
          >
            <Plus className="h-4 w-4" /> + New Listing
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Tag className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Ads
            </p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {totalListings}
            </p>
            <p className="text-xs text-gray-500">Marketplace listings</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Inventory Value
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5 truncate">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-xs text-gray-500">Available produce worth</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Package className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Stock
            </p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {totalStock.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Units currently available</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Active Listings
            </p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {activeListingsCount}
            </p>
            <p className="text-xs text-emerald-600 font-semibold">
              ● Published & live
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Search and Filters Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings by title, description, or unit..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-800 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "active", "sold", "inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status === "ALL"
                  ? "All Status"
                  : status === "active"
                  ? "● Active"
                  : status === "sold"
                  ? "Sold Out"
                  : "Inactive"}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Listings Grid / Empty State */}
      {filteredListings.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
            <Tag className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {listings.length === 0
                ? "You Have No Marketplace Listings Yet"
                : "No Matching Listings Found"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {listings.length === 0
                ? "Post your harvested produce to reach verified agricultural buyers across Ghana."
                : "Try searching with different keywords or resetting your status filters."}
            </p>
          </div>
          {listings.length === 0 && (
            <Link
              href="/marketplace/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all"
            >
              <Plus className="h-4 w-4" /> + Create First Listing
            </Link>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((listing) => {
            const hasImage =
              listing.image_urls &&
              listing.image_urls.length > 0 &&
              listing.image_urls[0];

            return (
              <GlassCard
                key={listing.id}
                className="overflow-hidden flex flex-col justify-between hover:border-emerald-300 hover:shadow-xl transition-all duration-300"
              >
                <div>
                  {/* Image Header */}
                  <div className="relative h-44 w-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center overflow-hidden">
                    {hasImage ? (
                      <Image
                        src={listing.image_urls![0]}
                        alt={listing.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-emerald-600/40" />
                    )}
                    <div className="absolute top-3 right-3 z-10">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full shadow-md ${
                          listing.status.toLowerCase() === "active"
                            ? "bg-emerald-600 text-white"
                            : listing.status.toLowerCase() === "sold"
                            ? "bg-amber-600 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {listing.status.toLowerCase() === "active"
                          ? "● Active"
                          : listing.status.toLowerCase() === "sold"
                          ? "Sold Out"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {listing.name}
                      </h3>
                      <Link
                        href={`/marketplace`}
                        title="View on Marketplace"
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                      {listing.description || "No description provided."}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <div className="bg-emerald-50/70 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase block">
                          Price per {listing.unit_type}
                        </span>
                        <span className="text-sm font-extrabold text-emerald-950 mt-0.5 block">
                          {formatCurrency(listing.price_per_unit)}
                        </span>
                      </div>
                      <div className="bg-gray-50/80 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Available Stock
                        </span>
                        <span className="text-sm font-bold text-gray-800 mt-0.5 block">
                          {listing.quantity} {listing.unit_type}(s)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditingListing(listing)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-sm active:scale-95"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit Listing
                  </button>
                  <button
                    onClick={() => setDeletingListing(listing)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-white border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 hover:text-red-700 transition-all shadow-sm active:scale-95"
                    title="Delete Listing"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Edit Listing Modal */}
      {editingListing && (
        <EditListingModal
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingListing && (
        <DeleteConfirmModal
          listing={deletingListing}
          onClose={() => setDeletingListing(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </main>
  );
}

// ── Edit Listing Modal ──────────────────────────────────────────────────────────
function EditListingModal({
  listing,
  onClose,
  onSuccess,
}: {
  listing: ListingItem;
  onClose: () => void;
  onSuccess: (updated: ListingItem) => void;
}) {
  const [name, setName] = useState(listing.name);
  const [description, setDescription] = useState(listing.description);
  const [price, setPrice] = useState(String(listing.price_per_unit));
  const [unitType, setUnitType] = useState(listing.unit_type || "kg");
  const [quantity, setQuantity] = useState(String(listing.quantity));
  const [status, setStatus] = useState(listing.status || "active");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a title for this listing.");
      return;
    }
    setError("");
    setIsSaving(true);

    const payload: UpdateListingPayload = {
      name: name.trim(),
      description: description.trim(),
      price_per_unit: parseFloat(price) || 0,
      unit_type: unitType,
      quantity: parseInt(quantity, 10) || 0,
      status,
    };

    const res = await updateListing(listing.id, payload);
    setIsSaving(false);

    if (!res.success) {
      setError(res.error || "Failed to update listing.");
    } else {
      onSuccess({
        ...listing,
        name: payload.name,
        description: payload.description,
        price_per_unit: payload.price_per_unit,
        unit_type: payload.unit_type,
        quantity: payload.quantity,
        status: payload.status,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 sm:p-7 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-emerald-600" /> Edit Listing
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Produce Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fresh Organic Tomatoes"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe variety, harvest freshness, or location details..."
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Price per Unit (GH₵) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Unit Type *
              </label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              >
                {UNIT_TYPES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              >
                <option value="active">Active (Live)</option>
                <option value="sold">Sold Out</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ───────────────────────────────────────────────────
function DeleteConfirmModal({
  listing,
  onClose,
  onSuccess,
}: {
  listing: ListingItem;
  onClose: () => void;
  onSuccess: (id: string, archived: boolean, msg?: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    const res = await deleteListing(listing.id);
    setIsDeleting(false);

    if (!res.success) {
      setError(res.error || "Failed to delete listing.");
    } else {
      onSuccess(listing.id, !!res.archived, res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 sm:p-7 z-10">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-extrabold text-gray-900">
          Delete Marketplace Listing?
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Are you sure you want to remove{" "}
          <strong className="text-gray-800">&ldquo;{listing.name}&rdquo;</strong>? This
          action will remove the produce from the public marketplace.
        </p>

        {error && (
          <div className="mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}
