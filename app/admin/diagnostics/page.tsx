// app/admin/diagnostics/page.tsx
import { createClient } from '@/lib/supabase/server';
import { Sparkles, AlertTriangle, CheckCircle, Clock, MapPin, TrendingUp } from 'lucide-react';
import { AdminPageHeader, AdminBadge, AdminEmptyState } from '@/components/admin/ui';
import type { LucideIcon } from 'lucide-react';

type StatusVariant = 'success' | 'warn' | 'danger';

const statusConfig: Record<string, { label: string; variant: StatusVariant; icon: LucideIcon }> = {
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle },
  pending: { label: 'Pending', variant: 'warn', icon: Clock },
  failed: { label: 'Failed', variant: 'danger', icon: AlertTriangle },
};

const REGIONAL_TRENDS = [
  { region: 'Ashanti Region', scans: 24, topDisease: 'Maize Rust', severity: 'high', pct: 82 },
  { region: 'Eastern Region', scans: 18, topDisease: 'Tomato Blight', severity: 'medium', pct: 60 },
  { region: 'Brong-Ahafo', scans: 11, topDisease: 'Cassava Mosaic', severity: 'low', pct: 35 },
  { region: 'Northern Region', scans: 7, topDisease: 'Leaf Spot', severity: 'low', pct: 20 },
  { region: 'Volta Region', scans: 5, topDisease: 'Root Rot', severity: 'medium', pct: 45 },
];

type SeverityKey = 'high' | 'medium' | 'low';
type BadgeVariant = 'danger' | 'warn' | 'success';

const severityVariant: Record<SeverityKey, BadgeVariant> = { high: 'danger', medium: 'warn', low: 'success' };
const barColor: Record<SeverityKey, string> = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-emerald-500' };

export default async function DiagnosticsPage() {
  const supabase = await createClient();

  const [
    { data: diagnostics },
    { count: totalScans },
    { count: completedScans },
    { count: failedScans },
  ] = await Promise.all([
    supabase.from('crop_diagnostics')
      .select(`id, status, created_at, image_url, ai_result, farmers ( profiles ( firstname, lastname, region ) )`)
      .order('created_at', { ascending: false }).limit(20),
    supabase.from('crop_diagnostics').select('*', { count: 'exact', head: true }),
    supabase.from('crop_diagnostics').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('crop_diagnostics').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
  ]);

  const successRate = totalScans && totalScans > 0
    ? Math.round(((completedScans ?? 0) / totalScans) * 100) : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="AI Diagnostics" description="Monitor crop disease scan activity, regional trends, and AI model performance." />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans', value: totalScans ?? 0, color: 'text-zinc-900' },
          { label: 'Completed', value: completedScans ?? 0, color: 'text-emerald-600' },
          { label: 'Failed', value: failedScans ?? 0, color: 'text-red-600' },
          { label: 'Success Rate', value: `${successRate}%`, color: successRate >= 90 ? 'text-emerald-600' : 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm text-center">
            <p className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Trends */}
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-100">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-medium text-zinc-900">Regional Disease Trends</h2>
            <span className="ml-auto text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">Demo data</span>
          </div>
          <div className="p-5 space-y-4">
            {REGIONAL_TRENDS.map((r) => (
              <div key={r.region}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-sm text-zinc-700">{r.region}</span>
                    <AdminBadge variant={severityVariant[r.severity as SeverityKey]}>{r.severity}</AdminBadge>
                  </div>
                  <span className="text-xs text-zinc-400">{r.scans} scans</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${barColor[r.severity as SeverityKey]}`} style={{ width: `${r.pct}%` }} />
                </div>
                <p className="text-xs text-zinc-400 mt-1">Top disease: <strong className="text-zinc-600">{r.topDisease}</strong></p>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Actions */}
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-medium text-zinc-900">Admin Actions</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { title: 'Broadcast Disease Alert', desc: 'Push a regional warning to all affected farmers', action: 'Broadcast', cls: 'bg-red-600 hover:bg-red-700' },
              { title: 'Update AI Model Parameters', desc: 'Adjust confidence thresholds and disease definitions', action: 'Configure', cls: 'bg-zinc-900 hover:bg-zinc-700' },
              { title: 'Export Scan Report', desc: "Download this month's diagnostic log as CSV", action: 'Export CSV', cls: 'bg-emerald-600 hover:bg-emerald-700' },
              { title: 'Review Failed Scans', desc: `${failedScans ?? 0} scans failed and need manual review`, action: 'Review', cls: 'bg-amber-600 hover:bg-amber-700' },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between gap-4 p-3.5 rounded-md border border-zinc-100 hover:border-zinc-200 transition-colors">
                <div>
                  <p className="text-sm font-medium text-zinc-800">{item.title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                </div>
                <button className={`text-xs font-medium text-white px-3 py-1.5 rounded-md transition-colors flex-shrink-0 ${item.cls} disabled:opacity-50 disabled:pointer-events-none`} disabled={true}>
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scan Log */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-100">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-medium text-zinc-900">Recent Diagnostic Scans <span className="text-zinc-400 font-normal">(last 20)</span></h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                {['Farmer', 'Region', 'AI Result', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {diagnostics && diagnostics.map((d) => {
                const ui = statusConfig[d.status] ?? statusConfig['pending'];
                const Icon = ui.icon;
                const farmer = (d.farmers as any)?.profiles;
                const farmerName = farmer ? [farmer.firstname, farmer.lastname].filter(Boolean).join(' ') : 'Unknown';
                const aiLabel = (d.ai_result as any)?.disease ?? (d.ai_result as any)?.label ?? '—';
                return (
                  <tr key={d.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-zinc-800">{farmerName}</td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600">{farmer?.region ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-zinc-700">{aiLabel}</td>
                    <td className="px-5 py-3.5">
                      <AdminBadge variant={ui.variant} icon={Icon}>{ui.label}</AdminBadge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400">
                      {new Date(d.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {(!diagnostics || diagnostics.length === 0) && (
          <AdminEmptyState icon={Sparkles} title="No scans yet" description="AI diagnostic scans will appear here as farmers use the feature." />
        )}
      </div>
    </div>
  );
}
