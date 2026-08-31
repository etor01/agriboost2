"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Sprout,
  Plus,
  CheckCircle2,
  Tractor,
  Layers,
  ArrowRight,
  X,
} from "lucide-react";
import { addFarm } from "../farm/new/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/Toast";
import {
  FarmerPageHeader,
  FarmerStatCard,
  FarmerBadge,
  FarmerCard,
  FarmerEmptyState,
} from "@/components/farmer/ui";

type FarmItem = {
  id: string;
  name: string;
  location: string;
  size_in_acres: number;
  crop: string;
  status: string;
};

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

  const totalFarms = farms.length;
  const totalAcres = farms.reduce((sum, f) => sum + (f.size_in_acres || 0), 0);
  const uniqueCrops = new Set(
    farms.map((f) => f.crop.trim()).filter(Boolean)
  ).size;
  const activeFarmsCount = farms.filter(
    (f) => f.status.toLowerCase() === "active"
  ).length;

  const filteredFarms = farms.filter((farm) => {
    const q = search.toLowerCase();
    return (
      farm.name.toLowerCase().includes(q) ||
      farm.location.toLowerCase().includes(q) ||
      farm.crop.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FarmerPageHeader
        badge="Agricultural Assets"
        badgeIcon={Tractor}
        title="My Farms"
        description="Manage your agricultural properties, track crop types, and monitor land acreage across your registered farms."
        action={
          <button
            id="add-farm-btn"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-md text-xs sm:text-sm transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add New Farm
          </button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FarmerStatCard
          title="Total Farms"
          value={totalFarms}
          icon={Tractor}
          sub="Registered plots"
        />
        <FarmerStatCard
          title="Total Area"
          value={`${totalAcres.toLocaleString()} ac`}
          icon={Layers}
          iconColor="text-teal-600"
          iconBg="bg-teal-50 border-teal-100"
          sub="Acres under management"
        />
        <FarmerStatCard
          title="Crop Cultivars"
          value={uniqueCrops}
          icon={Sprout}
          iconColor="text-lime-600"
          iconBg="bg-lime-50 border-lime-100"
          sub="Active crop varieties"
        />
        <FarmerStatCard
          title="Active Status"
          value={activeFarmsCount}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          sub="Properties in production"
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
            placeholder="Search farms by name, location, or crop…"
            className="w-full pl-9 pr-4 py-1.5 rounded-md border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors"
          />
        </div>
        <div className="text-xs text-zinc-500 font-medium self-center">
          Showing <strong className="text-zinc-900">{filteredFarms.length}</strong> of{" "}
          <strong className="text-zinc-900">{totalFarms}</strong> farms
        </div>
      </div>

      {/* Farms Grid / Empty State */}
      {filteredFarms.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm p-8 text-center">
          <FarmerEmptyState
            icon={Sprout}
            title={farms.length === 0 ? "No Farms Added Yet" : "No Matching Farms Found"}
            description={
              farms.length === 0
                ? "Add your agricultural land to track seasonal crops, log harvest records, and connect with prospective produce buyers."
                : "Try adjusting your search keywords to find the farm you are looking for."
            }
            action={
              farms.length === 0 ? (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-md text-xs sm:text-sm transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Add Your First Farm
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarms.map((farm) => (
            <Link key={farm.id} href={`/farm/${farm.id}`} className="group block">
              <FarmerCard className="p-5 hover:border-zinc-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <FarmerBadge
                      variant={farm.status.toLowerCase() === "active" ? "success" : "muted"}
                    >
                      {farm.status}
                    </FarmerBadge>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 group-hover:text-emerald-700 transition-colors truncate">
                      {farm.name}
                    </h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="h-3 w-3 text-zinc-400 flex-shrink-0" />
                      {farm.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
                    <div className="bg-zinc-50 rounded-md p-2.5">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Primary Crop
                      </span>
                      <span className="text-xs font-semibold text-zinc-800 mt-0.5 block truncate">
                        {farm.crop}
                      </span>
                    </div>
                    <div className="bg-zinc-50 rounded-md p-2.5">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Land Area
                      </span>
                      <span className="text-xs font-semibold text-zinc-800 mt-0.5 block">
                        {farm.size_in_acres} Acres
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-100 text-xs font-medium text-emerald-700 group-hover:text-emerald-800">
                  <span>Manage Farm &amp; Crops</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </FarmerCard>
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
              toast({ title: "Farm Added!", description: "Your farm has been registered successfully.", type: "success" });
            } else {
              alert("Failed to add farm: " + res.message);
            }
          }}
        />
      )}
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-zinc-200 p-6 z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Tractor className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">Add New Farm</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
              Farm Name *
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Green Valley Farm"
              className={`mt-1.5 w-full px-3 py-2 rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm ${errors.name ? 'border-red-400 ring-red-400' : 'border-zinc-200'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
              Location / Region *
            </label>
            <input
              type="text"
              {...register("location")}
              placeholder="e.g. Ejisu, Ashanti Region"
              className={`mt-1.5 w-full px-3 py-2 rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm ${errors.location ? 'border-red-400 ring-red-400' : 'border-zinc-200'}`}
            />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Size (Acres) *
              </label>
              <input
                type="number"
                step="0.5"
                {...register("size_in_acres", { valueAsNumber: true })}
                placeholder="e.g. 15"
                className={`mt-1.5 w-full px-3 py-2 rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm ${errors.size_in_acres ? 'border-red-400 ring-red-400' : 'border-zinc-200'}`}
              />
              {errors.size_in_acres && <p className="text-xs text-red-500 mt-1">{errors.size_in_acres.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Primary Crop
              </label>
              <input
                type="text"
                {...register("crop")}
                placeholder="e.g. Maize"
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Farm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

