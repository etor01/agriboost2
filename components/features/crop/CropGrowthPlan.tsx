"use client";

import React, { useState } from "react";
import type { CropGrowthPlan as CropGrowthPlanType, GrowthWeek, WeeklyTask } from "@/lib/database.types";
import {
  ChevronDown,
  ChevronUp,
  Droplets,
  Sprout,
  Leaf,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Wheat,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Tractor,
  Info,
  Clock,
} from "lucide-react";
import { toggleAiTask } from "@/app/(dashboard)/farm/[id]/actions";
import { toast } from "@/components/ui/Toast";

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORY_META: Record<
  WeeklyTask["category"],
  { label: string; icon: React.ElementType; cls: string }
> = {
  watering: { label: "Watering", icon: Droplets, cls: "bg-blue-100 text-blue-700 border-blue-200" },
  fertilizer: { label: "Fertilizer", icon: Sprout, cls: "bg-green-100 text-green-700 border-green-200" },
  weeding: { label: "Weeding", icon: Leaf, cls: "bg-lime-100 text-lime-700 border-lime-200" },
  pest_control: { label: "Pest Control", icon: ShieldCheck, cls: "bg-orange-100 text-orange-700 border-orange-200" },
  disease_prevention: { label: "Disease Prevention", icon: AlertTriangle, cls: "bg-red-100 text-red-700 border-red-200" },
  observation: { label: "Observe", icon: Eye, cls: "bg-purple-100 text-purple-700 border-purple-200" },
  harvest: { label: "Harvest", icon: Wheat, cls: "bg-amber-100 text-amber-700 border-amber-200" },
};

// ── Stage colors for the timeline bar ─────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
  Seedling: "bg-emerald-400",
  Germination: "bg-emerald-400",
  Vegetative: "bg-green-500",
  Flowering: "bg-purple-400",
  Fruiting: "bg-orange-400",
  "Grain Filling": "bg-amber-400",
  "Harvest Ready": "bg-amber-500",
  Maturation: "bg-yellow-500",
};
const fallbackStageColor = "bg-teal-400";
const getStageColor = (stage: string) =>
  STAGE_COLORS[stage] ?? fallbackStageColor;

// ── Helper: compute current week number from planting date ────────────────────
function computeCurrentWeek(plantingDate: string, totalWeeks: number): number {
  const planted = new Date(plantingDate).getTime();
  const daysElapsed = Math.max(0, Math.floor((Date.now() - planted) / 86_400_000));
  return Math.min(Math.floor(daysElapsed / 7) + 1, totalWeeks);
}

// ── TaskReminderTag ────────────────────────────────────────────────────────────
function TaskReminderTag({
  task,
  uid,
  farmId,
  cropId,
  weekNumber,
  taskIndex,
  isCompleted,
}: {
  task: WeeklyTask;
  uid: string;
  farmId: string;
  cropId: string;
  weekNumber: number;
  taskIndex: number;
  isCompleted: boolean;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const meta = CATEGORY_META[task.category] ?? CATEGORY_META.observation;
  const Icon = meta.icon;

  const priorityDot =
    task.priority === "high"
      ? "bg-red-400"
      : task.priority === "medium"
        ? "bg-amber-400"
        : "bg-gray-300";

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const res = await toggleAiTask(
      farmId,
      cropId,
      weekNumber,
      taskIndex,
      uid,
      !isCompleted,
      task.task
    );
    if (!res.success) {
      toast.error(res.message || "Failed to update task");
    } else {
      toast.success(
        !isCompleted ? "Task marked complete" : "Task marked pending"
      );
    }
    setLoading(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all duration-200
          ${isCompleted
            ? "opacity-40 line-through bg-gray-100 text-gray-400 border-gray-200"
            : `${meta.cls} hover:scale-105 hover:shadow-sm cursor-pointer active:scale-95`
          }`}
        title={isCompleted ? "Completed" : "Click to mark as complete"}
      >
        {loading ? (
          <Clock className="h-3 w-3 flex-shrink-0 animate-spin" />
        ) : isCompleted ? (
          <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-emerald-500" />
        ) : (
          <Icon className="h-3 w-3 flex-shrink-0" />
        )}
        <span className="truncate max-w-[140px]">{task.task}</span>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot}`} />
        {task.notes && !isCompleted && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setShowNotes(!showNotes);
            }}
            className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
            title="View Ghana-specific notes"
          >
            <Info className="h-3 w-3 opacity-60 hover:opacity-100" />
          </span>
        )}
      </button>

      {/* Notes popup */}
      {showNotes && task.notes && (
        <div className="absolute z-20 top-full left-0 mt-1 w-56 p-2.5 bg-white border border-gray-200 rounded-xl shadow-lg text-[11px] text-gray-700 leading-relaxed">
          <p className="font-semibold text-gray-500 mb-1 uppercase text-[9px] tracking-wide">📍 Ghana Tip</p>
          {task.notes}
          <button
            onClick={() => setShowNotes(false)}
            className="mt-1.5 block text-[10px] text-gray-400 hover:text-gray-600"
          >
            close
          </button>
        </div>
      )}
    </div>
  );
}

function WeekRow({
  week,
  isCurrent,
  isPast,
  isOpen,
  onToggle,
  completionsSet,
  farmId,
  cropId,
}: {
  week: GrowthWeek;
  isCurrent: boolean;
  isPast: boolean;
  isOpen: boolean;
  onToggle: () => void;
  completionsSet: Set<string>;
  farmId: string;
  cropId: string;
}) {
  const stageColor = getStageColor(week.growth_stage);

  const rowBase = isCurrent
    ? "bg-green-50 border-green-300 shadow-sm"
    : isPast
      ? "bg-gray-50/60 border-gray-100 opacity-70"
      : "bg-white/70 border-gray-100";

  return (
    <div className={`border rounded-xl transition-all ${rowBase}`}>
      {/* Row header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        {/* Week badge */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold
            ${isCurrent ? "bg-green-500 text-white" : isPast ? "bg-gray-200 text-gray-500" : "bg-gray-100 text-gray-400"}`}
        >
          {isPast ? <CheckCircle2 className="h-4 w-4" /> : `W${week.week_number}`}
        </div>

        {/* Stage pill + dates */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isCurrent && (
              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                ← This Week
              </span>
            )}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${stageColor}`}
            >
              {week.growth_stage}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {new Date(week.week_start_date).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
            {" – "}
            {new Date(week.week_end_date).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
          </p>
        </div>

        {/* Task count + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-400 font-medium">
            {week.tasks.length} task{week.tasks.length !== 1 ? "s" : ""}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-3 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* Biology */}
          <p className="text-xs text-gray-600 italic leading-relaxed">
            🌿 {week.stage_description}
          </p>

          {/* Expected appearance */}
          <div className="text-xs text-gray-500 bg-white/80 rounded-lg p-2 border border-gray-100">
            <span className="font-semibold text-gray-600">What to expect: </span>
            {week.expected_appearance}
          </div>

          {/* Watering frequency */}
          <div className="flex items-center gap-1.5 text-xs text-blue-600">
            <Droplets className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-medium">{week.watering_frequency}</span>
          </div>

          {/* Task reminder tags */}
          {week.tasks.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                This week's tasks — click to mark as complete
              </p>
              <div className="flex flex-wrap gap-1.5">
                {week.tasks.map((task, i) => {
                  const uid = `${week.week_number}_task_${i}`;
                  return (
                    <TaskReminderTag
                      key={uid}
                      task={task}
                      uid={uid}
                      farmId={farmId}
                      cropId={cropId}
                      weekNumber={week.week_number}
                      taskIndex={i}
                      isCompleted={completionsSet.has(uid)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Risks */}
          {week.risks.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Watch out for
              </p>
              {week.risks.map((risk, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5 text-amber-500" />
                  {risk}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── TimelineBar ────────────────────────────────────────────────────────────────
function TimelineBar({
  plan,
  currentWeek,
}: {
  plan: CropGrowthPlanType;
  currentWeek: number;
}) {
  const progress = Math.min((currentWeek / plan.total_weeks) * 100, 100);

  return (
    <div className="space-y-2">
      {/* Stage legend */}
      <div className="flex gap-1 flex-wrap">
        {plan.growth_stages.map((s) => (
          <div key={s.stage} className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className={`w-2 h-2 rounded-full ${getStageColor(s.stage)}`} />
            {s.stage}
          </div>
        ))}
      </div>

      {/* Bar */}
      <div className="relative h-4 rounded-full overflow-hidden bg-gray-100 flex">
        {plan.growth_stages.map((s) => {
          const widthPct =
            ((s.end_week - s.start_week + 1) / plan.total_weeks) * 100;
          return (
            <div
              key={s.stage}
              className={`${getStageColor(s.stage)} opacity-80 h-full`}
              style={{ width: `${widthPct}%` }}
              title={s.stage}
            />
          );
        })}

        {/* Today cursor */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white shadow-md"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[10px] text-gray-400 font-medium">
        <span className="flex items-center gap-1">
          <Sprout className="h-3 w-3 text-emerald-500" />
          {new Date(plan.planting_date).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
        </span>
        <span className="text-green-600 font-bold">
          Week {currentWeek} of {plan.total_weeks} · {Math.round(progress)}% complete
        </span>
        <span className="flex items-center gap-1">
          <Wheat className="h-3 w-3 text-amber-500" />
          {new Date(plan.expected_harvest_date).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
interface CropGrowthPlanProps {
  crops: Array<{
    id: string;
    crop_type: string;
    planting_date: string | null;
    ai_growth_data: unknown;
  }>;
  farmId: string;
  onRegeneratePlan: (
    cropId: string,
    farmId: string
  ) => Promise<{ success: boolean; message?: string }>;
  completions: any[];
}

export default function CropGrowthPlanSection({
  crops,
  farmId,
  onRegeneratePlan,
  completions = [],
}: CropGrowthPlanProps) {
  const cropsWithPlan = crops.filter(
    (c) => c.ai_growth_data && c.planting_date
  );
  const cropsWithoutPlan = crops.filter((c) => !c.ai_growth_data);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set());
  const [regeneratingFor, setRegeneratingFor] = useState<string | null>(null);
  const [regenError, setRegenError] = useState<string | null>(null);

  const activeCropId = cropsWithPlan[selectedIdx]?.id;
  const activeCompletions = completions.filter(c => c.crop_id === activeCropId && c.completed);
  const activeCompletionsSet = new Set(activeCompletions.map(c => c.task_key));

  const handleRegenerateClick = async (cropId: string) => {
    setRegeneratingFor(cropId);
    setRegenError(null);
    const result = await onRegeneratePlan(cropId, farmId);
    setRegeneratingFor(null);
    if (result.success) {
      window.location.reload();
    } else {
      setRegenError(result.message ?? "Failed. Please try again.");
    }
  };

  const toggleWeek = (weekNum: number) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNum)) next.delete(weekNum);
      else next.add(weekNum);
      return next;
    });
  };

  // Reset open weeks when crop selection changes
  const handleSelectCrop = (idx: number) => {
    setSelectedIdx(idx);
    const plan = cropsWithPlan[idx]?.ai_growth_data as CropGrowthPlanType;
    if (plan && cropsWithPlan[idx]?.planting_date) {
      const cw = computeCurrentWeek(cropsWithPlan[idx].planting_date!, plan.total_weeks);
      setOpenWeeks(new Set([cw]));
    }
  };

  // Initialise open week for first crop
  React.useEffect(() => {
    if (cropsWithPlan.length > 0) {
      const first = cropsWithPlan[0];
      const plan = first.ai_growth_data as CropGrowthPlanType;
      if (first.planting_date && plan) {
        const cw = computeCurrentWeek(first.planting_date, plan.total_weeks);
        setOpenWeeks(new Set([cw]));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (crops.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-bold text-gray-800">AI Crop Growth Timeline</h2>
        <span className="text-xs text-gray-400 font-medium ml-auto">
          AI-generated care plan · read-only
        </span>
      </div>

      {/* Crops without plan — show reload buttons */}
      {cropsWithoutPlan.length > 0 && (
        <div className="space-y-2">
          {cropsWithoutPlan.map((crop) => (
            <div
              key={crop.id}
              className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200"
            >
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {crop.crop_type} — No AI plan yet
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  The AI plan may have failed during crop creation.
                </p>
                {regenError && regeneratingFor === crop.id && (
                  <p className="text-xs text-red-500 mt-1">{regenError}</p>
                )}
              </div>
              <button
                onClick={() => handleRegenerateClick(crop.id)}
                disabled={regeneratingFor === crop.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${regeneratingFor === crop.id ? "animate-spin" : ""}`}
                />
                {regeneratingFor === crop.id ? "Generating..." : "Reload Care Plan"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Crops WITH plan */}
      {cropsWithPlan.length > 0 && (() => {
        const selectedCrop = cropsWithPlan[Math.min(selectedIdx, cropsWithPlan.length - 1)];
        const plan = selectedCrop.ai_growth_data as CropGrowthPlanType;
        const currentWeek = computeCurrentWeek(selectedCrop.planting_date!, plan.total_weeks);

        return (
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-5 space-y-5">
            {/* Crop selector tabs (if multiple crops with plans) */}
            {cropsWithPlan.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {cropsWithPlan.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCrop(i)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${i === selectedIdx
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {c.crop_type}
                  </button>
                ))}
              </div>
            )}

            {/* Plan meta */}
            <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
              {plan.variety_suggestion && (
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-medium">
                  🌱 {plan.variety_suggestion}
                </span>
              )}
              <span className="bg-zinc-50 border border-zinc-200 text-zinc-700 px-2.5 py-1 rounded-md font-medium">
                📍 {plan.region}
              </span>
              <span className="bg-zinc-50 border border-zinc-200 text-zinc-700 px-2.5 py-1 rounded-md font-medium">
                ⏱ {plan.total_growing_days} days total
              </span>
              <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-md font-medium">
                🌾 Yield: {plan.estimated_yield_per_acre}
              </span>
            </div>

            {/* Timeline bar */}
            <TimelineBar plan={plan} currentWeek={currentWeek} />

            {/* This-week highlight card */}
            {(() => {
              const thisWeek = plan.weeks?.find((w) => w.week_number === currentWeek);
              if (!thisWeek) return null;
              return (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-800">
                        Current Week — Week {currentWeek}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${getStageColor(thisWeek.growth_stage)}`}
                      >
                        {thisWeek.growth_stage}
                      </span>
                    </div>
                    <Tractor className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-zinc-600 italic">{thisWeek.stage_description}</p>
                  {thisWeek.tasks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {thisWeek.tasks.map((task, i) => {
                        const uid = `${thisWeek.week_number}_task_${i}`;
                        return (
                          <TaskReminderTag
                            key={uid}
                            task={task}
                            uid={uid}
                            farmId={farmId}
                            cropId={selectedCrop.id}
                            weekNumber={thisWeek.week_number}
                            taskIndex={i}
                            isCompleted={activeCompletionsSet.has(uid)}
                          />
                        );
                      })}
                    </div>
                  )}
                  {thisWeek.risks.length > 0 && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 rounded-md p-2 border border-amber-200/70">
                      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                      <span>{thisWeek.risks[0]}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Weekly accordion */}
            <div>
              <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Full Weekly Schedule
              </p>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {(plan.weeks ?? []).map((week) => {
                  const isPast = week.week_number < currentWeek;
                  const isCurrent = week.week_number === currentWeek;
                  return (
                    <WeekRow
                      key={week.week_number}
                      week={week}
                      isCurrent={isCurrent}
                      isPast={isPast}
                      isOpen={openWeeks.has(week.week_number)}
                      onToggle={() => toggleWeek(week.week_number)}
                      completionsSet={activeCompletionsSet}
                      farmId={farmId}
                      cropId={selectedCrop.id}
                    />
                  );
                })}
              </div>
            </div>

            {/* Harvest indicators */}
            {plan.harvest_indicators?.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-1.5">
                <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                  <Wheat className="h-3.5 w-3.5 text-amber-600" /> Harvest Indicators
                </p>
                {plan.harvest_indicators.map((hint, i) => (
                  <p key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 flex-shrink-0 mt-0.5 text-amber-600" />
                    {hint}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

