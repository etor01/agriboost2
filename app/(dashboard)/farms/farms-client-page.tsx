"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Search, Sprout, Plus, CheckCircle2, ChevronRight, Tractor, Target, Layers, ArrowRight } from "lucide-react";
import { addFarm } from "../farm/new/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type FarmItem = {
  id: string;
  name: string;
  location: string;
  size_in_acres: number;
  crop: string;
  status: string;
};

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

export default function FarmsClientPage({
  user,
  initialFarms,
}: {
  user: any;
  initialFarms: any[];
}) {
  const [farms, setFarms] = useState<FarmItem[]>(() =>
    initialFarms.map((farm) => ({
      id: String(farm.id ?? ""),
      name: String(farm.name ?? "Untitled Farm"),
      location: String(farm.location ?? "Ghana"),
      size_in_acres: Number(farm.size_in_acres ?? 0),
      crop: String(farm.primary_crop ?? farm.crop ?? "Mixed Crops"),
      status: String(farm.status ?? "Active"),
    }))
  );

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Statistics
  const totalFarms = farms.length;
  const totalAcres = farms.reduce((sum, f) => sum + (f.size_in_acres || 0), 0);
  const uniqueCrops = new Set(
    farms.map((f) => f.crop.trim()).filter(Boolean)
  ).size;
  const activeFarmsCount = farms.filter(
    (f) => f.status.toLowerCase() === "active"
  ).length;

  // Filtered farms
  const filteredFarms = farms.filter((farm) => {
    const q = search.toLowerCase();
    return (
      farm.name.toLowerCase().includes(q) ||
      farm.location.toLowerCase().includes(q) ||
      farm.crop.toLowerCase().includes(q)
    );
  });

  return (
    <main className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: "url('/features.jpg')" }}
        />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
            <Tractor className="h-3.5 w-3.5 text-emerald-400" /> Agricultural Assets
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            My Farms
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
            Manage your agricultural properties, track crop types, and monitor land acreage across your registered farms.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            id="add-farm-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-400 to-green-400 text-emerald-950 font-bold rounded-2xl shadow-lg hover:from-emerald-300 hover:to-green-300 transition-all active:scale-95 text-sm"
          >
            <Plus className="h-4 w-4" /> Add New Farm
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Tractor className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Farms
            </p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {totalFarms}
            </p>
            <p className="text-xs text-gray-500">Registered plots</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <Layers className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Area
            </p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {totalAcres.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Acres under management</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Sprout className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Crop Types
            </p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {uniqueCrops}
            </p>
            <p className="text-xs text-gray-500">Active cultivars</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Active Status
            </p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {activeFarmsCount}
            </p>
            <p className="text-xs text-emerald-600 font-semibold">
              ● Active properties
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
              placeholder="Search farms by name, location, or crop..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-800 placeholder:text-gray-400"
            />
          </div>
          <div className="text-xs font-semibold text-gray-500 self-center">
            Showing <span className="text-gray-900 font-bold">{filteredFarms.length}</span> of <span className="text-gray-900 font-bold">{totalFarms}</span> farms
          </div>
        </div>
      </GlassCard>

      {/* Farms Grid / Empty State */}
      {filteredFarms.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
            <Sprout className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {farms.length === 0
                ? "No Farms Added Yet"
                : "No Matching Farms Found"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {farms.length === 0
                ? "Add your agricultural land to track seasonal crops, log harvest records, and connect with prospective produce buyers."
                : "Try adjusting your search keywords to find the farm you are looking for."}
            </p>
          </div>
          {farms.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all"
            >
              <Plus className="h-4 w-4" /> Add Your First Farm
            </button>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFarms.map((farm) => (
            <Link key={farm.id} href={`/farm/${farm.id}`} className="group block">
              <GlassCard className="p-5 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Sprout className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${farm.status.toLowerCase() === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      ● {farm.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                      {farm.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      {farm.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <div className="bg-gray-50/80 rounded-xl p-2.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">
                        Primary Crop
                      </span>
                      <span className="text-xs font-bold text-gray-800 mt-0.5 block truncate">
                        🌿 {farm.crop}
                      </span>
                    </div>
                    <div className="bg-gray-50/80 rounded-xl p-2.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">
                        Land Area
                      </span>
                      <span className="text-xs font-bold text-gray-800 mt-0.5 block">
                        {farm.size_in_acres} Acres
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100 text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                  <span>View Dashboard</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}

      {/* Add Farm Modal */}
      {showAddModal && (
        <AddFarmModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (farmData) => {
            const res = await addFarm({
              name: farmData.name,
              location: farmData.location,
              region: "Ashanti Region",
              size_in_acres: farmData.size_in_acres ?? 0.0,
              primary_crop: farmData.crop,
              soil_type: "Loamy",
              irrigation_type: "Rain-fed",
              established_date: "2026",
              notes: "",
            });

            if (res.success && res.farmId) {
              setFarms((prev) => [
                {
                  id: res.farmId!,
                  name: farmData.name,
                  location: farmData.location,
                  size_in_acres: farmData.size_in_acres,
                  crop: farmData.crop,
                  status: "Active",
                },
                ...prev,
              ]);
              setShowAddModal(false);
            } else {
              alert("Failed to add farm: " + res.message);
            }
          }}
        />
      )}
    </main>
  );
}

const farmSchema = z.object({
  name: z.string().min(3, "Farm name must be at least 3 characters"),
  location: z.string().min(3, "Location is required"),
  size_in_acres: z.number().min(0.1, "Size must be greater than 0"),
  crop: z.string().optional(),
});

type FarmFormValues = z.infer<typeof farmSchema>;

function AddFarmModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (farm: {
    name: string;
    location: string;
    size_in_acres: number;
    crop: string;
  }) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: "",
      location: "",
      size_in_acres: undefined,
      crop: "",
    },
  });

  const onSubmit = async (data: FarmFormValues) => {
    setIsSubmitting(true);
    await onAdd({
      name: data.name,
      location: data.location,
      size_in_acres: data.size_in_acres,
      crop: data.crop || "Mixed Crops",
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Tractor className="h-5 w-5 text-emerald-600" /> Add New Farm
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Farm Name *
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Green Valley Farm"
              className={`mt-1.5 w-full px-4 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm ${errors.name ? 'border-red-400 ring-red-400' : 'border-gray-200'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Location / Region *
            </label>
            <input
              type="text"
              {...register("location")}
              placeholder="e.g. Ejisu, Ashanti Region"
              className={`mt-1.5 w-full px-4 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm ${errors.location ? 'border-red-400 ring-red-400' : 'border-gray-200'}`}
            />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Size (Acres) *
              </label>
              <input
                type="number"
                step="0.5"
                {...register("size_in_acres", { valueAsNumber: true })}
                placeholder="e.g. 15"
                className={`mt-1.5 w-full px-4 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm ${errors.size_in_acres ? 'border-red-400 ring-red-400' : 'border-gray-200'}`}
              />
              {errors.size_in_acres && <p className="text-xs text-red-500 mt-1">{errors.size_in_acres.message}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Primary Crop
              </label>
              <input
                type="text"
                {...register("crop")}
                placeholder="e.g. Maize"
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Farm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
