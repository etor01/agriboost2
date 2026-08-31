// app/admin/activity/page.tsx
import { createClient } from '@/lib/supabase/server';
import {
  Leaf, MapPin, ShoppingBag, Sparkles, CheckSquare, CreditCard,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui';
import ActivityLogClient from './ActivityLogClient';

const activityMeta: Record<string, { iconColor: string; iconBg: string; label: string }> = {
  crop_created:     { iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', label: 'Crop Created' },
  farm_created:     { iconColor: 'text-teal-600',    iconBg: 'bg-teal-50',    label: 'Farm Created' },
  listing_created:  { iconColor: 'text-blue-600',    iconBg: 'bg-blue-50',    label: 'Listing' },
  scan_performed:   { iconColor: 'text-purple-600',  iconBg: 'bg-purple-50',  label: 'AI Scan' },
  task_completed:   { iconColor: 'text-amber-600',   iconBg: 'bg-amber-50',   label: 'Task Done' },
  payment_received: { iconColor: 'text-green-600',   iconBg: 'bg-green-50',   label: 'Payment' },
};

const typeIcons: Record<string, React.ElementType> = {
  crop_created: Leaf, farm_created: MapPin, listing_created: ShoppingBag,
  scan_performed: Sparkles, task_completed: CheckSquare, payment_received: CreditCard,
};

export default async function ActivityLogPage() {
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from('activities')
    .select(`id, activity_type, title, description, created_at, profiles ( firstname, lastname, role )`)
    .order('created_at', { ascending: false })
    .limit(500); // fetch plenty — client handles pagination at 50/page

  // Type breakdown for the mini stats row (server-computed)
  const typeCounts = activities?.reduce<Record<string, number>>((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Activity Log"
        description="A chronological log of all user and platform events."
      />

      {/* Type Breakdown */}
      {activities && activities.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(activityMeta).map(([type, meta]) => {
            const count = typeCounts[type] ?? 0;
            const Icon = typeIcons[type];
            return (
              <div key={type} className="rounded-lg border border-zinc-200 bg-white p-3.5 flex flex-col items-center gap-2 text-center shadow-sm">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${meta.iconBg}`}>
                  <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                </div>
                <p className="text-xl font-semibold text-zinc-900 tabular-nums">{count}</p>
                <p className="text-[10px] text-zinc-400 leading-tight">{meta.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Client component handles filter + pagination */}
      <ActivityLogClient activities={(activities ?? []) as any} />
    </div>
  );
}
