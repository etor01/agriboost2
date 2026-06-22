// app/(dashboard)/farm/[id]/farm-client-page.tsx
// NOTE: All Supabase/DB interactions replaced with dummy interactive frontend for MVP demo

// --- ORIGINAL SUPABASE LOGIC COMMENTED OUT ---
// import { createClient } from '@/lib/supabase/client';
// const supabase = createClient();
// async function addCrop(cropData) { await supabase.from('crops').insert(...) }
// async function updateTask(taskId) { await supabase.from('tasks').update(...) }

"use client";

import { useState } from "react";
import Link from "next/link";

// ── Dummy Farm Data ────────────────────────────────────────────────
const DUMMY_FARMS: Record<string, {
  name: string; location: string; size_in_acres: number; crop: string; status: string; soil: string; irrigation: string; established: string;
}> = {
  "farm-1": { name: "Asante North Farm", location: "Ejisu, Ashanti", size_in_acres: 12, crop: "Maize & Cassava", status: "Active", soil: "Loamy", irrigation: "Rain-fed", established: "March 2022" },
  "farm-2": { name: "Volta Valley Plot", location: "Ho, Volta Region", size_in_acres: 5, crop: "Tomatoes & Pepper", status: "Active", soil: "Sandy Loam", irrigation: "Drip Irrigation", established: "June 2023" },
  "farm-3": { name: "Brong Highlands", location: "Sunyani, Brong-Ahafo", size_in_acres: 8, crop: "Yam & Cocoyam", status: "Dormant", soil: "Clay Loam", irrigation: "Rain-fed", established: "January 2021" },
};

const DEFAULT_FARM = { name: "Demo Farm", location: "Ghana", size_in_acres: 5, crop: "Mixed Crops", status: "Active", soil: "Loamy", irrigation: "Rain-fed", established: "2024" };

const INITIAL_CROPS = [
  { id: "c1", name: "Maize (Obuobi)", planted: "2025-03-01", harvest: "2025-07-01", area: 4, health: "Good", stage: "Flowering" },
  { id: "c2", name: "Cassava", planted: "2025-01-15", harvest: "2026-01-15", area: 5, health: "Excellent", stage: "Vegetative" },
  { id: "c3", name: "Garden Eggs", planted: "2025-04-10", harvest: "2025-07-30", area: 3, health: "Fair", stage: "Fruiting" },
];

const INITIAL_TASKS = [
  { id: "t1", label: "Apply NPK Fertilizer – Maize", due: "Jun 25", done: false, priority: "high" },
  { id: "t2", label: "Weed control – Cassava block", due: "Jun 28", done: false, priority: "medium" },
  { id: "t3", label: "Soil moisture check", due: "Jun 22", done: true, priority: "low" },
  { id: "t4", label: "Spray fungicide – Garden Eggs", due: "Jun 30", done: false, priority: "high" },
];

const ACTIVITY = [
  { emoji: "🌱", text: "Cassava watered (Block B)", time: "2 hrs ago" },
  { emoji: "📊", text: "Soil pH test completed — 6.2", time: "1 day ago" },
  { emoji: "🤖", text: "AI scan: Maize health Good", time: "2 days ago" },
  { emoji: "💊", text: "Pesticide applied — Garden Eggs", time: "3 days ago" },
];

// ── Glass Card ────────────────────────────────────────────────────
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] ${className}`}>
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

// ── Main Client Page ───────────────────────────────────────────────
export default function FarmDetailClient({ farmId }: { farmId: string }) {
  const farm = DUMMY_FARMS[farmId] ?? DEFAULT_FARM;

  const [crops, setCrops] = useState(INITIAL_CROPS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState("");

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: `t${Date.now()}`, label: newTask, due: "TBD", done: false, priority: "medium" }]);
    setNewTask("");
    setShowAddTask(false);
  };

  const completedTasks = tasks.filter(t => t.done).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Back + Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/profile" className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1 mb-2">
            ← Back to Profile
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{farm.name}</h1>
          <p className="text-gray-500 text-sm mt-1">📍 {farm.location}</p>
        </div>
        <span className={`self-start px-3 py-1.5 rounded-full text-sm font-bold ${farm.status === "Active" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
          ● {farm.status}
        </span>
      </div>

      {/* Farm Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { emoji: "📐", label: "Farm Size", value: `${farm.size_in_acres} acres` },
          { emoji: "🌿", label: "Primary Crop", value: farm.crop },
          { emoji: "🪨", label: "Soil Type", value: farm.soil },
          { emoji: "💧", label: "Irrigation", value: farm.irrigation },
        ].map(stat => (
          <GlassCard key={stat.label} className="p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-lg mb-2">{stat.emoji}</div>
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className="text-sm font-extrabold text-gray-900 mt-0.5">{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Crops + Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Crops */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">🌱 Crop Records ({crops.length})</h2>
            <button
              onClick={() => setShowAddCrop(true)}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              + Add Crop
            </button>
          </div>
          <div className="space-y-3">
            {crops.map(crop => (
              <div key={crop.id} className="p-3 rounded-xl bg-white/80 border border-gray-100 hover:border-emerald-200 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{crop.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Stage: <span className="font-semibold text-gray-700">{crop.stage}</span> · {crop.area} acres</p>
                    <p className="text-xs text-gray-400 mt-0.5">Planted: {crop.planted} · Harvest: {crop.harvest}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${HEALTH_COLORS[crop.health] || "bg-gray-100 text-gray-500"}`}>
                    {crop.health}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Tasks */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">📋 Tasks</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{completedTasks}/{tasks.length} done</span>
              <button
                onClick={() => setShowAddTask(v => !v)}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                + Task
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-gray-100 mb-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
              style={{ width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%` }}
            />
          </div>

          {showAddTask && (
            <div className="flex gap-2 mb-3">
              <input
                value={newTask} onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddTask()}
                placeholder="New task..."
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm text-gray-800"
                autoFocus
              />
              <button onClick={handleAddTask} className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors">Add</button>
            </div>
          )}

          <div className="space-y-2">
            {tasks.map(task => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${task.done ? "opacity-50 bg-gray-50" : "bg-white/80 hover:bg-white"}`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.done ? "bg-emerald-500 border-emerald-500" : "border-gray-300 hover:border-emerald-400"}`}>
                  {task.done && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.done ? "line-through text-gray-400" : "text-gray-800"}`}>{task.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Due: {task.due}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  task.priority === "high" ? "bg-red-100 text-red-600" :
                  task.priority === "medium" ? "bg-amber-100 text-amber-600" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Activity + AI Insight Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity */}
        <GlassCard className="p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">🕐 Farm Activity</h2>
          <div className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/60 hover:bg-white transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-base flex-shrink-0">{a.emoji}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Insight Panel */}
        <GlassCard className="p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">🤖 AI Farm Insights</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-700 mb-1">✅ Crop Health Score</p>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-extrabold text-emerald-700">82<span className="text-base font-medium">/100</span></p>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                    <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-emerald-400 to-green-500" />
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">Good — Monitor Garden Eggs</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Alert: Pest Risk</p>
              <p className="text-sm text-amber-800">Moderate risk of aphid infestation on your Garden Eggs. Consider neem oil spray within 3 days.</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-1">💡 Recommendation</p>
              <p className="text-sm text-blue-800">Apply top-dressing fertilizer to Maize field. Current growth stage (flowering) is optimal timing.</p>
            </div>
            <Link href="/ai-center" className="block text-center text-sm text-emerald-600 font-bold hover:text-emerald-700 underline underline-offset-2 pt-1">
              Run full AI analysis →
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* Add Crop Modal */}
      {showAddCrop && (
        <AddCropModal
          onClose={() => setShowAddCrop(false)}
          onAdd={(crop) => { setCrops(prev => [...prev, crop]); setShowAddCrop(false); }}
        />
      )}
    </div>
  );
}

// ── Add Crop Modal ─────────────────────────────────────────────────
function AddCropModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (crop: typeof INITIAL_CROPS[0]) => void;
}) {
  const [name, setName] = useState("");
  const [planted, setPlanted] = useState("");
  const [harvest, setHarvest] = useState("");
  const [area, setArea] = useState("");
  const [stage, setStage] = useState("Seedling");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !planted || !area) return;
    onAdd({
      id: `c${Date.now()}`,
      name,
      planted,
      harvest: harvest || "TBD",
      area: parseFloat(area),
      health: "Good",
      stage,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900">🌱 Add Crop Record</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Crop Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Maize (Obuobi)"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date Planted *</label>
              <input type="date" value={planted} onChange={e => setPlanted(e.target.value)} required
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Expected Harvest</label>
              <input type="date" value={harvest} onChange={e => setHarvest(e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Area (Acres) *</label>
              <input type="number" value={area} onChange={e => setArea(e.target.value)} required min="0.1" step="0.1" placeholder="e.g. 2"
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Growth Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)}
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm">
                {["Seedling","Vegetative","Flowering","Fruiting","Harvest Ready"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all active:scale-95">Add Crop</button>
          </div>
        </form>
      </div>
    </div>
  );
}
