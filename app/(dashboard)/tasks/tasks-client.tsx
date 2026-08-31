"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Leaf,
  Tractor,
  Sparkles,
  Check,
} from "lucide-react";
import { toggleTask, toggleAiTask } from "@/app/(dashboard)/farm/[id]/actions";
import { toast } from "@/components/ui/Toast";
import {
  FarmerBadge,
  FarmerCard,
  FarmerCardHeader,
  FarmerCardContent,
  FarmerEmptyState,
} from "@/components/farmer/ui";

type FilterTab = "all" | "pending" | "completed" | "high_priority";

export default function TasksClientPage({ tasks, crops, farms, completions = [] }: any) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [toggling, setToggling] = useState<string | null>(null);

  // Combine regular tasks and AI tasks
  const combinedTasks: any[] = [...tasks];

  // Map completions
  const completionMap = new Map();
  completions.forEach((c: any) => {
    completionMap.set(c.task_key, c.completed);
  });

  crops.forEach((crop: any) => {
    if (crop.ai_growth_data && crop.planting_date) {
      const plan = crop.ai_growth_data;
      const planted = new Date(crop.planting_date).getTime();
      const daysElapsed = Math.max(0, Math.floor((Date.now() - planted) / 86_400_000));
      const currentWeek = Math.min(Math.floor(daysElapsed / 7) + 1, plan.total_weeks);

      plan.weeks?.forEach((week: any) => {
        if (week.week_number <= currentWeek) {
          week.tasks?.forEach((task: any, i: number) => {
            const uid = `${week.week_number}_task_${i}`;
            const isCompleted = completionMap.get(uid) || false;
            
            combinedTasks.push({
              id: uid,
              is_ai: true,
              ai_week: week.week_number,
              ai_index: i,
              crop_id: crop.id,
              crops: { farm_id: crop.farm_id, crop_type: crop.crop_type },
              description: task.task,
              due_date: week.week_end_date,
              completed: isCompleted,
              priority: task.priority,
            });
          });
        }
      });
    }
  });

  const groupedTasks = new Map<string, Map<string, any[]>>();

  farms.forEach((f: any) => {
    groupedTasks.set(f.id, new Map());
  });

  const filteredTasks = combinedTasks.filter((t: any) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    if (filter === "high_priority") return !t.completed && t.priority === "high";
    return true;
  });

  filteredTasks.forEach((t: any) => {
    const cropId = t.crop_id;
    if (!cropId) return;
    const farmId = t.crops?.farm_id;
    if (!farmId) return;

    if (!groupedTasks.has(farmId)) {
      groupedTasks.set(farmId, new Map());
    }
    const farmMap = groupedTasks.get(farmId)!;
    if (!farmMap.has(cropId)) {
      farmMap.set(cropId, []);
    }
    farmMap.get(cropId)!.push(t);
  });

  const handleToggle = async (task: any) => {
    setToggling(task.id);
    let res;
    if (task.is_ai) {
      res = await toggleAiTask(
        task.crops?.farm_id,
        task.crop_id,
        task.ai_week,
        task.ai_index,
        task.id,
        !task.completed,
        task.description
      );
    } else {
      res = await toggleTask(
        task.crops?.farm_id,
        task.id,
        !task.completed,
        task.description
      );
    }

    if (!res.success) {
      toast.error(res.message || "Failed to update task");
    } else if (!task.completed) {
      toast({
        title: "Task completed! ✅",
        description: "Keep up the good work.",
        type: "success",
      });
    }
    setToggling(null);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <FarmerBadge variant="danger">High Priority</FarmerBadge>;
      case "medium":
        return <FarmerBadge variant="warn">Medium</FarmerBadge>;
      default:
        return <FarmerBadge variant="default">Normal</FarmerBadge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-zinc-100/80 rounded-lg border border-zinc-200 w-fit">
        {(["all", "pending", "completed", "high_priority"] as FilterTab[]).map(
          (tab) => {
            const isActive = filter === tab;
            const label = tab === "high_priority" ? "High Priority" : tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  isActive
                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/80"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {label}
              </button>
            );
          }
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm p-8 text-center">
          <FarmerEmptyState
            icon={CheckCircle2}
            title="No tasks found"
            description={
              filter === "all"
                ? "You don't have any tasks right now. AI-generated tasks will appear here when you add a crop."
                : "Try changing your filters to see more tasks."
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {farms.map((farm: any) => {
            const farmMap = groupedTasks.get(farm.id);
            if (!farmMap || farmMap.size === 0) return null;

            return (
              <FarmerCard key={farm.id}>
                <FarmerCardHeader
                  title={farm.name}
                  icon={Tractor}
                />
                <FarmerCardContent className="space-y-4">
                  {crops
                    .filter((c: any) => farmMap.has(c.id))
                    .map((crop: any) => {
                      const cropTasks = farmMap.get(crop.id) || [];
                      return (
                        <div
                          key={crop.id}
                          className="rounded-lg border border-zinc-200 overflow-hidden bg-white"
                        >
                          <div className="bg-zinc-50/75 px-3.5 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-xs font-semibold text-zinc-900">
                                {crop.crop_type}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-500 font-medium">
                              {cropTasks.filter((t: any) => t.completed).length}/{cropTasks.length} done
                            </span>
                          </div>

                          <div className="divide-y divide-zinc-100">
                            {cropTasks.map((task: any) => (
                              <div
                                key={task.id}
                                className={`p-3 flex items-start gap-3 transition-colors ${
                                  task.completed ? "bg-zinc-50/40" : "hover:bg-zinc-50/60"
                                }`}
                              >
                                <button
                                  onClick={() => handleToggle(task)}
                                  disabled={toggling === task.id}
                                  className="mt-0.5 flex-shrink-0"
                                >
                                  {toggling === task.id ? (
                                    <Clock className="h-4 w-4 text-zinc-400 animate-spin" />
                                  ) : task.completed ? (
                                    <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center">
                                      <Check className="h-3 w-3" />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded border border-zinc-300 hover:border-zinc-500 transition-colors" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-xs font-medium flex items-center gap-1.5 ${
                                      task.completed
                                        ? "text-zinc-400 line-through"
                                        : "text-zinc-900"
                                    }`}
                                  >
                                    <span>{task.description}</span>
                                    {task.is_ai && (
                                      <Sparkles
                                        className="h-3 w-3 text-emerald-600 flex-shrink-0"
                                        title="AI Generated Task"
                                      />
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                                    {task.due_date && (
                                      <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-zinc-400" />
                                        Due: {new Date(task.due_date).toLocaleDateString("en-GH", {
                                          day: "numeric",
                                          month: "short",
                                        })}
                                      </span>
                                    )}
                                    {getPriorityBadge(task.priority)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </FarmerCardContent>
              </FarmerCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

