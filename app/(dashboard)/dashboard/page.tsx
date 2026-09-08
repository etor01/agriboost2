import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Farm, Crop, Activity, TaskWithCrop, CropGrowthPlan } from "@/lib/database.types";
import Link from "next/link";
import {
  type LucideIcon,
  ArrowRight,
  CheckCircle2,
  Circle,
  Droplets,
  Leaf,
  MapPin,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Sprout,
  Tractor,
  TrendingUp,
  Wallet,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Eye,
} from "lucide-react";
import WeatherWidget from "@/components/WeatherWidget";
import FarmingTipWidget from "@/components/FarmingTipWidget";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { FarmerStatCard, FarmerBadge, FarmerCard, FarmerCardHeader, FarmerCardContent, FarmerEmptyState } from "@/components/farmer/ui";

export const metadata: Metadata = {
  title: "Farm Dashboard ",
  description: "Your AgriBoost farm overview — crops, revenue, tasks, and weather at a glance.",
};

// ── Ghana region / city → GPS coordinates ────────────────────────
const GHANA_REGION_COORDS: Record<string, { lat: number; lon: number }> = {
  "Greater Accra": { lat: 5.6037, lon: -0.1870 },
  "Ashanti": { lat: 6.6885, lon: -1.6244 },
  "Western": { lat: 5.1186, lon: -1.7500 },
  "Eastern": { lat: 6.2638, lon: -0.2255 },
  "Central": { lat: 5.1135, lon: -1.2670 },
  "Volta": { lat: 6.5735, lon: 0.4514 },
  "Northern": { lat: 9.5583, lon: -0.9336 },
  "Upper East": { lat: 10.7866, lon: -0.9462 },
  "Upper West": { lat: 10.2552, lon: -2.3225 },
  "Bono": { lat: 7.3349, lon: -1.6891 },
  "Brong-Ahafo": { lat: 7.3349, lon: -1.6891 },
  "Savannah": { lat: 9.0820, lon: -1.7177 },
  "Oti": { lat: 7.9528, lon: 0.1779 },
  "Ahafo": { lat: 7.0, lon: -2.3 },
  "Bono East": { lat: 7.7, lon: -1.2 },
  "North East": { lat: 10.5, lon: -0.35 },
  "Western North": { lat: 6.3, lon: -2.8 },
  "Accra": { lat: 5.6037, lon: -0.1870 },
  "Kumasi": { lat: 6.6885, lon: -1.6244 },
  "Tamale": { lat: 9.4008, lon: -0.8393 },
  "Cape Coast": { lat: 5.1037, lon: -1.2465 },
  "Takoradi": { lat: 4.8981, lon: -1.7557 },
  "Ho": { lat: 6.6011, lon: 0.4712 },
  "Bolgatanga": { lat: 10.7866, lon: -0.9462 },
  "Wa": { lat: 10.0601, lon: -2.5099 },
  "Sunyani": { lat: 7.3349, lon: -2.3287 },
};

function resolveCoords(regionOrCity: string): { lat: number; lon: number } {
  const key = Object.keys(GHANA_REGION_COORDS).find((k) =>
    regionOrCity.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(regionOrCity.toLowerCase())
  );
  return key ? GHANA_REGION_COORDS[key] : { lat: 6.6885, lon: -1.6244 };
}

// ── Weather fetch 
async function getWeatherData(lat = 6.6885, lon = -1.6244) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=5`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("failed");
    return res.json();
  } catch {
    return null;
  }
}

// ── Compute which week of the AI plan "today" falls in 
function computeCurrentWeek(plantingDate: string, totalWeeks: number): number {
  const planted = new Date(plantingDate).getTime();
  const daysElapsed = Math.max(
    0,
    Math.floor((Date.now() - planted) / 86_400_000)
  );
  return Math.min(Math.floor(daysElapsed / 7) + 1, totalWeeks);
}

interface ThisWeekTask {
  task: string;
  category: string;
  priority: string;
  notes: string | null;
  cropType: string;
  weekNumber: number;
  totalWeeks: number;
}

// ── Category label/color for dashboard pills ──────────────────────
const TASK_CAT: Record<string, { variant: 'blue' | 'success' | 'warn' | 'danger' | 'purple' | 'default'; icon: LucideIcon }> = {
  watering: { variant: "blue", icon: Droplets },
  fertilizer: { variant: "success", icon: Sprout },
  weeding: { variant: "success", icon: Leaf },
  pest_control: { variant: "warn", icon: ShieldCheck },
  disease_prevention: { variant: "danger", icon: AlertTriangle },
  observation: { variant: "purple", icon: Eye },
  harvest: { variant: "warn", icon: Leaf },
};

const QUICK_ACTIONS: Array<{
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bg: string;
}> = [
    { label: "Add New Farm", icon: Tractor, href: "/farm/new", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200" },
    { label: "Create Listing", icon: Package, href: "/marketplace/new", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100/80 border-blue-200" },
    { label: "AI Crop Scan", icon: Sparkles, href: "/ai-center", color: "text-purple-600", bg: "bg-purple-50 hover:bg-purple-100/80 border-purple-200" },
    { label: "View Finances", icon: Wallet, href: "/finances", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100/80 border-amber-200" },
  ];

const getActivityMeta = (type: string) => {
  switch (type) {
    case "crop_created": return { icon: Sprout, color: "text-emerald-600", bg: "bg-emerald-50" };
    case "farm_created": return { icon: Tractor, color: "text-teal-600", bg: "bg-teal-50" };
    case "listing_created": return { icon: Package, color: "text-blue-600", bg: "bg-blue-50" };
    case "scan_performed": return { icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" };
    case "task_completed": return { icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50" };
    case "payment_received": return { icon: Wallet, color: "text-green-600", bg: "bg-green-50" };
    default: return { icon: Sprout, color: "text-zinc-600", bg: "bg-zinc-50" };
  }
};

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const oneWeekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [
    profileRes,
    farmsRes,
    activeListingsRes,
    newListingsRes,
    txRes,
    activitiesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("farms").select("*").eq("profile_id", user.id),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .eq("status", "active"),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .gte("created_at", oneWeekAgo),
    supabase
      .from("transactions")
      .select("amount")
      .eq("profile_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("activities")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const profile = profileRes.data;
  const farms = farmsRes.data ?? [];
  const activeListingsCount = activeListingsRes.count;
  const newListingsThisWeek = newListingsRes.count;
  const totalRevenue = txRes.data?.reduce((sum, tx) => sum + Number(tx.amount), 0) ?? 0;
  const recentActivities: Activity[] = activitiesRes.data ?? [];

  const regionOrCity =
    (farms[0] as Farm & { region?: string })?.region ??
    (farms[0] as Farm)?.location ??
    profile?.region ??
    "Ashanti";
  const { lat, lon } = resolveCoords(regionOrCity);

  const farmIds = farms.map((f: Farm) => f.id);

  const [cropsRes, weatherData] = await Promise.all([
    farmIds.length > 0
      ? supabase
        .from("crops")
        .select("*")
        .in("farm_id", farmIds)
        .eq("status", "active")
      : Promise.resolve({ data: [] }),
    getWeatherData(lat, lon),
  ]);

  const crops = (cropsRes.data as Crop[]) ?? [];

  const thisWeekTasks: ThisWeekTask[] = [];
  for (const crop of crops) {
    if (!crop.ai_growth_data || !crop.planting_date) continue;
    const plan = crop.ai_growth_data as unknown as CropGrowthPlan;
    if (!plan.weeks || !plan.total_weeks) continue;
    const currentWeekNum = computeCurrentWeek(crop.planting_date, plan.total_weeks);
    const weekData = plan.weeks.find((w) => w.week_number === currentWeekNum);
    if (weekData) {
      for (const task of weekData.tasks) {
        thisWeekTasks.push({
          task: task.task,
          category: task.category,
          priority: task.priority,
          notes: task.notes,
          cropType: crop.crop_type,
          weekNumber: currentWeekNum,
          totalWeeks: plan.total_weeks,
        });
      }
    }
  }

  const cropIds = crops.map((c: Crop) => c.id);
  let tasks: TaskWithCrop[] = [];
  if (thisWeekTasks.length === 0 && cropIds.length > 0) {
    const { data: tasksData } = await supabase
      .from("tasks")
      .select(`id, description, due_date, completed, priority, crop_id, crops ( crop_type )`)
      .in("crop_id", cropIds)
      .eq("completed", false)
      .order("due_date", { ascending: true })
      .limit(8);
    tasks = (tasksData as unknown as TaskWithCrop[]) ?? [];
  }

  const safeProfile = profile ?? {
    id: user.id,
    firstname: user.user_metadata?.firstname ?? user.email ?? "Farmer",
    avatar_url: null,
  };
  const firstName = safeProfile.firstname as string;
  const today = new Date();

  const cropTypes = [...new Set(crops.map((c: Crop) => c.crop_type))];
  const primaryRegion = (farms[0] as Farm & { region?: string })?.region ?? (farms[0] as Farm)?.location ?? "Ghana";

  return (
    <div className="space-y-6">
      {/* Header Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            {today.toLocaleDateString("en-GH", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Good{" "}
            {today.getHours() < 12
              ? "morning"
              : today.getHours() < 17
                ? "afternoon"
                : "evening"}
            , {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            {"Here's what's happening across your farms and listings today."}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 text-xs sm:text-sm font-medium transition-colors"
          >
            <ShoppingBag className="h-4 w-4 text-zinc-500" /> Marketplace
          </Link>
          <Link
            href="/marketplace/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" /> New Listing
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FarmerStatCard
          title="Total Farms"
          value={String(farms.length || 0)}
          icon={Tractor}
          iconColor="text-emerald-600"
          sub="Registered properties"
          trend={`+${farms.filter((f) => new Date(f.created_at).getMonth() === today.getMonth()).length} this month`}
        />
        <FarmerStatCard
          title="Active Crops"
          value={String(crops.length || 0)}
          icon={Leaf}
          iconColor="text-lime-600"
          iconBg="bg-lime-50 border-lime-100"
          sub="Across all farms"
          trend={`${crops.filter((c: Crop) => c.ai_growth_data).length} with AI plan`}
        />
        <FarmerStatCard
          title="Revenue (MTD)"
          value={`GH₵ ${totalRevenue.toFixed(2)}`}
          icon={Wallet}
          iconColor="text-emerald-600"
          sub="Total completed payouts"
          accent
        />
        <FarmerStatCard
          title="Active Listings"
          value={String(activeListingsCount || 0)}
          icon={Package}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
          sub="Live in marketplace"
          trend={newListingsThisWeek ? `+${newListingsThisWeek} this week` : undefined}
        />
      </div>

      {/* Weather + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ErrorBoundary label="Weather Widget">
            <WeatherWidget initialWeatherData={weatherData} />
          </ErrorBoundary>
        </div>

        <FarmerCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-zinc-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-md border ${action.bg} transition-all text-center`}
                  >
                    <Icon className={`h-4 w-4 ${action.color}`} />
                    <p className="text-xs font-semibold text-zinc-800 leading-tight">
                      {action.label}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <ErrorBoundary label="Farming Tip">
            <FarmingTipWidget crops={cropTypes} region={primaryRegion} />
          </ErrorBoundary>
        </FarmerCard>
      </div>

      {/* This Week + Activity + My Farms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* This Week on Your Farm */}
        <FarmerCard>
          <FarmerCardHeader
            title="This Week on Your Farm"
            icon={Calendar}
            action={
              thisWeekTasks.length > 0 ? (
                <Link
                  href="/tasks"
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  {thisWeekTasks.length} task{thisWeekTasks.length !== 1 ? "s" : ""}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : null
            }
          />
          <FarmerCardContent>
            {thisWeekTasks.length > 0 ? (
              <div className="space-y-3">
                {Array.from(new Set(thisWeekTasks.map((t) => t.cropType))).map((ct) => {
                  const cropTasks = thisWeekTasks.filter((t) => t.cropType === ct);
                  const first = cropTasks[0];
                  return (
                    <div key={ct} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-700 uppercase tracking-wide">
                          {ct}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Week {first.weekNumber} of {first.totalWeeks}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cropTasks.map((t, i) => {
                          const meta = TASK_CAT[t.category] ?? { variant: "default", icon: Eye };
                          return (
                            <FarmerBadge key={i} variant={meta.variant} icon={meta.icon}>
                              {t.task}
                            </FarmerBadge>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <Link
                  href="/farms"
                  className="block text-center text-xs text-emerald-600 font-medium pt-2 hover:underline"
                >
                  View full timeline →
                </Link>
              </div>
            ) : crops.length === 0 ? (
              <FarmerEmptyState
                icon={Sprout}
                title="No crops registered yet"
                description="Add a crop to get an automated week-by-week AI care schedule."
                action={
                  <Link
                    href="/farms"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
                  >
                    + Register Crop
                  </Link>
                }
              />
            ) : tasks.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 space-y-1.5">
                <CheckCircle2 className="h-7 w-7 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-zinc-700">All tasks completed!</p>
                <p className="text-[11px] text-zinc-400">No pending tasks for this week.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-md border border-zinc-100 bg-zinc-50/60 hover:bg-zinc-50 transition-colors"
                  >
                    <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-800 truncate">{task.description}</p>
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

        {/* Recent Activity */}
        <FarmerCard>
          <FarmerCardHeader title="Recent Activity" icon={Sparkles} />
          <FarmerCardContent>
            {recentActivities.length === 0 ? (
              <FarmerEmptyState
                icon={Sparkles}
                title="No recent activities"
                description="Your farm events and updates will be logged here."
              />
            ) : (
              <div className="space-y-2.5">
                {recentActivities.map((a: Activity) => {
                  const meta = getActivityMeta(a.activity_type);
                  const Icon = meta.icon;
                  return (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 p-2.5 rounded-md border border-zinc-100 hover:bg-zinc-50/60 transition-colors"
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-800 truncate">{a.title}</p>
                        {a.description && (
                          <p className="text-[11px] text-zinc-500 truncate mt-0.5">{a.description}</p>
                        )}
                        <span className="text-[10px] text-zinc-400 block mt-1">
                          {formatRelativeTime(a.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </FarmerCardContent>
        </FarmerCard>

        {/* My Farms Overview */}
        <FarmerCard>
          <FarmerCardHeader
            title="My Farms"
            icon={Tractor}
            action={
              <Link
                href="/farms"
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                Manage All <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <FarmerCardContent>
            {farms.length > 0 ? (
              <div className="space-y-2">
                {farms.slice(0, 4).map((farm: { id: string; name: string; location: string; size_in_acres: number }) => (
                  <Link key={farm.id} href={`/farm/${farm.id}`} className="block">
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-md border border-zinc-100 bg-white hover:bg-zinc-50/60 hover:border-zinc-200 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-800 truncate">{farm.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-zinc-400" /> {farm.location}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-semibold text-zinc-900">{farm.size_in_acres} ac</span>
                        <FarmerBadge variant="success">Active</FarmerBadge>
                      </div>
                    </div>
                  </Link>
                ))}
                {farms.length > 4 && (
                  <Link
                    href="/farms"
                    className="block text-center text-xs text-emerald-600 font-medium pt-1 hover:underline"
                  >
                    +{farms.length - 4} more farms
                  </Link>
                )}
              </div>
            ) : (
              <FarmerEmptyState
                icon={Sprout}
                title="No farms registered"
                description="Add your first farm property to track crops and care plans."
                action={
                  <Link
                    href="/farm/new"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
                  >
                    + Add Farm
                  </Link>
                }
              />
            )}
          </FarmerCardContent>
        </FarmerCard>
      </div>
    </div>
  );
}

