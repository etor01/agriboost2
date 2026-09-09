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
  FileText,
  Download,
  FileSpreadsheet,
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

// ── CSV generation helper ──────────────────────────────────────────────────────
function generateFarmCSV(farm: any, crops: any[], tasks: any[]) {
  const rows: string[][] = [];

  rows.push(["FARM REPORT"]);
  rows.push(["Generated", new Date().toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })]);
  rows.push([]);
  rows.push(["FARM DETAILS"]);
  rows.push(["Farm Name", farm.name ?? ""]);
  rows.push(["Location", farm.location ?? ""]);
  rows.push(["Region", farm.region ?? ""]);
  rows.push(["Size (Acres)", String(farm.size_in_acres ?? 0)]);
  rows.push(["Soil Type", farm.soil_type ?? "Loamy"]);
  rows.push(["Irrigation Type", farm.irrigation_type ?? "Rain-fed"]);
  rows.push(["Primary Crop", farm.primary_crop ?? "Mixed Crops"]);
  rows.push(["Total Crops Registered", String(crops.length)]);
  rows.push([]);

  rows.push(["CROP DETAILS"]);
  rows.push([
    "Crop Type", "Growth Stage", "Area (Acres)", "Planting Date", "Harvest Date",
    "AI Plan", "Watering Tasks", "Fertilizer Tasks", "Weeding Tasks", "Pest Control Tasks", "Total Tasks",
  ]);

  crops.forEach((crop) => {
    const cropTasks = tasks.filter((t) => t.crop_id === crop.id);
    const watering = cropTasks.filter((t) => t.task_type === "Irrigation").length;
    const fertilizer = cropTasks.filter((t) => t.task_type === "Fertilizer").length;
    const weeding = cropTasks.filter((t) => t.task_type === "Weeding").length;
    const pest = cropTasks.filter((t) => t.task_type === "Pest Control").length;

    let aiWatering = 0, aiFertilizer = 0, aiWeeding = 0, aiPest = 0;
    if (crop.ai_growth_data) {
      const plan = crop.ai_growth_data as any;
      (plan.weeks ?? []).forEach((w: any) => {
        (w.tasks ?? []).forEach((t: any) => {
          if (t.category === "watering") aiWatering++;
          if (t.category === "fertilizer") aiFertilizer++;
          if (t.category === "weeding") aiWeeding++;
          if (t.category === "pest_control") aiPest++;
        });
      });
    }

    rows.push([
      crop.crop_type ?? "", crop.current_growth_stage ?? "", String(crop.area ?? ""),
      crop.planting_date ?? "", crop.estimated_harvest_date ?? "",
      crop.ai_growth_data ? "Yes" : "No",
      String(watering + aiWatering), String(fertilizer + aiFertilizer),
      String(weeding + aiWeeding), String(pest + aiPest), String(cropTasks.length),
    ]);
  });

  rows.push([]);
  rows.push(["TASK DETAILS"]);
  rows.push(["Crop Type", "Task Description", "Type", "Due Date", "Priority", "Status"]);
  tasks.forEach((task) => {
    const crop = crops.find((c) => c.id === task.crop_id);
    rows.push([
      crop?.crop_type ?? "", task.description ?? "", task.task_type ?? "",
      task.due_date ?? "", task.priority ?? "", task.completed ? "Completed" : "Pending",
    ]);
  });

  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── PDF print helper ───────────────────────────────────────────────────────────
function printFarmReport(farm: any, crops: any[], tasks: any[]) {
  const date = new Date().toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" });

  const cropRows = crops.map((crop) => {
    const cropTasks = tasks.filter((t) => t.crop_id === crop.id);
    let aiTaskCount = 0;
    if (crop.ai_growth_data) {
      const plan = crop.ai_growth_data as any;
      (plan.weeks ?? []).forEach((w: any) => { aiTaskCount += (w.tasks ?? []).length; });
    }
    return `
    <tr>
      <td>${crop.crop_type ?? ""}</td>
      <td>${crop.current_growth_stage ?? "—"}</td>
      <td>${crop.area ?? "—"} ac</td>
      <td>${crop.planting_date ?? "—"}</td>
      <td>${crop.estimated_harvest_date ?? "—"}</td>
      <td>${crop.ai_growth_data ? "✓ Active" : "None"}</td>
      <td>${cropTasks.length + aiTaskCount}</td>
    </tr>`;
  }).join("");

  const taskRows = tasks.slice(0, 30).map((task) => {
    const crop = crops.find((c) => c.id === task.crop_id);
    return `
    <tr>
      <td>${crop?.crop_type ?? "—"}</td>
      <td>${task.description ?? ""}</td>
      <td>${task.task_type ?? ""}</td>
      <td>${task.due_date ?? "—"}</td>
      <td class="${task.priority === "high" ? "high" : ""}">${task.priority ?? "normal"}</td>
      <td>${task.completed ? "✓ Done" : "Pending"}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Farm Report — ${farm.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 32px; font-size: 13px; }
    .header { border-bottom: 3px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; font-weight: 800; color: #14532d; }
    .header p { color: #6b7280; margin-top: 4px; font-size: 12px; }
    .badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #86efac; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600; margin-left: 8px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .info-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; }
    .info-item label { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #9ca3af; display: block; margin-bottom: 2px; }
    .info-item span { font-size: 14px; font-weight: 700; color: #111827; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; color: #374151; }
    tr:nth-child(even) td { background: #f9fafb; }
    .high { color: #dc2626; font-weight: 600; }
    .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; color: #9ca3af; font-size: 10px; text-align: center; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${farm.name} <span class="badge">Farm Report</span></h1>
    <p>${farm.location ?? ""} · Generated on ${date} · AgriBoost Platform</p>
  </div>
  <div class="section">
    <div class="section-title">Farm Overview</div>
    <div class="info-grid">
      <div class="info-item"><label>Total Size</label><span>${farm.size_in_acres ?? 0} Acres</span></div>
      <div class="info-item"><label>Soil Type</label><span>${farm.soil_type ?? "Loamy"}</span></div>
      <div class="info-item"><label>Irrigation</label><span>${farm.irrigation_type ?? "Rain-fed"}</span></div>
      <div class="info-item"><label>Primary Crop</label><span>${farm.primary_crop ?? "Mixed Crops"}</span></div>
      <div class="info-item"><label>No. of Crops</label><span>${crops.length}</span></div>
      <div class="info-item"><label>Total Tasks</label><span>${tasks.length}</span></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Crop Records (${crops.length})</div>
    <table>
      <thead><tr><th>Crop</th><th>Stage</th><th>Area</th><th>Planted</th><th>Est. Harvest</th><th>AI Plan</th><th>Tasks</th></tr></thead>
      <tbody>${cropRows || "<tr><td colspan='7'>No crops registered</td></tr>"}</tbody>
    </table>
  </div>
  ${tasks.length > 0 ? `
  <div class="section">
    <div class="section-title">Field Tasks (showing up to 30)</div>
    <table>
      <thead><tr><th>Crop</th><th>Task</th><th>Type</th><th>Due Date</th><th>Priority</th><th>Status</th></tr></thead>
      <tbody>${taskRows}</tbody>
    </table>
  </div>` : ""}
  <div class="footer">AgriBoost Farm Report · ${farm.name} · ${date}</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
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
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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
      setShowAddCrop(false);
      toast({ title: "Crop Registered!", description: "Your crop has been added to the farm.", type: "success" });
      window.location.reload();
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

  const handleGenerateCSV = () => {
    const csv = generateFarmCSV(initialFarm, crops, tasks);
    const safeName = (initialFarm.name ?? "farm").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    downloadCSV(csv, `${safeName}_report_${new Date().toISOString().split("T")[0]}.csv`);
    toast({ title: "CSV Downloaded", description: "Farm report exported successfully.", type: "success" });
  };

  const handleGeneratePDF = () => {
    setIsGeneratingReport(true);
    try {
      printFarmReport(initialFarm, crops, tasks);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const cropsWithPlan = crops.filter((c) => c.ai_growth_data);

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

      {/* Activity Logs + Generate Farm Report */}
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

        {/* Generate Farm Report Card */}
        <FarmerCard>
          <FarmerCardHeader title="Generate Farm Report" icon={FileText} />
          <FarmerCardContent className="space-y-4">
            {/* Summary of what's included */}
            <div className="p-3.5 rounded-md bg-zinc-50 border border-zinc-200">
              <p className="text-xs font-semibold text-zinc-700 mb-2">Report includes:</p>
              <ul className="space-y-1.5">
                {[
                  `${crops.length} crop record${crops.length !== 1 ? "s" : ""}`,
                  `Soil type: ${initialFarm.soil_type || "Loamy"}`,
                  `Irrigation: ${initialFarm.irrigation_type || "Rain-fed"}`,
                  `${tasks.length} field task${tasks.length !== 1 ? "s" : ""} with priorities`,
                  "Per-crop activity breakdown",
                  "Fertilizer & pest control logs",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Plan status chip */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium ${
                cropsWithPlan.length > 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
              {cropsWithPlan.length > 0
                ? `${cropsWithPlan.length} crop${cropsWithPlan.length !== 1 ? "s" : ""} with active AI care plans`
                : "No AI plans yet — add crops to enrich the report"}
            </div>

            {/* Export buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                id="download-farm-csv-btn"
                onClick={handleGenerateCSV}
                disabled={crops.length === 0}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-zinc-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-200 transition-colors">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-zinc-800">Export CSV</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Spreadsheet format</p>
                </div>
              </button>

              <button
                id="download-farm-pdf-btn"
                onClick={handleGeneratePDF}
                disabled={isGeneratingReport}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-zinc-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group disabled:opacity-60"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors">
                  {isGeneratingReport ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-zinc-800">
                    {isGeneratingReport ? "Preparing…" : "Export PDF"}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Print-ready report</p>
                </div>
              </button>
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
