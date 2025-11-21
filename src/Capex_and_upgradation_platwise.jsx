import React, { useMemo, useState, useEffect } from "react";
import capexData from "./capex_data.json"; 

export default function CapexDashboard() {
  const plantButtons = ["Bobilli", "Bokaro", "Roopangarh"];

  const plantKeyMap = {
    Bobilli: "bobbili",
    Bokaro: "bokaro",
    Roopangarh: "roopangarh",
  };

  const [selectedPlant, setSelectedPlant] = useState(plantButtons[0]);
  const [allPlantsData, setAllPlantsData] = useState({});
  const [currentData, setCurrentData] = useState([]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState({});

  /* -------------------------------------------------------------
     Load JSON & Normalize structure
  ------------------------------------------------------------- */
  useEffect(() => {
    const normalized = {};

    // JSON is an object with plant groups
    if (capexData && typeof capexData === "object" && !Array.isArray(capexData)) {
      Object.keys(capexData).forEach((k) => {
        const key = k.trim().toLowerCase();
        if (Array.isArray(capexData[k])) {
          normalized[key] = capexData[k].map((item, idx) => ({
            serial_number: item.serial_number ?? idx + 1,
            ...item
          }));
        }
      });
    }

    // Ensure all plants exist
    Object.values(plantKeyMap).forEach((k) => {
      if (!normalized[k]) normalized[k] = [];
    });

    setAllPlantsData(normalized);
  }, []);

  /* -------------------------------------------------------------
     Switch plant → update current list
  ------------------------------------------------------------- */
  useEffect(() => {
    const key = plantKeyMap[selectedPlant];
    setCurrentData(allPlantsData[key] || []);
    setExpanded({});
  }, [selectedPlant, allPlantsData]);

  /* -------------------------------------------------------------
     Dynamic status_class List
  ------------------------------------------------------------- */
  const statuses = useMemo(() => {
    return ["All", ...Array.from(new Set(currentData.map((d) => d.status_class))).sort()];
  }, [currentData]);

  /* -------------------------------------------------------------
     Progress Estimation (uses completion_target)
  ------------------------------------------------------------- */
  function estimateProgress(completion_target) {
    if (!completion_target) return 0;
    const t = completion_target.toLowerCase();
    if (t.includes("done") || t.includes("tbd")) return 100;

    const months = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
      jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    };

    const m = completion_target.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
    if (!m) return 30;

    const monthIdx = months[m[1].toLowerCase()];
    const now = new Date();

    if (monthIdx === now.getMonth() + 1) return 60;
    if (monthIdx === now.getMonth() + 2) return 40;
    if (monthIdx < now.getMonth() + 1) return 80;

    return 20;
  }

  /* -------------------------------------------------------------
     Filtered view
  ------------------------------------------------------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return currentData.filter((d) => {
      if (statusFilter !== "All" && d.status_class !== statusFilter) return false;

      if (!q) return true;

      return (
        d.description?.toLowerCase().includes(q) ||
        d.remarks?.toLowerCase().includes(q) ||
        String(d.serial_number).includes(q)
      );
    });
  }, [currentData, query, statusFilter]);

  /* -------------------------------------------------------------
     MAIN RENDER
  ------------------------------------------------------------- */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Capex & Upgradation — {selectedPlant}</h1>
        </div>

        <div className="flex gap-3 items-center">
          {/* Plant Buttons */}
          <div className="flex gap-2">
            {plantButtons.map((p) => {
              const active = p === selectedPlant;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPlant(p)}
                  className={`px-3 py-1 rounded-md border ${
                    active ? "bg-sky-600 text-white" : "bg-white text-slate-700"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search description, remark or ID..."
            className="border rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Items" value={currentData.length} />
        <StatCard title="Completed" value={currentData.filter((d) => d.status_class === "Done").length} />
        <StatCard title="In Progress" value={currentData.filter((d) => d.status_class === "In Progress").length} />
      </div>

      {/* Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Filtered results</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.serial_number} className="bg-white border rounded-2xl p-5 shadow-md hover:shadow-lg transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                      #{item.serial_number}
                    </span>
                    <h3 className="text-md font-semibold">{item.description}</h3>
                  </div>

                  <p className="text-sm text-slate-500 mt-2">
                    Target: <strong>{item.completion_target}</strong>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <StatusPill status={item.status_class} />
                </div>
              </div>

              <div className="mt-4">
                <details className="text-sm text-slate-600">
                  <summary className="cursor-pointer select-none">Remarks</summary>
                  <p className="mt-2">{item.remarks}</p>
                </details>
              </div>
            </div>
          ))}

          {/* Kanban Board */}
          <div className="col-span-full mb-6">
            <h2 className="text-lg font-semibold mb-2">Project board</h2>
            <div className="overflow-x-auto -mx-3 px-3 pb-2">
              <div className="flex gap-4 min-w-full">
                {statuses
                  .filter((s) => s !== "All")
                  .map((s) => (
                    <div key={s} className="min-w-[280px] bg-white border rounded-lg p-3 shadow-sm">
                      <h3 className="font-semibold mb-2">{s}</h3>
                      <div className="flex flex-col gap-2">
                        {currentData
                          .filter((d) => d.status_class === s)
                          .map((d) => (
                            <MiniCard
                              key={d.serial_number}
                              item={d}
                              onToggle={() =>
                                setExpanded((p) => ({ ...p, [d.serial_number]: !p[d.serial_number] }))
                              }
                              expanded={!!expanded[d.serial_number]}
                            />
                          ))}

                        {currentData.filter((d) => d.status_class === s).length === 0 && (
                          <p className="text-sm text-slate-400">No items</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-10 border rounded">
              No projects match your search/filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
  Subcomponents
------------------------------------------------------------- */

function StatCard({ title, value }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusPill({ status_class }) {
  const map = {
    "Done": "bg-green-100 text-green-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    "On Hold": "bg-orange-100 text-orange-800",
    "Quotation": "bg-blue-100 text-blue-800",
    "Ordered": "bg-indigo-100 text-indigo-800",
    "Testing": "bg-purple-100 text-purple-800",
    "Unknown": "bg-slate-100 text-slate-700",
  };
  const cls = map[status_class] || "bg-slate-100 text-slate-700";
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${cls}`}>{status_class}</span>;
}

function MiniCard({ item, onToggle, expanded }) {
  return (
    <div className="bg-slate-50 border rounded-md p-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium">
            #{item.serial_number} —{" "}
            {item.description.length > 36 ? item.description.slice(0, 36) + "..." : item.description}
          </div>
          <div className="text-xs text-slate-500">
            Target: {item.completion_target}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <StatusPill status={item.status_class} />
          <button onClick={onToggle} className="text-xs text-sky-600 underline">
            {expanded ? "Hide" : "View"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 text-xs text-slate-600">
          <p>{item.remarks}</p>
        </div>
      )}
    </div>
  );
}
