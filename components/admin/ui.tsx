// components/admin/ui.tsx
// Shared admin UI primitives — shadcn design philosophy, pure Tailwind
import type { LucideIcon } from 'lucide-react';

// ── AdminPageHeader ───────────────────────────────────────────────────────────

export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-0.5">
      <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">{title}</h1>
      {description && (
        <p className="text-sm text-zinc-500">{description}</p>
      )}
    </div>
  );
}

// ── AdminStatCard ─────────────────────────────────────────────────────────────

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-zinc-500',
  sub,
  accent,
}: {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm ${
        accent ? 'border-l-4 border-l-emerald-500 border-zinc-200' : 'border-zinc-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        {Icon && (
          <div className="rounded-md bg-zinc-100 p-1.5">
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold text-zinc-900 tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}

// ── AdminBadge ────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warn' | 'danger' | 'muted' | 'blue' | 'purple';

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warn:    'bg-amber-50 text-amber-700 border-amber-200',
  danger:  'bg-red-50 text-red-700 border-red-200',
  muted:   'bg-zinc-50 text-zinc-500 border-zinc-200',
  blue:    'bg-blue-50 text-blue-700 border-blue-200',
  purple:  'bg-purple-50 text-purple-700 border-purple-200',
};

export function AdminBadge({
  children,
  variant = 'default',
  icon: Icon,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: LucideIcon;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[variant]}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

// ── AdminEmptyState ───────────────────────────────────────────────────────────

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-zinc-100 p-3 mb-3">
        <Icon className="h-6 w-6 text-zinc-400" />
      </div>
      <h3 className="text-sm font-medium text-zinc-700">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-zinc-400 max-w-xs">{description}</p>
      )}
    </div>
  );
}
