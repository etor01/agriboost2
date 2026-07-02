const metrics = [
  {
    label: "Average Yield",
    value: "3.8 % per acre",
    change: "+12% vs last season",
    tone: "text-emerald-600",
  },
  {
    label: "Active Farms",
    value: "5,248",
    change: "Across 12 regions",
    tone: "text-sky-600",
  },
  {
    label: "Market ",
    value: "High",
    change: "+18% this week",
    tone: "text-emerald-600",
  },
];

const performanceBars = [
  { label: "Maize", value: 86 },
  { label: "Cassava", value: 74 },
  { label: "Tomatoes", value: 92 },
  { label: "Pepper", value: 68 },
];

const insights = [
  "Farmers are reporting improved crop health and crop resilience.",
  "Yields for tomatoes and maize are high (prices should drop).",
  "Early planting windows are improving harvest confidence.",
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(135deg,_#f8fffb_0%,_#f7faf8_100%)] text-slate-800">
      <header className="border-b border-emerald-100/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-600">
              Agriboost public metrics
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              A transparent view of farm performance
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />{" "}
            Updated 1 hour ago
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white p-8 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.28)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
                  Platform overview
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Growing a resilient food ecosystem
                </h2>
              </div>
              <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                service status: Operational
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="text-sm text-slate-500">
                  Platform Health Score
                </div>
                <div className="mt-3 text-6xl font-semibold tracking-tight text-slate-900">
                  94<span className="text-3xl text-emerald-600"> %</span>
                </div>
                <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
                  Farmers are benefiting from better planning, faster insights,
                  and stronger market access with Agriboost.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                  <span>Crop health</span>
                  <span className="text-emerald-600">Excellent</span>
                </div>
                <div className="mt-4 h-2.5 rounded-full bg-slate-200">
                  <div className="h-2.5 w-[84%] rounded-full bg-gradient-to-r from-emerald-500 to-green-400" />
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    ["Disease resistance", "92%"],
                    ["Improved yield", "18%"],
                    ["Harvest readiness", "94%"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between text-sm text-slate-600"
                    >
                      <span>{label}</span>
                      <span className="font-semibold text-slate-900">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-7 text-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.4)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">
              Today’s snapshot
            </p>
            <div className="mt-5 space-y-4">
              {metrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4"
                >
                  <div className="text-sm text-slate-300">{item.label}</div>
                  <div className="mt-2 text-2xl font-semibold">
                    {item.value}
                  </div>
                  <div className={`mt-1 text-sm ${item.tone}`}>
                    {item.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {[
            ["Rainfall", "78 mm", "Stable"],
            ["Temperature", "29°C", "Optimal"],
            ["Average Crop Health", "89/100", "Excellent"],
          ].map(([title, value, note]) => (
            <div
              key={title}
              className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {value}
              </p>
              <p className="mt-2 text-sm font-medium text-emerald-600">
                {note}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
                  Yield by crop
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  Performance at a glance
                </h3>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                Last 90 days
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {performanceBars.map((bar) => (
                <div key={bar.label}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                    <span>{bar.label}</span>
                    <span className="font-medium text-slate-900">
                      {bar.value}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                      style={{ width: `${bar.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
              Public insights
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              What the data is saying
            </h3>
            <div className="mt-6 space-y-3">
              {insights.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
              This is a public metrics interface for insight into farm
              performance. For more detailed analytics, please contact our team.
              Data updates every 60 minutes · All metrics are anonymized and
              aggregated
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
