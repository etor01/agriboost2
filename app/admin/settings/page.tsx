// app/admin/settings/page.tsx
// Super admin only — gated in middleware
'use client';

import { useState } from 'react';
import { Lock, Save, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui';

const INITIAL = {
  subscriptionPriceGHS: 120,
  trialDurationDays: 30,
  freeAiScans: 10,
  premiumAiScans: 999,
  maintenanceMode: false,
  newSignupsEnabled: true,
  marketplaceEnabled: true,
  escrowAutoReleaseHours: 48,
  listingModerationRequired: true,
  farmerVerificationRequired: true,
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50">
        <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-800">{label}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function PlatformSettingsPage() {
  const [cfg, setCfg] = useState(INITIAL);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof typeof INITIAL, val: unknown) =>
    setCfg((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5">
        <Lock className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-medium text-amber-700">Super Admin Access — Platform Settings</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <AdminPageHeader title="Platform Settings" description="Global configuration for AgriBoost. Changes apply platform-wide." />
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors flex-shrink-0 ${
            saved ? 'bg-emerald-600' : 'bg-zinc-900 hover:bg-zinc-700'
          }`}
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      {/* Subscriptions */}
      <SectionCard title="Subscriptions & Billing">
        <FieldRow label="Premium Subscription Price" desc="Annual fee for the 5-Star Farmer premium plan, charged via Paystack.">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">GH₵</span>
            <input
              type="number" value={cfg.subscriptionPriceGHS}
              onChange={(e) => update('subscriptionPriceGHS', Number(e.target.value))}
              className="w-24 text-right rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </FieldRow>
        <div className="border-t border-zinc-100" />
        <FieldRow label="Free Trial Duration" desc="Days a new farmer gets premium access before the trial expires.">
          <div className="flex items-center gap-2">
            <input
              type="number" value={cfg.trialDurationDays}
              onChange={(e) => update('trialDurationDays', Number(e.target.value))}
              className="w-24 text-right rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <span className="text-sm text-zinc-500">days</span>
          </div>
        </FieldRow>
      </SectionCard>

      {/* AI Scans */}
      <SectionCard title="AI Diagnostic Scans">
        <FieldRow label="Free Plan Scan Allowance" desc="Maximum AI crop disease scans available to free-tier farmers.">
          <div className="flex items-center gap-2">
            <input
              type="number" value={cfg.freeAiScans}
              onChange={(e) => update('freeAiScans', Number(e.target.value))}
              className="w-24 text-right rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <span className="text-sm text-zinc-500">scans</span>
          </div>
        </FieldRow>
        <div className="border-t border-zinc-100" />
        <FieldRow label="Premium Plan Scan Allowance" desc="Maximum scans for premium farmers. Set to 999 for effectively unlimited.">
          <div className="flex items-center gap-2">
            <input
              type="number" value={cfg.premiumAiScans}
              onChange={(e) => update('premiumAiScans', Number(e.target.value))}
              className="w-24 text-right rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <span className="text-sm text-zinc-500">scans</span>
          </div>
        </FieldRow>
      </SectionCard>

      {/* Marketplace */}
      <SectionCard title="Marketplace & Orders">
        {[
          { key: 'marketplaceEnabled' as const, label: 'Marketplace Enabled', desc: 'When disabled, farmers cannot create listings and buyers cannot place orders.' },
          { key: 'listingModerationRequired' as const, label: 'Listing Moderation Required', desc: 'When enabled, all new listings require admin approval before going live.' },
        ].map((field, i) => (
          <div key={field.key}>
            {i > 0 && <div className="border-t border-zinc-100" />}
            <FieldRow label={field.label} desc={field.desc}>
              <button
                onClick={() => update(field.key, !cfg[field.key])}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                  cfg[field.key]
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {cfg[field.key] ? <><ToggleRight className="w-4 h-4" /> Enabled</> : <><ToggleLeft className="w-4 h-4" /> Disabled</>}
              </button>
            </FieldRow>
          </div>
        ))}
        <div className="border-t border-zinc-100" />
        <FieldRow label="Escrow Auto-Release" desc="Hours after delivery confirmation before escrow is automatically released to farmer.">
          <div className="flex items-center gap-2">
            <input
              type="number" value={cfg.escrowAutoReleaseHours}
              onChange={(e) => update('escrowAutoReleaseHours', Number(e.target.value))}
              className="w-24 text-right rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <span className="text-sm text-zinc-500">hours</span>
          </div>
        </FieldRow>
      </SectionCard>

      {/* Farmer Onboarding */}
      <SectionCard title="Farmer Onboarding">
        {[
          { key: 'newSignupsEnabled' as const, label: 'New Signups Enabled', desc: 'Temporarily disable all new user registrations. Existing users can still log in.' },
          { key: 'farmerVerificationRequired' as const, label: 'Farmer Verification Required', desc: 'When enabled, unverified farmers cannot create listings or access premium features.' },
        ].map((field, i) => (
          <div key={field.key}>
            {i > 0 && <div className="border-t border-zinc-100" />}
            <FieldRow label={field.label} desc={field.desc}>
              <button
                onClick={() => update(field.key, !cfg[field.key])}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                  cfg[field.key]
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {cfg[field.key] ? <><ToggleRight className="w-4 h-4" /> Enabled</> : <><ToggleLeft className="w-4 h-4" /> Disabled</>}
              </button>
            </FieldRow>
          </div>
        ))}
      </SectionCard>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 space-y-4">
        <h2 className="text-xs font-semibold text-red-700 uppercase tracking-wide">Danger Zone</h2>
        <FieldRow
          label="Maintenance Mode"
          desc="Puts the entire platform in read-only mode. All write operations will be blocked. Use only during database migrations or critical updates."
        >
          <button
            onClick={() => update('maintenanceMode', !cfg.maintenanceMode)}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              cfg.maintenanceMode
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white border border-red-300 text-red-600 hover:bg-red-50'
            }`}
          >
            {cfg.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
          </button>
        </FieldRow>
      </div>

      <p className="text-xs text-zinc-400 text-center pb-4">
        ⚠️ Settings are stored in local state only. Wire to a <code className="text-zinc-600">platform_config</code> table to persist changes.
      </p>
    </div>
  );
}
