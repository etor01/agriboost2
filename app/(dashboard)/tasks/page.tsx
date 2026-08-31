import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TasksClientPage from "./tasks-client";
import type { Task, Crop, Farm } from "@/lib/database.types";
import { FarmerPageHeader } from "@/components/farmer/ui";
import { ClipboardList } from "lucide-react";

export const metadata = {
  title: "Tasks | AgriBoost",
  description: "Manage your farm and crop tasks",
};

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch farms
  const { data: farmsData } = await supabase
    .from("farms")
    .select("*")
    .eq("profile_id", user.id);
  const farms = (farmsData as Farm[]) ?? [];

  if (farms.length === 0) {
    return (
      <div className="space-y-6">
        <FarmerPageHeader
          badge="Field Operations"
          badgeIcon={ClipboardList}
          title="Task Management"
          description="Manage your daily farm activities, scheduled field maintenance, and AI-generated growth plan tasks."
        />
        <TasksClientPage tasks={[]} crops={[]} farms={[]} />
      </div>
    );
  }

  const farmIds = farms.map((f) => f.id);

  // 2. Fetch crops for these farms
  const { data: cropsData } = await supabase
    .from("crops")
    .select("*")
    .in("farm_id", farmIds);
  const crops = (cropsData as Crop[]) ?? [];

  const cropIds = crops.map((c) => c.id);

  // 3. Fetch regular tasks
  let tasks: Task[] = [];
  let completions: any[] = [];
  if (cropIds.length > 0) {
    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*, crops ( crop_type, farm_id )")
      .in("crop_id", cropIds)
      .order("due_date", { ascending: true });
    tasks = (tasksData as any) ?? [];

    const { data: completionsData } = await supabase
      .from("crop_task_completions")
      .select("*")
      .in("crop_id", cropIds);
    completions = completionsData ?? [];
  }

  return (
    <div className="space-y-6">
      <FarmerPageHeader
        badge="Field Operations"
        badgeIcon={ClipboardList}
        title="Task Management"
        description="Manage your daily farm activities, scheduled field maintenance, and AI-generated growth plan tasks."
      />

      <TasksClientPage tasks={tasks} crops={crops} farms={farms} completions={completions} />
    </div>
  );
}

