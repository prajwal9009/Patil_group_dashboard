import React, { useState } from "react";
import data from "./Final_json_sept.json";

// Import your existing components (they were provided in the project files).
// Make sure these filenames/paths match your project structure.
import WiresBusinessDashboard from "./wires_business_dashboard_react.jsx";
import KPIDashboard from "./KRA_platwise.jsx";
import CapexDashboard from "./Capex_and_upgradation_platwise.jsx";

function KPIKard({ title, unit, targetYTD, actualYTD }) {
  const achieved = (targetYTD && actualYTD != null) ? Math.round((actualYTD / targetYTD) * 10000) / 100 : null;
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500">{title}</div>
          <div className="mt-1 text-2xl font-semibold">
            {actualYTD !== undefined ? actualYTD : "-"} <span className="text-sm text-slate-400">/ {targetYTD ?? "-"}</span>
          </div>
          <div className="text-xs text-slate-400">{unit}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Achieved</div>
          <div className="text-lg font-medium text-amber-500">{achieved !== null ? `${achieved}%` : "-"}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500">YTD</div>
    </div>
  );
}

export default function App() {
  // UI state: which area is visible
  const [view, setView] = useState("home"); // home | wires | kras | capex
  const [selectedPlant, setSelectedPlant] = useState("Bobilli"); // for KRA details

  // Extract summary KPIs from JSON. The JSON structure stores these in Summary[0].kra_items
  const summaryKraItems = (data.Summary && data.Summary[0] && data.Summary[0].kra_items) || [];

  const findKPI = (descStartsWith) =>
    summaryKraItems.find(k => k.description && k.description.toLowerCase().startsWith(descStartsWith.toLowerCase()));

  const productionKPI = findKPI("Production");
  const dispatchKPI = findKPI("Dispatches");
  const workingCapitalKPI = findKPI("Working Capital");
  const revenueKPI = findKPI("Revenue");

  // Helper to read totals from the "All plants Total" detail row (if present)
  function extractTotals(kpiObj) {
    if (!kpiObj || !kpiObj.details) return {};
    const totalRow = kpiObj.details.find(d =>
      d.plant && (d.plant.toLowerCase().includes("all plants") || d.plant.toLowerCase().includes("total"))
    ) || kpiObj.details[kpiObj.details.length - 1]; // fallback to last
    return {
      targetYTD: totalRow ? (totalRow.target_ytd ?? totalRow.targetYTD ?? totalRow.target_ytd) : undefined,
      actualYTD: totalRow ? (totalRow.actual_ytd ?? totalRow.actualYTD ?? totalRow.actual_ytd) : undefined,
      unit: kpiObj.unit || ""
    };
  }

  const prodTotals = extractTotals(productionKPI);
  const dispatchTotals = extractTotals(dispatchKPI);
  const wcTotals = extractTotals(workingCapitalKPI);
  const revTotals = extractTotals(revenueKPI);

  const keyUpdates = {
  Bobilli: data.Key_Updates_Bobilli,
  Bokaro: data.Key_Updates_Bokaro,
  Roopangarh: data.Key_Updates_Roopangarh,
};


  const tacticalPlans = {
    Bobilli: data.Tactical_Action_Plan_Bobilli,
    Bokaro: data.Tactical_Action_Plan_Bokaro,
    Roopangarh: data.Tactical_Action_Plan_Roopangarh
  };

  const renderSection = (title, data) => (
  <div className="mb-4">
    <h5 className="font-semibold text-slate-800 mb-2">{title}</h5>
    <ul className="space-y-1 list-disc list-inside text-slate-700 text-sm">
      {Object.entries(data).map(([key, value]) => (
        <li key={key}>
          <strong>{key.replace(/_/g, " ")}:</strong>{" "}
          {Array.isArray(value) ? (
            <ul className="list-disc list-inside ml-5">
              {value.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : typeof value === "object" && value !== null ? (
            <ul className="list-disc list-inside ml-5">
              {Object.entries(value).map(([subKey, subValue]) => (
                <li key={subKey}>
                  <strong>{subKey.replace(/_/g, " ")}:</strong> {subValue}
                </li>
              ))}
            </ul>
          ) : (
            value
          )}
        </li>
      ))}
    </ul>
  </div>
);





  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-amber-600">Wires Business</h1>
            <p className="text-sm text-slate-500 mt-1">Summary — FY data </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">{(data.Summary && data.Summary[0] && data.Summary[0].fiscal_year) || "FY"}</div>
            <div className="px-3 py-1 bg-white rounded-full text-sm border">Sep</div>
          </div>
        </header>

        {/* Summary area */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Summary</h2>

            <div className="flex gap-2">
              <button
                onClick={() => setView("wires")}
                className="px-3 py-1 rounded-md bg-white border shadow-sm text-sm hover:shadow-lg"
              >
                Production & Dispatch Insights
              </button>
              <button
                onClick={() => setView("kras")}
                className="px-3 py-1 rounded-md bg-white border shadow-sm text-sm hover:shadow-lg"
              >
                KRAs
              </button>
              <button
                onClick={() => setView("capex")}
                className="px-3 py-1 rounded-md bg-white border shadow-sm text-sm hover:shadow-lg"
              >
                CapEx & Upgradation
              </button>
              <button
                onClick={() => { setView("home"); setSelectedPlant("Bobilli"); }}
                className="px-3 py-1 rounded-md bg-orange-500 hover:brightness-95 text-white text-sm shadow"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIKard
              title="Production"
              unit={prodTotals.unit || "MT"}
              targetYTD={prodTotals.targetYTD}
              actualYTD={prodTotals.actualYTD}
            />

            <KPIKard
              title="Dispatches"
              unit={dispatchTotals.unit || "MT"}
              targetYTD={dispatchTotals.targetYTD}
              actualYTD={dispatchTotals.actualYTD}
            />

            <KPIKard
              title="Working Capital"
              unit={wcTotals.unit || "Cr"}
              targetYTD={wcTotals.targetYTD}
              actualYTD={wcTotals.actualYTD}
            />

            <KPIKard
              title="Revenue"
              unit={revTotals.unit || "Cr"}
              targetYTD={revTotals.targetYTD}
              actualYTD={revTotals.actualYTD}
            />
          </div>
        </section>

        {/* Conditional render area */}
        <section className="mb-8">
          {view === "home" && (
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Quick actions</h3>
              <p className="text-sm text-slate-600">Click the buttons above to view the detailed dashboards (Production and Dispatch insights, KRAs or CapEx & Upgradation)</p>
            </div>
          )}

          {view === "wires" && (
            <div className="mt-4">
              {/* Render the wires business dashboard component you supplied. */}
              <WiresBusinessDashboard />
            </div>
          )}

          {view === "kras" && (
            <div className="mt-4 space-y-6">
              {/* Render KRA component you supplied */}
              <div className="bg-white rounded-2xl p-4 border shadow-sm">
                <KPIDashboard />
              </div>
            </div>
          )}

          {view === "capex" && (
            <div className="mt-4">
              <CapexDashboard />
            </div>
          )}
        </section>

        {/* -------------------------
            PLANTWISE BLOCK — ALWAYS VISIBLE
            ------------------------- */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Plantwise Key Updates & Tactical Action Plans</h3>
              <div className="flex gap-2">
                {["Bobilli", "Bokaro", "Roopangarh"].map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlant(p)}
                    className={`text-sm px-3 py-1 rounded ${selectedPlant === p ? "bg-amber-400 text-white" : "bg-white border"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <h4 className="text-sm font-medium mb-2">Key updates — {selectedPlant}</h4>
                <div className="whitespace-pre-wrap text-sm text-slate-700 border rounded p-3 bg-slate-50">
                  {keyUpdates[selectedPlant] || "No key updates available."}
                </div>
              </div> */}
              <div>
  <div>
  <h4 className="text-sm font-medium mb-2">Key updates — {selectedPlant}</h4>

  <div className="text-sm text-slate-700 border rounded p-3 bg-slate-50">
    {keyUpdates[selectedPlant] ? (
      <>
        {renderSection("Highlights", keyUpdates[selectedPlant].Highlight)}
        {renderSection("Lowlights", keyUpdates[selectedPlant].Lowlight)}
      </>
    ) : (
      "No key updates available."
    )}
  </div>
</div>

</div>


              <div>
                <h4 className="text-sm font-medium mb-2">Tactical Action Plan — {selectedPlant}</h4>
                <div className="text-sm text-slate-700 border rounded p-3 bg-slate-50">
                  {tacticalPlans[selectedPlant]
                    ? typeof tacticalPlans[selectedPlant] === "object"
                      ? Object.entries(tacticalPlans[selectedPlant]).map(([k, v]) => (
                          <div key={k} className="mb-2">
                            <div className="text-sm text-slate-700 mb-2 font-bold">{k}</div>
                            <div className="mt-1 text-sm">{typeof v === "string" ? v : JSON.stringify(v)}</div>
                          </div>
                        ))
                      : String(tacticalPlans[selectedPlant])
                    : "No tactical action plan available."}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

