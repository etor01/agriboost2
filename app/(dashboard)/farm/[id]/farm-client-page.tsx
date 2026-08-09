// app/(dashboard)/farm/[id]/farm-client-page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Leaf,
  MapPin,
  Plus,
  Sprout,
  Tractor,
  Waves,
  X,
  Droplets,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { addCrop, toggleTask, deleteCrop, regenerateCropPlan } from "./actions";
import CropGrowthPlanSection from "@/components/features/crop/CropGrowthPlan";

// ── Glass Card ────────────────────────────────────────────────────
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

const HEALTH_COLORS: Record<string, string> = {
  Excellent: "bg-emerald-100 text-emerald-700",
  Good: "bg-blue-100 text-blue-700",
  Fair: "bg-amber-100 text-amber-700",
  Poor: "bg-red-100 text-red-600",
};

interface FarmDetailClientProps {
  user: any;
  initialFarm: any;
  initialCrops: any[];
  initialTasks: any[];
  initialActivities: any[];
}

export default function FarmDetailClient({
  user,
  initialFarm,
  initialCrops,
  initialTasks,
  initialActivities,
}: FarmDetailClientProps) {
  const [crops, setCrops] = useState(initialCrops);
  const [tasks, setTasks] = useState(initialTasks);
  const [activities, setActivities] = useState(initialActivities);

  const [showAddCrop, setShowAddCrop] = useState(false);
  const [isAddingCrop, setIsAddingCrop] = useState(false);
  const [addCropStatus, setAddCropStatus] = useState<string | null>(null);

  const farmRegion =
    initialFarm.region ?? initialFarm.location ?? "Ghana";

  const handleToggleTask = async (
    taskId: string,
    currentCompleted: boolean,
    desc: string
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !currentCompleted } : t
      )
    );

    const res = await toggleTask(
      initialFarm.id,
      taskId,
      !currentCompleted,
      desc
    );
    if (!res.success) {
      alert("Failed to toggle task: " + res.message);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: currentCompleted } : t
        )
      );
    } else {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          activity_type: "task_completed",
          title: "Task Completed",
          description: `Completed task: ${desc}`,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const handleAddCropSubmit = async (
    cropType: string,
    plantingDate: string,
    harvestDate: string | null,
    areaVal: number,
    stage: string
  ) => {
    setIsAddingCrop(true);
    setAddCropStatus("Generating AI care plan — this may take ~15 seconds…");

    const res = await addCrop(initialFarm.id, {
      crop_type: cropType,
      planting_date: plantingDate,
      estimated_harvest_date: harvestDate,
      area: areaVal,
      current_growth_stage: stage,
    });

    if (res.success && res.crop) {
      setAddCropStatus(null);
      setCrops((prev) => [...prev, res.crop]);
      setShowAddCrop(false);
      window.location.reload();
    } else {
      alert("Error adding crop: " + res.message);
      setAddCropStatus(null);
    }
    setIsAddingCrop(false);
  };

  const handleDeleteCropClick = async (cropId: string, cropType: string) => {
    if (
      !confirm(
        `Are you sure you want to remove the crop record for ${cropType}? All linked tasks will be deleted.`
      )
    )
      return;

    const res = await deleteCrop(initialFarm.id, cropId, cropType);
    if (res.success) {
      setCrops((prev) => prev.filter((c) => c.id !== cropId));
      setTasks((prev) => prev.filter((t) => t.crop_id !== cropId));
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          activity_type: "crop_deleted",
          title: "Crop Removed",
          description: `Removed crop ${cropType} from farm`,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } else {
      alert("Error deleting crop: " + res.message);
    }
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back + Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/farms"
            className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Farms
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {initialFarm.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {initialFarm.location}
          </p>
        </div>
        <span className="self-start px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
          ● Active
        </span>
      </div>

      {/* Farm Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Tractor,
            label: "Farm Size",
            value: `${initialFarm.size_in_acres || 0} acres`,
          },
          {
            icon: Leaf,
            label: "Primary Crop",
            value: initialFarm.primary_crop || "None",
          },
          {
            icon: ShieldCheck,
            label: "Soil Type",
            value: initialFarm.soil_type || "Unknown",
          },
          {
            icon: Droplets,
            label: "Irrigation",
            value: initialFarm.irrigation_type || "Rain-fed",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassCard
              key={stat.label}
              className="p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
                <Icon className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                {stat.value}
              </p>
            </GlassCard>
          );
        })}
      </div>

      {/* Crops + Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Crops */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-600" /> Crop Records (
              {crops.length})
            </h2>
            <button
              onClick={() => setShowAddCrop(true)}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Crop
            </button>
          </div>
          {crops.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Sprout className="h-8 w-8 mx-auto mb-2 text-emerald-500 animate-pulse" />
              <p className="text-sm font-semibold">No crops recorded</p>
              <p className="text-xs">
                Add a crop to generate an AI weekly care plan.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className="p-3 rounded-xl bg-white/80 border border-gray-100 hover:border-emerald-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        {crop.crop_type}
                        {crop.ai_growth_data ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                            ✓ AI Plan
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            No Plan
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        Stage:{" "}
                        <span className="text-emerald-600">
                          {crop.current_growth_stage || "Seedling"}
                        </span>{" "}
                        {crop.area ? `· ${crop.area} acres` : ""}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Planted: {crop.planting_date}{" "}
                        {crop.estimated_harvest_date
                          ? `· Harvest: ${crop.estimated_harvest_date}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        onClick={() =>
                          handleDeleteCropClick(crop.id, crop.crop_type)
                        }
                        className="text-xs text-red-400 hover:text-red-600 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Tasks */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-emerald-600" /> Tasks
            </h2>
            <span className="text-xs text-gray-500">
              {completedTasksCount}/{tasks.length} done
            </span>
          </div>

          <div className="h-1.5 rounded-full bg-gray-100 mb-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
              style={{
                width: `${tasks.length ? (completedTasksCount / tasks.length) * 100 : 0}%`,
              }}
            />
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No tasks scheduled</p>
              <p className="text-xs">
                Tasks are automatically generated when crops are added.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() =>
                    handleToggleTask(task.id, task.completed, task.description)
                  }
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    task.completed
                      ? "opacity-50 bg-gray-50"
                      : "bg-white/80 hover:bg-white"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      task.completed
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-300 hover:border-emerald-400"
                    }`}
                  >
                    {task.completed && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        task.completed
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {task.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Due:{" "}
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("en-GH", {
                            day: "numeric",
                            month: "short",
                          })
                        : "TBD"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-600"
                        : task.priority === "medium"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {task.priority || "medium"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── AI Growth Plan Section ── */}
      {crops.length > 0 && (
        <CropGrowthPlanSection
          crops={crops}
          farmId={initialFarm.id}
          onRegeneratePlan={regenerateCropPlan}
        />
      )}

      {/* Activity + AI Insight Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Logs */}
        <GlassCard className="p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Waves className="h-4 w-4 text-emerald-600" /> Farm Activity Logs
          </h2>
          {activities.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm font-semibold">No recent activity</p>
              <p className="text-xs">
                Your logs will be updated here as you make changes.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {activities.map((a, i) => (
                <div
                  key={a.id || i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/60 hover:bg-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Sprout className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {a.description}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(a.created_at).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* AI Insight Panel */}
        <GlassCard className="p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" /> AI Farm Insights
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-700 mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Crop Health Score
              </p>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-extrabold text-emerald-700">
                  85<span className="text-base font-medium">/100</span>
                </p>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                    <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-emerald-400 to-green-500" />
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    {crops.filter((c) => c.ai_growth_data).length > 0
                      ? `AI care plan active for ${crops.filter((c) => c.ai_growth_data).length} crop(s)`
                      : "Add crops to get AI-powered insights"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Recommendation
              </p>
              <p className="text-sm text-blue-800">
                {crops.filter((c) => c.ai_growth_data).length > 0
                  ? "AI growth plans are active. Check the timeline section below for this week's tasks."
                  : "Add a crop to automatically generate a week-by-week AI care plan."}
              </p>
            </div>
            <Link
              href="/ai-center"
              className="block text-center text-sm text-emerald-600 font-bold hover:text-emerald-700 underline underline-offset-2 pt-1"
            >
              Run AI Crop Diagnosis <ChevronRight className="h-4 w-4 inline" />
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* Add Crop Modal */}
      {showAddCrop && (
        <AddCropModal
          onClose={() => {
            if (!isAddingCrop) setShowAddCrop(false);
          }}
          onAdd={handleAddCropSubmit}
          isSaving={isAddingCrop}
          statusMessage={addCropStatus}
        />
      )}
    </div>
  );
}

// ── Add Crop Modal ─────────────────────────────────────────────────
interface AddCropModalProps {
  onClose: () => void;
  onAdd: (
    cropType: string,
    plantingDate: string,
    harvestDate: string | null,
    area: number,
    stage: string
  ) => void;
  isSaving: boolean;
  statusMessage: string | null;
}

function AddCropModal({
  onClose,
  onAdd,
  isSaving,
  statusMessage,
}: AddCropModalProps) {
  const [cropType, setCropType] = useState("Maize");
  const [planted, setPlanted] = useState("");
  const [harvest, setHarvest] = useState("");
  const [area, setArea] = useState("");
  const [stage, setStage] = useState("Seedling");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropType || !planted || !area) return;
    onAdd(cropType, planted, harvest || null, parseFloat(area), stage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isSaving ? undefined : onClose}
      />
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-600" /> Add Crop Record
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI generation status */}
        {statusMessage && (
          <div className="mb-4 flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
            <RefreshCw className="h-4 w-4 flex-shrink-0 animate-spin" />
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Crop Type *
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              disabled={isSaving}
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
            >
              {[
                "Maize",
                "Cassava",
                "Yam",
                "Cocoyam",
                "Tomatoes",
                "Pepper",
                "Groundnuts",
                "Soybeans",
                "Rice",
                "Plantain",
                "Vegetables (Mixed)",
                "Other",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Date Planted *
              </label>
              <input
                type="date"
                value={planted}
                onChange={(e) => setPlanted(e.target.value)}
                required
                disabled={isSaving}
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Expected Harvest
              </label>
              <input
                type="date"
                value={harvest}
                onChange={(e) => setHarvest(e.target.value)}
                disabled={isSaving}
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Area (Acres) *
              </label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                disabled={isSaving}
                min="0.1"
                step="0.1"
                placeholder="e.g. 2"
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Growth Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                disabled={isSaving}
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              >
                {[
                  "Seedling",
                  "Vegetative",
                  "Flowering",
                  "Fruiting",
                  "Harvest Ready",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating Plan…
                </>
              ) : (
                "Add Crop + AI Plan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
