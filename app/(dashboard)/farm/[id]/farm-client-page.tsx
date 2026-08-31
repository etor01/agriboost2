// app/(dashboard)/farm/[id]/farm-client-page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  ClipboardList,
  RefreshCw,
  Edit2,
  Trash2,
} from "lucide-react";
import { addCrop, toggleTask, deleteCrop, regenerateCropPlan } from "./actions";
import CropGrowthPlanSection from "@/components/features/crop/CropGrowthPlan";
import { toast } from "@/components/ui/Toast";
import EditFarmModal from "./EditFarmModal";
import EditCropModal from "./EditCropModal";
import HarvestModal from "./HarvestModal";
import {
  FarmerStatCard,
  FarmerBadge,
  FarmerCard,
  FarmerCardHeader,
  FarmerCardContent,
  FarmerEmptyState,
} from "@/components/farmer/ui";

interface FarmDetailClientProps {
  user: any;
  initialFarm: any;
  initialCrops: any[];
  initialTasks: any[];
  initialActivities: any[];
  initialCompletions: any[];
}

export default function FarmDetailClient({
  user,
  initialFarm,
  initialCrops,
  initialTasks,
  initialActivities,
  initialCompletions,
}: FarmDetailClientProps) {
  const router = useRouter();
  const [crops, setCrops] = useState(initialCrops);
  const [tasks, setTasks] = useState(initialTasks);
  const [activities, setActivities] = useState(initialActivities);
  const [completions, setCompletions] = useState(initialCompletions);

  const [showAddCrop, setShowAddCrop] = useState(false);
  const [isAddingCrop, setIsAddingCrop] = useState(false);
  const [addCropStatus, setAddCropStatus] = useState<string | null>(null);
  const [showEditFarm, setShowEditFarm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<any | null>(null);
  const [harvestingCrop, setHarvestingCrop] = useState<any | null>(null);

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
      toast({ title: "Crop Registered!", description: "Your crop has been added to the farm.", type: "success" });
      router.refresh();
    } else {
      toast.error("Error adding crop: " + res.message);
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
      toast.error("Error deleting crop: " + res.message);
    }
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="space-y-1">
          <Link
            href="/farms"
            className="text-xs text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 font-medium transition-colors mb-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Farms
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              {initialFarm.name}
            </h1>
            <FarmerBadge variant="success">Active Property</FarmerBadge>
          </div>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {initialFarm.location}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => setShowEditFarm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 text-xs font-medium transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5 text-zinc-500" /> Edit Farm Details
          </button>
          <button
            onClick={() => setShowAddCrop(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Add Crop
          </button>
        </div>
      </div>

      {/* Farm Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FarmerStatCard
          title="Property Size"
          value={`${initialFarm.size_in_acres || 0} acres`}
          icon={Tractor}
          sub="Total registered area"
        />
        <FarmerStatCard
          title="Primary Crop"
          value={initialFarm.primary_crop || "Mixed Crops"}
          icon={Leaf}
          iconColor="text-lime-600"
          iconBg="bg-lime-50 border-lime-100"
          sub="Dominant cultivar"
        />
        <FarmerStatCard
          title="Soil Type"
          value={initialFarm.soil_type || "Loamy"}
          icon={ShieldCheck}
          iconColor="text-teal-600"
          iconBg="bg-teal-50 border-teal-100"
          sub="Soil classification"
        />
        <FarmerStatCard
          title="Irrigation"
          value={initialFarm.irrigation_type || "Rain-fed"}
          icon={Droplets}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
          sub="Water source"
        />
      </div>

      {/* Crops + Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Crop Records */}
        <FarmerCard>
          <FarmerCardHeader
            title={`Crop Records (${crops.length})`}
            icon={Sprout}
            action={
              <button
                onClick={() => setShowAddCrop(true)}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Register Crop
              </button>
            }
          />
          <FarmerCardContent>
            {crops.length === 0 ? (
              <FarmerEmptyState
                icon={Sprout}
                title="No crops recorded"
                description="Add a crop to generate an automated AI weekly care schedule."
                action={
                  <button
                    onClick={() => setShowAddCrop(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Crop
                  </button>
                }
              />
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {crops.map((crop) => (
                  <div
                    key={crop.id}
                    className="p-3 rounded-md border border-zinc-100 bg-white hover:bg-zinc-50/60 hover:border-zinc-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-zinc-900 truncate">
                            {crop.crop_type}
                          </p>
                          {crop.ai_growth_data ? (
                            <FarmerBadge variant="success">✓ AI Plan</FarmerBadge>
                          ) : (
                            <FarmerBadge variant="warn">No Plan</FarmerBadge>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Stage: <strong className="text-zinc-700">{crop.current_growth_stage || "Seedling"}</strong>{" "}
                          {crop.area ? `· ${crop.area} acres` : ""}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Planted: {crop.planting_date}{" "}
                          {crop.estimated_harvest_date ? `· Harvest: ${crop.estimated_harvest_date}` : ""}
                        </p>
                      </div>

                      {/* Edit / Harvest / Delete Buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {crop.current_growth_stage !== "Harvested" && (
                          <button
                            onClick={() => setHarvestingCrop(crop)}
                            className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 px-2 py-1 rounded-md transition-colors"
                          >
                            Harvest
                          </button>
                        )}
                        <button
                          onClick={() => setEditingCrop(crop)}
                          className="text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-md transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCropClick(crop.id, crop.crop_type)}
                          className="p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Crop"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FarmerCardContent>
        </FarmerCard>

        {/* Tasks Schedule */}
        <FarmerCard>
          <FarmerCardHeader
            title="Field Tasks"
            icon={ClipboardList}
            action={
              <span className="text-xs text-zinc-500 font-medium">
                {completedTasksCount}/{tasks.length} done
              </span>
            }
          />
          <FarmerCardContent>
            <div className="h-1.5 rounded-full bg-zinc-100 mb-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${tasks.length ? (completedTasksCount / tasks.length) * 100 : 0}%`,
                }}
              />
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 space-y-1">
                <CheckCircle2 className="h-6 w-6 text-zinc-300 mx-auto mb-1" />
                <p className="text-xs font-medium text-zinc-700">No pending tasks</p>
                <p className="text-[11px] text-zinc-400">
                  Tasks are automatically scheduled when crops are registered.
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
                    className={`flex items-start gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors ${
                      task.completed
                        ? "bg-zinc-50/50 border-zinc-100 opacity-60"
                        : "bg-white border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        task.completed
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      {task.completed && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium truncate ${
                          task.completed ? "line-through text-zinc-400" : "text-zinc-800"
                        }`}
                      >
                        {task.description}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Due: {task.due_date ? new Date(task.due_date).toLocaleDateString("en-GH", { day: "numeric", month: "short" }) : "TBD"}
                      </p>
                    </div>
                    <FarmerBadge variant={task.priority === "high" ? "danger" : "default"}>
                      {task.priority || "normal"}
                    </FarmerBadge>
                  </div>
                ))}
              </div>
            )}
          </FarmerCardContent>
        </FarmerCard>
      </div>

      {/* AI Growth Plan Section */}
      {crops.length > 0 && (
        <CropGrowthPlanSection
          crops={crops}
          farmId={initialFarm.id}
          onRegeneratePlan={regenerateCropPlan}
          completions={completions}
        />
      )}

      {/* Activity Logs + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Logs */}
        <FarmerCard>
          <FarmerCardHeader title="Farm Activity Logs" icon={Waves} />
          <FarmerCardContent>
            {activities.length === 0 ? (
              <FarmerEmptyState
                icon={Waves}
                title="No recent logs"
                description="Activity updates on this property will be shown here."
              />
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {activities.map((a, i) => (
                  <div
                    key={a.id || i}
                    className="flex items-start gap-2.5 p-2 rounded-md border border-zinc-100 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <Sprout className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-800 truncate">
                        {a.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {a.description}
                      </p>
                      <span className="text-[10px] text-zinc-400 mt-1 block">
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
          </FarmerCardContent>
        </FarmerCard>

        {/* AI Insight Panel */}
        <FarmerCard>
          <FarmerCardHeader title="AI Farm Insights" icon={Sparkles} />
          <FarmerCardContent className="space-y-3">
            <div className="p-3.5 rounded-md bg-emerald-50/60 border border-emerald-200/70">
              <p className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Crop Health Score
              </p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-emerald-800 tabular-nums">
                  85<span className="text-xs font-normal text-emerald-600">/100</span>
                </p>
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-emerald-200/70 overflow-hidden">
                    <div className="h-full w-[85%] rounded-full bg-emerald-600" />
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    {crops.filter((c) => c.ai_growth_data).length > 0
                      ? `AI care plan active for ${crops.filter((c) => c.ai_growth_data).length} crop(s)`
                      : "Add crops to get AI-powered insights"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-md bg-blue-50/60 border border-blue-200/70">
              <p className="text-xs font-semibold text-blue-800 mb-0.5 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" /> AI Recommendation
              </p>
              <p className="text-xs text-blue-900 leading-relaxed font-normal">
                {crops.filter((c) => c.ai_growth_data).length > 0
                  ? "AI growth plans are active. Check the timeline section below for this week's field tasks."
                  : "Add a crop to automatically generate a week-by-week agronomy schedule."}
              </p>
            </div>

            <Link
              href="/ai-center"
              className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:text-emerald-800 transition-colors pt-1"
            >
              Run AI Crop Disease Diagnosis <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </FarmerCardContent>
        </FarmerCard>
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

      {/* Edit Farm Modal */}
      {showEditFarm && (
        <EditFarmModal
          isOpen={showEditFarm}
          onClose={() => setShowEditFarm(false)}
          farm={initialFarm}
        />
      )}

      {/* Edit Crop Modal */}
      {editingCrop && (
        <EditCropModal
          isOpen={!!editingCrop}
          onClose={() => setEditingCrop(null)}
          farmId={initialFarm.id}
          crop={editingCrop}
        />
      )}

      {/* Harvest Crop Modal */}
      {harvestingCrop && (
        <HarvestModal
          isOpen={!!harvestingCrop}
          onClose={() => setHarvestingCrop(null)}
          farmId={initialFarm.id}
          crop={harvestingCrop}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-zinc-200 p-6 z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Sprout className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">Add Crop Record</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI generation status */}
        {statusMessage && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800">
            <RefreshCw className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
              Crop Type *
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              disabled={isSaving}
              className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
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
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Date Planted *
              </label>
              <input
                type="date"
                value={planted}
                onChange={(e) => setPlanted(e.target.value)}
                required
                disabled={isSaving}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Expected Harvest
              </label>
              <input
                type="date"
                value={harvest}
                onChange={(e) => setHarvest(e.target.value)}
                disabled={isSaving}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
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
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Growth Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                disabled={isSaving}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
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
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
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

