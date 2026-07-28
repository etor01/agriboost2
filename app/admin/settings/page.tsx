// app/admin/settings/page.tsx
// Super admin only — gated in middleware
'use client';

import { useState } from 'react';
import { Settings, Lock, Save, ToggleLeft, ToggleRight, ChevronDown, CheckCircle } from 'lucide-react';

// ── Dummy state reflecting the platform defaults ────────────────────────────

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function NumberField({
  label, desc, value, onChange, unit,
}: {
  label: string; desc: string; value: number; onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-28 text-right border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>
    </div>
  );
}

function ToggleField({
  label, desc, value, onChange,
}: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex-shrink-0
          ${value
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
      >
        {value
          ? <><ToggleRight className="w-4 h-4" /> Enabled</>
          : <><ToggleLeft className="w-4 h-4" /> Disabled</>}
      </button>
    </div>
  );
}

export default function PlatformSettingsPage() {
  const [cfg, setCfg] = useState(INITIAL);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof typeof INITIAL, val: unknown) =>
    setCfg((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    // Wire to a server action later — e.g. update a platform_config table
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 w-fit">
        <Lock className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-amber-700">Super Admin Access — Platform Settings</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Global configuration for AgriBoost. Changes apply platform-wide.</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex-shrink-0
            ${saved ? 'bg-green-600' : 'bg-gray-900 hover:bg-gray-800'}`}
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      {/* Subscriptions */}
      <SectionCard title="Subscriptions & Billing">
        <NumberField
          label="Premium Subscription Price"
          desc="Annual fee for the 5-Star Farmer premium plan, charged via Paystack."
          value={cfg.subscriptionPriceGHS}
          onChange={(v) => update('subscriptionPriceGHS', v)}
          unit="GH₵"
        />
        <div className="border-t border-gray-100" />
        <NumberField
          label="Free Trial Duration"
          desc="Number of days a new farmer gets access to premium features before the trial expires."
          value={cfg.trialDurationDays}
          onChange={(v) => update('trialDurationDays', v)}
          unit="days"
        />
      </SectionCard>

      {/* AI Scans */}
      <SectionCard title="AI Diagnostic Scans">
        <NumberField
          label="Free Plan Scan Allowance"
          desc="Maximum AI crop disease scans available to farmers on the free tier."
          value={cfg.freeAiScans}
          onChange={(v) => update('freeAiScans', v)}
          unit="scans"
        />
        <div className="border-t border-gray-100" />
        <NumberField
          label="Premium Plan Scan Allowance"
          desc="Maximum scans for premium farmers. Set to 999 for effectively unlimited."
          value={cfg.premiumAiScans}
          onChange={(v) => update('premiumAiScans', v)}
          unit="scans"
        />
      </SectionCard>

      {/* Marketplace */}
      <SectionCard title="Marketplace & Orders">
        <ToggleField
          label="Marketplace Enabled"
          desc="When disabled, farmers cannot create listings and buyers cannot place orders."
          value={cfg.marketplaceEnabled}
          onChange={(v) => update('marketplaceEnabled', v)}
        />
        <div className="border-t border-gray-100" />
        <ToggleField
          label="Listing Moderation Required"
          desc="When enabled, all new listings require admin approval before going live."
          value={cfg.listingModerationRequired}
          onChange={(v) => update('listingModerationRequired', v)}
        />
        <div className="border-t border-gray-100" />
        <NumberField
          label="Escrow Auto-Release"
          desc="Hours after delivery confirmation before escrow is automatically released to farmer."
          value={cfg.escrowAutoReleaseHours}
          onChange={(v) => update('escrowAutoReleaseHours', v)}
          unit="hours"
        />
      </SectionCard>

      {/* Farmer Onboarding */}
      <SectionCard title="Farmer Onboarding">
        <ToggleField
          label="New Signups Enabled"
          desc="Temporarily disable all new user registrations. Existing users can still log in."
          value={cfg.newSignupsEnabled}
          onChange={(v) => update('newSignupsEnabled', v)}
        />
        <div className="border-t border-gray-100" />
        <ToggleField
          label="Farmer Verification Required"
          desc="When enabled, unverified farmers cannot create listings or access premium features."
          value={cfg.farmerVerificationRequired}
          onChange={(v) => update('farmerVerificationRequired', v)}
        />
      </SectionCard>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-red-700 uppercase tracking-wide">Danger Zone</h2>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-800">Maintenance Mode</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Puts the entire platform in read-only mode. All write operations will be blocked.
              Use only during database migrations or critical updates.
            </p>
          </div>
          <button
            onClick={() => update('maintenanceMode', !cfg.maintenanceMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-shrink-0
              ${cfg.maintenanceMode
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white border border-red-300 text-red-600 hover:bg-red-50'}`}
          >
            {cfg.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center pb-4">
        ⚠️ These settings are currently stored in local state only. Wire to a <code>platform_config</code> table or environment variables to persist changes.
      </p>
    </div>
  );
}
