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
  FileText,
  Download,
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

// ── Farms Overview PDF generator ──────────────────────────────────────────────
type FarmerProfile = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  region?: string | null;
  avatar_url?: string | null;
  member_since?: string | null;
};

function printFarmsReport(farms: any[], profile: FarmerProfile | null) {
  const date = new Date().toLocaleDateString("en-GH", {
    day: "numeric", month: "long", year: "numeric",
  });
  const time = new Date().toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });

  const totalAcres = farms.reduce((s, f) => s + (Number(f.size_in_acres) || 0), 0);
  const uniqueCrops = [...new Set(farms.map((f) => (f.primary_crop || f.crop || "").trim()).filter(Boolean))];

  // Absolute URL to logo — works in print context
  const logoUrl = `${window.location.origin}/icons/logo.png`;

  // Name/contact comes pre-resolved from page.tsx (same logic as profile page)
  const farmerName = profile?.full_name || "";
  const farmerEmail = profile?.email || "—";
  const farmerPhone = profile?.phone || "—";
  const farmerRegion = profile?.region || "Ghana";
  const memberSince = profile?.member_since
    ? new Date(profile.member_since).toLocaleDateString("en-GH", { month: "long", year: "numeric" })
    : "—";

  const farmRows = farms
    .map((f, i) => {
      const plantDate = f.planting_date
        ? new Date(f.planting_date).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })
        : "—";
      const harvestDate = f.estimated_harvest_date
        ? new Date(f.estimated_harvest_date).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })
        : "—";
      const estDate = f.established_date || "—";
      const statusClass = (f.status || "").toLowerCase() === "active" ? "status-active" : "status-other";
      return `
      <tr>
        <td class="idx">${i + 1}</td>
        <td><strong>${f.name ?? "—"}</strong></td>
        <td>${f.location ?? "—"}</td>
        <td>${f.region ?? "—"}</td>
        <td>${(f.size_in_acres ?? 0).toLocaleString()} ac</td>
        <td>${f.primary_crop || f.crop || "Mixed"}</td>
        <td>${f.soil_type || "—"}</td>
        <td>${f.irrigation_type || "—"}</td>
        <td>${estDate}</td>
        <td><span class="badge ${statusClass}">${f.status || "Active"}</span></td>
      </tr>`;
    })
    .join("");

  // Crop-level harvest summary rows
  const cropRows = farms
    .map((f) => {
      const crop = f.primary_crop || f.crop || "Mixed";
      const planted = f.planting_date
        ? new Date(f.planting_date).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })
        : "—";
      const harvest = f.estimated_harvest_date
        ? new Date(f.estimated_harvest_date).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })
        : "—";
      const status = (f.status || "").toLowerCase();
      const harvestStatus = status === "harvested" ? "Harvested" : status === "active" ? "Growing" : f.status || "—";
      return `
      <tr>
        <td>${f.name ?? "—"}</td>
        <td>${crop}</td>
        <td>${planted}</td>
        <td>${harvest}</td>
        <td>${(f.size_in_acres ?? 0)} ac</td>
        <td class="${status === 'harvested' ? 'status-harvest' : 'status-active'}">${harvestStatus}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Farm Report — AgriBoost</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #111827; background: #fff; font-size: 12px; line-height: 1.5; }
    /* ---- Page layout ---- */
    .page { padding: 36px 44px; max-width: 1040px; margin: 0 auto; }
    /* ---- Header ---- */
    .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #15803d; padding-bottom: 20px; margin-bottom: 28px; }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .logo { height: 44px; width: auto; }
    .brand-name { font-size: 20px; font-weight: 800; color: #14532d; letter-spacing: -0.3px; }
    .brand-tagline { font-size: 10px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
    .header-right { text-align: right; }
    .report-title { font-size: 15px; font-weight: 700; color: #111827; }
    .report-meta { font-size: 10px; color: #9ca3af; margin-top: 3px; }
    /* ---- Farmer card ---- */
    .farmer-card { display: grid; grid-template-columns: auto 1fr 1fr; gap: 0; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; margin-bottom: 28px; }
    .farmer-avatar-cell { background: #f0fdf4; border-right: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .farmer-avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 3px solid #86efac; }
    .farmer-avatar-placeholder { width: 64px; height: 64px; border-radius: 50%; background: #d1fae5; border: 3px solid #86efac; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #15803d; }
    .farmer-info-cell { padding: 16px 18px; border-right: 1px solid #e5e7eb; }
    .farmer-info-cell h2 { font-size: 15px; font-weight: 700; color: #111827; }
    .farmer-detail { font-size: 11px; color: #4b5563; margin-top: 4px; }
    .farmer-detail strong { color: #111827; }
    .farmer-stat-cell { padding: 16px 18px; }
    .farmer-stat-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 4px; }
    .farmer-stat-value { font-size: 22px; font-weight: 800; color: #111827; }
    .farmer-stat-sub { font-size: 10px; color: #6b7280; margin-top: 2px; }
    /* ---- Section ---- */
    .section { margin-bottom: 28px; }
    .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .section-icon { width: 20px; height: 20px; border-radius: 4px; background: #f0fdf4; border: 1px solid #bbf7d0; display: flex; align-items: center; justify-content: center; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #374151; }
    .section-count { font-size: 10px; font-weight: 600; color: #6b7280; margin-left: auto; }
    /* ---- Table ---- */
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    thead th { background: #f9fafb; border-top: 1px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 8px 10px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #6b7280; white-space: nowrap; }
    tbody td { padding: 9px 10px; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: top; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: #f9fafb; }
    td.idx { color: #9ca3af; font-weight: 600; text-align: center; width: 28px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .status-active { color: #15803d; background: #dcfce7; }
    .status-other { color: #6b7280; background: #f3f4f6; }
    .status-harvest { color: #92400e; background: #fef3c7; }
    /* ---- Crop portfolio pills ---- */
    .crop-pills { display: flex; flex-wrap: wrap; gap: 6px; }
    .crop-pill { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 600; }
    /* ---- Disease table ---- */
    .risk-high { color: #dc2626; }
    .risk-header { background: #fff7ed; }
    /* ---- Footer ---- */
    .footer { margin-top: 36px; border-top: 1px solid #e5e7eb; padding-top: 14px; display: flex; align-items: center; justify-content: space-between; }
    .footer-left { font-size: 10px; color: #9ca3af; }
    .footer-logo { height: 20px; opacity: 0.4; }
    @media print {
      .page { padding: 20px 28px; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      <img src="${logoUrl}" alt="AgriBoost" class="logo" onerror="this.style.display='none'" />
      <div>
        <div class="brand-name">AgriBoost</div>
        <div class="brand-tagline">Better farming, better Ghana</div>
      </div>
    </div>
    <div class="header-right">
      <div class="report-title">Farm Report</div>
      <div class="report-meta">Generated ${date} at ${time}</div>
    </div>
  </div>

  <!-- FARMER DETAILS -->
  <div class="farmer-card">
    <div class="farmer-avatar-cell">
      ${profile?.avatar_url
        ? `<img src="${profile.avatar_url}" alt="${farmerName}" class="farmer-avatar" />`
        : `<div class="farmer-avatar-placeholder">${farmerName ? farmerName.charAt(0).toUpperCase() : "F"}</div>`
      }
    </div>
    <div class="farmer-info-cell">
      <h2>${farmerName}</h2>
      <div class="farmer-detail"><strong>Email:</strong> ${farmerEmail}</div>
      <div class="farmer-detail"><strong>Phone:</strong> ${farmerPhone}</div>
      <div class="farmer-detail"><strong>Region:</strong> ${farmerRegion}</div>
      <div class="farmer-detail"><strong>Member since:</strong> ${memberSince}</div>
    </div>
    <div class="farmer-stat-cell">
      <div class="farmer-stat-label">Total Farms</div>
      <div class="farmer-stat-value">${farms.length}</div>
      <div class="farmer-stat-sub">Registered plots</div>
    </div>
    <div class="farmer-stat-cell">
      <div class="farmer-stat-label">Total Acreage</div>
      <div class="farmer-stat-value">${totalAcres.toLocaleString()}</div>
      <div class="farmer-stat-sub">Acres under management</div>
    </div>
  </div>

  <!-- CROP PORTFOLIO -->
  ${uniqueCrops.length > 0 ? `
  <div class="section">
    <div class="section-header">
      <div class="section-title">Crop Portfolio</div>
      <div class="section-count">${uniqueCrops.length} crop ${uniqueCrops.length === 1 ? "type" : "types"}</div>
    </div>
    <div class="crop-pills">
      ${uniqueCrops.map(c => `<span class="crop-pill">${c}</span>`).join("")}
    </div>
  </div>` : ""}

  <!-- FARM DIRECTORY -->
  <div class="section">
    <div class="section-header">
      <div class="section-title">Farm Directory</div>
      <div class="section-count">${farms.length} farm${farms.length !== 1 ? "s" : ""} total</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Farm Name</th>
          <th>Location</th>
          <th>Region</th>
          <th>Area</th>
          <th>Primary Crop</th>
          <th>Soil Type</th>
          <th>Irrigation</th>
          <th>Established</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${farmRows || "<tr><td colspan='10' style='text-align:center;color:#9ca3af;padding:16px'>No farms registered</td></tr>"}</tbody>
    </table>
  </div>

  <!-- HARVEST SCHEDULE -->
  <div class="section">
    <div class="section-header">
      <div class="section-title">Crop Harvest Schedule</div>
      <div class="section-count">Planting &amp; harvest dates per farm</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Farm Name</th>
          <th>Primary Crop</th>
          <th>Date Planted</th>
          <th>Est. Harvest Date</th>
          <th>Area</th>
          <th>Harvest Status</th>
        </tr>
      </thead>
      <tbody>${cropRows || "<tr><td colspan='6' style='text-align:center;color:#9ca3af;padding:16px'>No crop data available</td></tr>"}</tbody>
    </table>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">AgriBoost Farm Report &nbsp;&middot;&nbsp; ${farmerName} &nbsp;&middot;&nbsp; ${date}</div>
    <img src="${logoUrl}" alt="AgriBoost" class="footer-logo" onerror="this.style.display='none'" />
  </div>

</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

export default function FarmsClientPage({
  user,
  initialFarms,
  profile,
}: {
  user: any;
  initialFarms: any[];
  profile: FarmerProfile | null;
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
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateFarmsReport = () => {
    setIsGeneratingReport(true);
    try {
      // Pass raw initialFarms (full DB rows) to the report for richer data
      printFarmsReport(initialFarms, profile);
    } finally {
      setIsGeneratingReport(false);
    }
  };

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
        badge="Farms"
        badgeIcon={Tractor}
        title="My Farms"
        description="Manage your land, track crop growths, and monitor activities on your farms."
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
          title="Crops Planted"
          value={uniqueCrops}
          icon={Sprout}
          iconColor="text-lime-600"
          iconBg="bg-lime-50 border-lime-100"
          sub="Active crop varieties"
        />
        <FarmerStatCard
          title="Generate Report"
          value=""
          icon={isGeneratingReport ? Download : FileText}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          sub="Download a PDF report on all farms"
          accent
          onClick={handleGenerateFarmsReport}
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

