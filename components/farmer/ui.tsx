// components/farmer/ui.tsx
// Shared farmer UI primitives — shadcn design philosophy, pure Tailwind
import React from 'react';
import type { LucideIcon } from 'lucide-react';

// ── FarmerPageHeader ──────────────────────────────────────────────────────────

export function FarmerPageHeader({
  title,
  description,
  badge,
  badgeIcon: BadgeIcon,
  action,
}: {
  title: string;
  description?: string;
  badge?: string;
  badgeIcon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="space-y-1">
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-800">
            {BadgeIcon && <BadgeIcon className="h-3 w-3 text-emerald-600" />}
            <span>{badge}</span>
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
        {description && (
          <p className="text-sm text-zinc-500 max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2.5 flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── FarmerStatCard ────────────────────────────────────────────────────────────

export function FarmerStatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-emerald-600',
  iconBg = 'bg-emerald-50 border-emerald-100',
  sub,
  trend,
  accent,
  onClick,
}: {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  sub?: string;
  trend?: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  const baseClass = `rounded-lg border bg-white p-5 shadow-sm transition-all hover:border-zinc-300 ${
    accent ? 'border-l-4 border-l-emerald-500 border-zinc-200' : 'border-zinc-200'
  }${onClick ? ' cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 active:scale-[0.99]' : ''}`;

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        {Icon && (
          <div className={`rounded-md p-2 border ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.startsWith('+')
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {trend}
          </span>
        )}
        {sub && <p className="text-xs text-zinc-400 truncate">{sub}</p>}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={baseClass}>
        {content}
      </button>
    );
  }

  return <div className={baseClass}>{content}</div>;
}

// ── FarmerBadge ───────────────────────────────────────────────────────────────

export type FarmerBadgeVariant = 'default' | 'success' | 'warn' | 'danger' | 'muted' | 'blue' | 'purple';

const BADGE_STYLES: Record<FarmerBadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warn:    'bg-amber-50 text-amber-700 border-amber-200',
  danger:  'bg-red-50 text-red-700 border-red-200',
  muted:   'bg-zinc-50 text-zinc-500 border-zinc-200',
  blue:    'bg-blue-50 text-blue-700 border-blue-200',
  purple:  'bg-purple-50 text-purple-700 border-purple-200',
};

export function FarmerBadge({
  children,
  variant = 'default',
  icon: Icon,
}: {
  children: React.ReactNode;
  variant?: FarmerBadgeVariant;
  icon?: LucideIcon;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[variant]}`}
    >
      {Icon && <Icon className="h-3 w-3 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

// ── FarmerCard ────────────────────────────────────────────────────────────────

export function FarmerCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function FarmerCardHeader({
  title,
  description,
  icon: Icon,
  action,
  className = '',
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-5 py-4 border-b border-zinc-100 flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-600 flex-shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function FarmerCardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

// ── FarmerEmptyState ──────────────────────────────────────────────────────────

export function FarmerEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-zinc-100 p-3 mb-3 border border-zinc-200">
        <Icon className="h-6 w-6 text-zinc-400" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-zinc-400 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
