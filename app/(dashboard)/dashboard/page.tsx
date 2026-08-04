import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Farm, Crop, Activity, TaskWithCrop } from "@/lib/database.types";
import Link from "next/link";
import {
  type LucideIcon,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Leaf,
  MapPin,
  Package,
  Plus,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Sprout,
  SunMedium,
  Tractor,
  TrendingUp,
  Wallet,
} from "lucide-react";
import WeatherWidget from "@/components/WeatherWidget";

// ── Weather fetch (Default server-side fallback) ────────────────────
async function getWeatherData() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=6.6885&longitude=-1.6244&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=5`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("failed");
    return res.json();
  } catch {
    return null;
  }
}

const QUICK_ACTIONS: Array<{
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
}> = [
  {
    label: "Add New Farm",
    icon: Tractor,
    href: "/farm/new",
    color: "from-emerald-500 to-green-500",
  },
  {
    label: "Create Listing",
    icon: Package,
    href: "/marketplace/new",
    color: "from-blue-500 to-cyan-500",
  },
  {
    label: "AI Crop Scan",
    icon: Sparkles,
    href: "/ai-center",
    color: "from-purple-500 to-violet-500",
  },
  {
    label: "View Finances",
    icon: Wallet,
    href: "/finances",
    color: "from-amber-500 to-orange-500",
  },
];

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

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  trend?: string;
}) {
  return (
    <GlassCard className="p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Icon className="h-5 w-5 text-emerald-600" />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.startsWith("+") ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 font-medium mt-3">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-0.5 tracking-tight">
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </GlassCard>
  );
}

const getActivityMeta = (type: string) => {
  switch (type) {
    case "crop_created":
      return { icon: Sprout, color: "bg-green-100 text-green-600" };
    case "farm_created":
      return { icon: Tractor, color: "bg-emerald-100 text-emerald-600" };
    case "listing_created":
      return { icon: Package, color: "bg-blue-100 text-blue-600" };
    case "scan_performed":
      return { icon: Sparkles, color: "bg-purple-100 text-purple-600" };
    case "task_completed":
      return { icon: CheckCircle2, color: "bg-teal-100 text-teal-600" };
    case "payment_received":
      return { icon: Wallet, color: "bg-amber-100 text-amber-600" };
    default:
      return { icon: Sprout, color: "bg-gray-100 text-gray-600" };
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profiles, farms, and weather
  const [profileRes, farmsRes, weatherData] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("farms").select("*").eq("profile_id", user.id),
    getWeatherData(),
  ]);

  const profile = profileRes.data;
  const farms = farmsRes.data ?? [];

  // Fetch crops for user's farms
  const farmIds = farms.map((f: Farm) => f.id);
  let crops: Crop[] = [];
  if (farmIds.length > 0) {
    const { data: cropsData } = await supabase
      .from("crops")
      .select("*")
      .in("farm_id", farmIds);
    crops = (cropsData as Crop[]) ?? [];
  }

  // Fetch tasks for those crops
  const cropIds = crops.map((c: Crop) => c.id);
  let tasks: TaskWithCrop[] = [];
  if (cropIds.length > 0) {
    const { data: tasksData } = await supabase
      .from("tasks")
      .select(`
        id,
        description,
        due_date,
        completed,
        priority,
        crop_id,
        crops ( crop_type )
      `)
      .in("crop_id", cropIds)
      .order("due_date", { ascending: true });
    tasks = tasksData ?? [];
  }

  // Fetch active listings count
  const { count: activeListingsCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .eq("status", "active");

  // Fetch completed transactions revenue
  const { data: txData } = await supabase
    .from("transactions")
    .select("amount")
    .eq("profile_id", user.id)
    .eq("status", "completed");
  const totalRevenue = txData?.reduce((sum, tx) => sum + Number(tx.amount), 0) ?? 0;

  // Fetch recent activity logs
  const { data: activitiesData } = await supabase
    .from("activities")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  const recentActivities: Activity[] = activitiesData ?? [];

  const safeProfile = profile ?? {
    id: user.id,
    firstname: user.user_metadata?.firstname ?? user.email ?? "Farmer",
    avatar_url: user.user_metadata?.avatar_url ?? null,
  };

  const firstName = safeProfile.firstname as string;
  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="bg-green-200 p-2 rounded-b-2xl">
          <p className="text-sm text-emerald-600 font-semibold">
            {today.toLocaleDateString("en-GH", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
            Good{" "}
            {today.getHours() < 12
              ? "morning"
              : today.getHours() < 17
                ? "afternoon"
                : "evening"}
            , {firstName}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {"Here's what's happening on your farm today."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/marketplace"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 font-semibold text-sm bg-white/80 hover:bg-emerald-50 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" /> Marketplace
          </Link>
          <Link
            href="/marketplace/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-green-600 transition-all"
          >
            <Plus className="h-4 w-4" /> New Listing
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Tractor}
          label="Total Farms"
          value={String(farms.length || 0)}
          sub="Registered farms"
          trend={`+${farms.filter(f => new Date(f.created_at).getMonth() === today.getMonth()).length} this month`}
        />
        <KpiCard
          icon={Leaf}
          label="Active Crops"
          value={String(crops.length || 0)}
          sub="Across all farms"
          trend={`+${crops.filter(c => c.status === "active").length} active`}
        />
        <KpiCard
          icon={Wallet}
          label="Revenue (MTD)"
          value={`GH₵ ${totalRevenue.toFixed(2)}`}
          sub="Total completed payouts"
          trend="+0%"
        />
        <KpiCard
          icon={Package}
          label="Active Listings"
          value={String(activeListingsCount || 0)}
          sub="On marketplace"
          trend="+0 this week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dynamic Weather Widget */}
        <div className="lg:col-span-2">
          <WeatherWidget initialWeatherData={weatherData} />
        </div>

        <GlassCard className="p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95`}
                >
                  <Icon className="h-5 w-5" />
                  <p className="text-xs font-bold text-center leading-tight">
                    {action.label}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-xs font-bold text-amber-800 mb-0.5 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Farming Tip
            </p>
            <p className="text-[11px] text-amber-700">
              Maize performs best at 25–30°C. Make sure to log irrigation tasks during hot dry spells to maximize yield potential!
            </p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Real Tasks List */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Circle className="h-4 w-4 text-emerald-600" /> Upcoming Tasks
            </h2>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {tasks.filter((t) => !t.completed).length} pending
            </span>
          </div>

          {crops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <Sprout className="h-10 w-10 text-emerald-500 animate-bounce" />
              <div>
                <p className="text-sm font-semibold text-gray-700">No crops registered yet</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                  Add your first crop to automatically generate tasks!
                </p>
              </div>
              <Link
                href="/farms"
                className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
              >
                + Register Crop
              </Link>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold">All tasks completed!</p>
              <p className="text-xs">No pending tasks for active crops.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${task.completed ? "opacity-50 bg-gray-50" : "bg-white/60 hover:bg-white"}`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${task.completed ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}`}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}
                    >
                      {task.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase">
                        {task.crops?.crop_type || "General"}
                      </span>
                      <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString("en-GH", { day: 'numeric', month: 'short' }) : "TBD"}</span>
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

        {/* Real Recent Activities List */}
        <GlassCard className="p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" /> Recent Activity
          </h2>
          {recentActivities.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Sparkles className="h-8 w-8 text-purple-400 opacity-40 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-semibold">No recent activities</p>
              <p className="text-xs">Your actions will be logged here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a: Activity) => {
                const meta = getActivityMeta(a.activity_type);
                const Icon = meta.icon;
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/60 hover:bg-white transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {a.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                        {a.description}
                      </p>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        {formatRelativeTime(a.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Tractor className="h-4 w-4 text-emerald-600" /> My Farms
            </h2>
            <Link
              href="/farms"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Manage All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {farms.length > 0 ? (
            <div className="space-y-2">
              {farms
                .slice(0, 4)
                .map(
                  (farm: {
                    id: string;
                    name: string;
                    location: string;
                    size_in_acres: number;
                  }) => (
                    <Link key={farm.id} href={`/farm/${farm.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-emerald-100">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                          <Sprout className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {farm.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {farm.location}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-gray-700">
                            {farm.size_in_acres} ac
                          </p>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    </Link>
                  ),
                )}
              {farms.length > 4 && (
                <Link
                  href="/farms"
                  className="block text-center text-xs text-emerald-600 font-semibold pt-1 hover:underline"
                >
                  +{farms.length - 4} more farms
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <Sprout className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  No farms yet
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Add your first farm to get started
                </p>
              </div>
              <Link
                href="/farm/new"
                className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200"
              >
                + Add Farm
              </Link>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Market Snapshot
            </p>
            <div className="space-y-1.5">
              {[
                { crop: "White Maize", price: "GH₵ 180/bag", trend: "up" },
                { crop: "Tomatoes", price: "GH₵ 85/crate", trend: "down" },
                { crop: "Yam (Pona)", price: "GH₵ 25/tuber", trend: "up" },
              ].map((m) => (
                <div
                  key={m.crop}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-600 font-medium">{m.crop}</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${m.trend === "up" ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {m.trend === "up" ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}{" "}
                    {m.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
