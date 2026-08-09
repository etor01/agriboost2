import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TasksClientPage from "./tasks-client";
import type { Task, Crop, Farm } from "@/lib/database.types";

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
    return <TasksClientPage tasks={[]} crops={[]} farms={[]} />;
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

  // We will pass this data to the client component to handle AI tasks and filtering
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Task Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your daily farm activities and AI-generated growth plan tasks.
          </p>
        </div>
      </div>

      <TasksClientPage tasks={tasks} crops={crops} farms={farms} completions={completions} />
    </div>
  );
}
