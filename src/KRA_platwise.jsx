import React from "react";
import kra_data from "./kra_data.json"; // place kra_data.json next to this component

const plantData = kra_data;

export default function KPIDashboard() {
  const plants = {
    bobbili: plantData.bobbili || [],
    bokaro: plantData.bokaro || [],
    roopangarh: plantData.roopangarh || []
  };

  const plantKeys = Object.keys(plants);
  const [selectedPlant, setSelectedPlant] = React.useState(plantKeys[0] || "bobbili");
  const [active, setActive] = React.useState(null);

  
  function displayName(key) {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  // --- Robust key finder: attempts multiple matches for keys that represent technological upgradations for a plant ---
  function findTechKeyForPlant(plantKey) {
    if (!plantData || typeof plantData !== "object") return null;
    const keys = Object.keys(plantData);
    const lowerPlant = plantKey.toLowerCase();

    // candidate substrings that might indicate "technology upgradations" (common variations)
    const techIndicators = [
      "technological_upgrad",
      "technologicalupgrad",
      "tech_upgrad",
      "techupgrade",
      "tech_upgradations",
      "technological upgrad",
      "technologicalupgradations",
      "technology_upgrad",
      "technology_upgradations",
      "tech_upgradations",
      "technological_upgradations"
    ];

    // 1) Prefer keys that contain any tech indicator AND the plant name
    for (const k of keys) {
      const lower = k.toLowerCase();
      const hasIndicator = techIndicators.some(ind => lower.includes(ind));
      const hasPlant = lower.includes(lowerPlant) || lower.includes(displayName(plantKey).toLowerCase());
      if (hasIndicator && hasPlant) return k;
    }

    // 2) Next prefer any key that starts with a tech indicator (even if plant name not present)
    for (const k of keys) {
      const lower = k.toLowerCase();
      const hasIndicator = techIndicators.some(ind => lower.includes(ind));
      if (hasIndicator) return k;
    }

    // 3) Last resort: exact constructed candidates
    const candidates = [
      `Technological_Upgradations_${displayName(plantKey)}`,
      `Technological_Upgradations_${plantKey}`,
      `Tech_Upgradations_${displayName(plantKey)}`,
      `Tech_Upgradations_${plantKey}`,
      `Technology_Upgradations_${displayName(plantKey)}`,
      `Technology_Upgradations_${plantKey}`
    ];
    for (const c of candidates) {
      if (keys.includes(c)) return c;
    }

    return null;
  }

  // Normalize whatever value we find into an array of strings (or empty array)
  function normalizeTechValue(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === "string") {
      // if it's long text with separators, split sensible ways
      // prefer newline splits, fallback to semicolon or comma
      const byLine = v.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      if (byLine.length > 1) return byLine;
      const bySemi = v.split(";").map(s => s.trim()).filter(Boolean);
      if (bySemi.length > 1) return bySemi;
      const byComma = v.split(",").map(s => s.trim()).filter(Boolean);
      if (byComma.length > 1) return byComma;
      // single string entry
      return [v.trim()];
    }
    // if object or other, try to JSON stringify or return empty
    if (typeof v === "object") {
      try {
        return Object.values(v).map(String);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  // Get tech list for the selected plant only (returns array)
  function getTechForSelectedPlant(plantKey) {
    const key = findTechKeyForPlant(plantKey);
    if (!key) return [];
    return normalizeTechValue(plantData[key]);
  }

  // --- Sparkline + DetailInline components unchanged (kept minimal here) ---
  function Sparkline({ data = [], width = 120, height = 32 }) {
    if (!data || data.length === 0) return <div className="text-xs">no trend</div>;
    const numeric = data.map((d) => (typeof d === "number" ? d : parseFloat(d))).map(v => Number.isFinite(v) ? v : NaN);
    const valid = numeric.filter(Number.isFinite);
    const min = valid.length ? Math.min(...valid) : 0;
    const max = valid.length ? Math.max(...valid) : min + 1;
    const range = max - min || 1;
    const step = width / Math.max(1, data.length - 1);

    const points = data.map((d, i) => {
      const v = Number.isFinite(Number(d)) ? Number(d) : min;
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(" ");

    const lastIndex = data.length - 1;
    const lastValue = Number.isFinite(Number(data[lastIndex])) ? Number(data[lastIndex]) : min;
    const lastX = lastIndex * step;
    const lastY = height - ((lastValue - min) / range) * height;

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.95 }}
        />
        <circle cx={lastX} cy={lastY} r={2.6} fill="currentColor" />
      </svg>
    );
  }

  function DetailInline({ kp }) {
    const monthLabels = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
    const labels = monthLabels.slice(0, kp.months ? kp.months.length : 0);

    return (
      <div className="mt-4 p-4 rounded-xl bg-slate-50 border">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-500">Detail</div>
            <h3 className="text-lg font-semibold">{kp.title}</h3>
          </div>
          <div className="text-sm text-slate-500">ID: {kp.id}</div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-slate-400">Target FY</div>
            <div className="font-medium">{kp.targetFY ?? "-"}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Target YTD</div>
            <div className="font-medium">{kp.targetYTD ?? "-"}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Actual YTD</div>
            <div className="font-medium">{kp.actualYTD ?? "-"}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Month Target(Sep)</div>
            <div className="font-medium">{kp.monthTargetSep ?? "-"}</div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xs text-slate-400">Monthly Actuals</div>
          <div className="mt-2 flex items-center gap-3 overflow-x-auto">
            {kp.months && kp.months.length > 0 ? (
              kp.months.map((m, i) => (
                <div key={i} className="text-center min-w-[56px]">
                  <div className="text-sm font-semibold">{m}</div>
                  <div className="text-xs text-slate-400">{labels[i] ?? `M${i+1}`}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No monthly data</div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xs text-slate-400">Remarks</div>
          <div className="mt-2 text-sm text-slate-700 border-l-2 pl-3">{kp.remark || "-"}</div>
        </div>
      </div>
    );
  }

  // kpis for selected plant
  const kpis = plants[selectedPlant] || [];

  // tech list for selected plant only
  const techListForSelected = getTechForSelectedPlant(selectedPlant);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">KRA - {displayName(selectedPlant)} (Sep 25)</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600">FY 2025-26</div>
          <div className="px-3 py-1 bg-white rounded-full text-sm border">Sep</div>
        </div>
      </header>

      <div className="mb-4 flex gap-2">
        {plantKeys.map((k) => (
          <button
            key={k}
            onClick={() => { setSelectedPlant(k); setActive(null); }}
            className={`px-3 py-1 rounded-full border text-sm ${selectedPlant === k ? 'bg-amber-400 text-white' : 'bg-white'}`}
          >
            {displayName(k)}
          </button>
        ))}
      </div>

      <main>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpis.map((kp) => {
            return (
              <div key={kp.id}>
                <div
                  onClick={() => setActive(prev => prev === kp.id ? null : kp.id)}
                  className={`cursor-pointer border rounded-2xl p-4 shadow-sm hover:shadow-lg transition flex flex-col justify-between bg-white/90 ${active === kp.id ? "ring-2 ring-orange-300" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-500">{kp.title}</div>
                      <div className="mt-1 flex items-baseline gap-3">
                        <div className="text-2xl font-semibold">{kp.actualYTD ?? "-"}</div>
                        <div className="text-sm text-slate-400">/ {kp.targetYTD ?? "-"}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Month target</div>
                      <div className="font-medium">{kp.monthTargetSep ?? "-"}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="w-32">
                      <Sparkline data={kp.months} width={120} height={36} />
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-500">{kp.remark || "-"}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-400">Click card to {active === kp.id ? 'close' : 'open'} details</div>
                </div>

                {active === kp.id && (
                  <div className="mt-3 lg:mt-4">
                    <DetailInline kp={kp} />
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Show only the selected plant's Technology Upgradations */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Technology Upgradations — {displayName(selectedPlant)}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="border rounded-2xl p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Plant</div>
                  <h3 className="text-lg font-semibold">{displayName(selectedPlant)}</h3>
                </div>
                <div className="text-sm text-slate-400">{techListForSelected.length ? `${techListForSelected.length} items` : "No data"}</div>
              </div>

              <div className="mt-3">
                {techListForSelected.length ? (
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    {techListForSelected.map((t, i) => (
                      <li key={i} className="text-slate-700">{t}</li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-sm text-slate-500">No technological upgradation data found for this plant.</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      </div>
  );
}
