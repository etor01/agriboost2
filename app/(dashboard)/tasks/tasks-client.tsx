"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Calendar,
  AlertTriangle,
  Leaf,
  Tractor,
} from "lucide-react";
import { toggleTask } from "@/app/(dashboard)/farm/[id]/actions";
import { toast } from "@/components/ui/Toast";

type FilterTab = "all" | "pending" | "completed" | "high_priority";

export default function TasksClientPage({ tasks, crops, farms }: any) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [toggling, setToggling] = useState<string | null>(null);
  
  // We will merge AI growth plan tasks here later in LF-2.
  // For now, we only render the regular `tasks` array.
  
  // Grouping structure: Map<farmId, Map<cropId, tasks>>
  const groupedTasks = new Map<string, Map<string, any[]>>();

  farms.forEach((f: any) => {
    groupedTasks.set(f.id, new Map());
  });

  const filteredTasks = tasks.filter((t: any) => {
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
    const res = await toggleTask(
      task.crops?.farm_id,
      task.id,
      !task.completed,
      task.description
    );
    if (!res.success) {
      toast.error(res.message || "Failed to update task");
    } else {
      toast.success(
        !task.completed ? "Task marked complete" : "Task marked pending"
      );
    }
    setToggling(null);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">High</span>;
      case "medium":
        return <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Med</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-white/80 backdrop-blur border border-gray-200 p-1 rounded-xl inline-flex shadow-sm">
          {(["all", "pending", "completed", "high_priority"] as FilterTab[]).map(
            (tab) => {
              const isActive = filter === tab;
              const label = tab === "high_priority" ? "High Priority" : tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                    isActive
                      ? "bg-emerald-600 text-white shadow"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {label}
                </button>
              );
            }
          )}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No tasks found</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            {filter === "all"
              ? "You don't have any tasks right now. AI-generated tasks will appear here when you add a crop."
              : "Try changing your filters to see more tasks."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {farms.map((farm: any) => {
            const farmMap = groupedTasks.get(farm.id);
            if (!farmMap || farmMap.size === 0) return null;

            return (
              <div key={farm.id} className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Tractor className="h-5 w-5 text-emerald-600" />
                  {farm.name}
                </h2>

                <div className="space-y-4 pl-2 border-l-2 border-emerald-100 ml-2">
                  {crops
                    .filter((c: any) => farmMap.has(c.id))
                    .map((crop: any) => {
                      const cropTasks = farmMap.get(crop.id) || [];
                      return (
                        <div key={crop.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-emerald-500" />
                            <h3 className="text-sm font-bold text-gray-800">
                              {crop.crop_type}
                            </h3>
                            <span className="text-xs text-gray-400">
                              {cropTasks.length} task{cropTasks.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          <div className="divide-y divide-gray-50">
                            {cropTasks.map((task: any) => (
                              <div
                                key={task.id}
                                className={`p-4 flex items-start gap-3 transition-colors ${
                                  task.completed ? "bg-gray-50/50" : "hover:bg-gray-50"
                                }`}
                              >
                                <button
                                  onClick={() => handleToggle(task)}
                                  disabled={toggling === task.id}
                                  className="mt-0.5 flex-shrink-0"
                                >
                                  {toggling === task.id ? (
                                    <Clock className="h-5 w-5 text-gray-400 animate-spin" />
                                  ) : task.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-gray-300 hover:text-emerald-500 transition-colors" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium ${
                                      task.completed
                                        ? "text-gray-400 line-through"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {task.description}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    {task.due_date && (
                                      <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(task.due_date).toLocaleDateString("en-GH", {
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
