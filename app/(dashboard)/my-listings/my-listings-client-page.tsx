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
  X,
  ExternalLink,
  Store,
} from "lucide-react";
import { updateListing, deleteListing, UpdateListingPayload } from "./actions";
import {
  FarmerPageHeader,
  FarmerStatCard,
  FarmerBadge,
  FarmerCard,
  FarmerEmptyState,
} from "@/components/farmer/ui";

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
  const [editingListing, setEditingListing] = useState<ListingItem | null>(null);
  const [deletingListing, setDeletingListing] = useState<ListingItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
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
      message: "Listing updated successfully!",
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
      message: customMsg || "Listing removed successfully.",
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredListings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredListings.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDeactivate = async () => {
    setIsBulkProcessing(true);
    let successCount = 0;

    for (const id of selectedIds) {
      const listing = listings.find((l) => l.id === id);
      if (!listing) continue;

      const payload: UpdateListingPayload = {
        name: listing.name,
        description: listing.description,
        price_per_unit: listing.price_per_unit,
        unit_type: listing.unit_type,
        quantity: listing.quantity,
        status: "inactive",
      };

      const res = await updateListing(id, payload);
      if (res.success) {
        successCount++;
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: "inactive" } : l))
        );
      }
    }

    setIsBulkProcessing(false);
    setSelectedIds([]);
    setToast({
      type: "success",
      message: `Successfully deactivated ${successCount} listings.`,
    });
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} listings? Active orders may cause some to be archived instead.`
      )
    )
      return;

    setIsBulkProcessing(true);
    let successCount = 0;

    for (const id of selectedIds) {
      const res = await deleteListing(id);
      if (res.success) {
        successCount++;
        if (res.archived) {
          setListings((prev) =>
            prev.map((l) => (l.id === id ? { ...l, status: "inactive" } : l))
          );
        } else {
          setListings((prev) => prev.filter((l) => l.id !== id));
        }
      }
    }

    setIsBulkProcessing(false);
    setSelectedIds([]);
    setToast({
      type: "success",
      message: `Successfully processed ${successCount} listings.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-md shadow-lg border flex items-center gap-3 transition-all ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <span className="font-medium text-xs">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-zinc-400 hover:text-zinc-700 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <FarmerPageHeader
        badge="Marketplace Ads"
        badgeIcon={Store}
        title="My Listings"
        description="Manage your produce advertisements, update stock pricing and inventory, or publish new harvested crops to buyers."
        action={
          <Link
            href="/marketplace/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-md text-xs sm:text-sm transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Create Listing
          </Link>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FarmerStatCard
          title="Total Listings"
          value={totalListings}
          icon={Tag}
          sub="All advertisements"
        />
        <FarmerStatCard
          title="Inventory Value"
          value={formatCurrency(totalValue)}
          icon={DollarSign}
          iconColor="text-teal-600"
          iconBg="bg-teal-50 border-teal-100"
          sub="Stock gross value"
        />
        <FarmerStatCard
          title="Total Stock Units"
          value={totalStock.toLocaleString()}
          icon={Package}
          iconColor="text-lime-600"
          iconBg="bg-lime-50 border-lime-100"
          sub="Produce available"
        />
        <FarmerStatCard
          title="Live Status"
          value={activeListingsCount}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          sub="Published on market"
          accent
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings by title, description, or unit…"
            className="w-full pl-9 pr-4 py-1.5 rounded-md border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "active", "sold", "inactive"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-md text-xs font-medium uppercase transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {status === "ALL"
                ? "All Status"
                : status === "active"
                ? "Active"
                : status === "sold"
                ? "Sold Out"
                : "Inactive"}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid / Empty State */}
      {filteredListings.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm p-8 text-center">
          <FarmerEmptyState
            icon={Tag}
            title={
              listings.length === 0
                ? "You Have No Marketplace Listings Yet"
                : "No Matching Listings Found"
            }
            description={
              listings.length === 0
                ? "Post your harvested produce to reach verified agricultural buyers across Ghana."
                : "Try searching with different keywords or resetting your status filters."
            }
            action={
              listings.length === 0 ? (
                <Link
                  href="/marketplace/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-md text-xs sm:text-sm transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Create First Listing
                </Link>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              checked={
                selectedIds.length === filteredListings.length &&
                filteredListings.length > 0
              }
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
              id="selectAll"
            />
            <label
              htmlFor="selectAll"
              className="text-xs font-medium text-zinc-700 cursor-pointer"
            >
              Select All ({filteredListings.length})
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => {
              const hasImage =
                listing.image_urls &&
                listing.image_urls.length > 0 &&
                listing.image_urls[0];

              return (
                <FarmerCard
                  key={listing.id}
                  className="overflow-hidden flex flex-col justify-between hover:border-zinc-300 hover:shadow-md transition-all p-0"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-40 w-full bg-zinc-100 flex items-center justify-center overflow-hidden border-b border-zinc-100">
                      {hasImage ? (
                        <Image
                          src={listing.image_urls![0]}
                          alt={listing.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-zinc-300" />
                      )}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <FarmerBadge
                          variant={
                            listing.status.toLowerCase() === "active"
                              ? "success"
                              : listing.status.toLowerCase() === "sold"
                              ? "warn"
                              : "muted"
                          }
                        >
                          {listing.status.toLowerCase() === "active"
                            ? "Active"
                            : listing.status.toLowerCase() === "sold"
                            ? "Sold Out"
                            : "Inactive"}
                        </FarmerBadge>
                      </div>
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(listing.id)}
                          onChange={() => toggleSelectOne(listing.id)}
                          className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 bg-white shadow-sm cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-zinc-900 truncate">
                          {listing.name}
                        </h3>
                        <Link
                          href="/marketplace"
                          title="View on Marketplace"
                          className="text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      <p className="text-xs text-zinc-500 line-clamp-2 min-h-[32px] leading-relaxed">
                        {listing.description || "No description provided."}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
                        <div className="bg-zinc-50 rounded-md p-2">
                          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                            Price / {listing.unit_type}
                          </span>
                          <span className="text-xs font-bold text-zinc-900 mt-0.5 block">
                            {formatCurrency(listing.price_per_unit)}
                          </span>
                        </div>
                        <div className="bg-zinc-50 rounded-md p-2">
                          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                            Stock Available
                          </span>
                          <span className="text-xs font-semibold text-zinc-800 mt-0.5 block">
                            {listing.quantity} {listing.unit_type}(s)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="p-3 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setEditingListing(listing)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-white border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors shadow-xs"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-zinc-500" /> Edit Listing
                    </button>
                    <button
                      onClick={() => setDeletingListing(listing)}
                      className="p-1.5 rounded-md border border-zinc-200 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </FarmerCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-4 z-50 border border-zinc-800 animate-in slide-in-from-bottom-5">
          <span className="text-xs font-medium text-zinc-300">
            <strong className="text-white">{selectedIds.length}</strong> selected
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={isBulkProcessing}
              onClick={handleBulkDeactivate}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            >
              Deactivate
            </button>
            <button
              disabled={isBulkProcessing}
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1 text-zinc-400 hover:text-white rounded-md transition-colors ml-1"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
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
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl border border-zinc-200 p-6 z-10 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Edit3 className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">Edit Listing</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
              Produce Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fresh Organic Tomatoes"
              className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe variety, harvest freshness, or location details…"
              className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Price per Unit (GH₵) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Unit Type *
              </label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
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
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              >
                <option value="active">Active (Live)</option>
                <option value="sold">Sold Out</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save Changes"}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-zinc-200 p-6 z-10 space-y-4">
        <div className="w-10 h-10 rounded-md bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-zinc-900">
            Delete Marketplace Listing?
          </h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Are you sure you want to remove{" "}
            <strong className="text-zinc-800">&ldquo;{listing.name}&rdquo;</strong>? This
            will remove the produce advertisement from the public marketplace.
          </p>
        </div>

        {error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Delete Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

