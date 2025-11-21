import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
  LabelList,
} from "recharts";

const data = [
  {
    month: "Apr-25",
    production: { target: 4290, actual: 4043 },
    sites: {
      Bobbili: {
        target: 1950,
        actual: 1739,
        production_achievement_percent: 89.18,
        dispatches: { target: 653, actual: 720 },
      },
      Bokaro: {
        target: 1248,
        actual: 1196,
        production_achievement_percent: 95.83,
        dispatches: { target: 783, actual: 130 },
      },
      Roopangarh: {
        target: 1092,
        actual: 1108,
        production_achievement_percent: 101.47,
        dispatches: { target: 827, actual: 226 },
      },
    },
    despatches: { group: 2263, outside: 1076 },
  },
  {
    month: "May-25",
    production: { target: 4290, actual: 4186 },
    sites: {
      Bobbili: {
        target: 1950,
        actual: 2025,
        production_achievement_percent: 103.85,
        dispatches: { target: 999, actual: 716 },
      },
      Bokaro: {
        target: 1248,
        actual: 1151,
        production_achievement_percent: 92.22,
        dispatches: { target: 872, actual: 277 },
      },
      Roopangarh: {
        target: 1092,
        actual: 1010,
        production_achievement_percent: 92.52,
        dispatches: { target: 697, actual: 147 },
      },
    },
    despatches: { group: 2568, outside: 1140 },
  },
  {
    month: "Jun-25",
    production: { target: 4125, actual: 3848 },
    sites: {
      Bobbili: {
        target: 1875,
        actual: 1800,
        production_achievement_percent: 96.0,
        dispatches: { target: 1143, actual: 699 },
      },
      Bokaro: {
        target: 1200,
        actual: 1079,
        production_achievement_percent: 89.92,
        dispatches: { target: 632, actual: 577 },
      },
      Roopangarh: {
        target: 1050,
        actual: 969,
        production_achievement_percent: 92.29,
        dispatches: { target: 645, actual: 543 },
      },
    },
    despatches: { group: 2420, outside: 1819 },
  },
  {
    month: "Jul-25",
    production: { target: 4455, actual: 4317 },
    sites: {
      Bobbili: {
        target: 2025,
        actual: 2081,
        production_achievement_percent: 102.77,
        dispatches: { target: 1205, actual: 1105 },
      },
      Bokaro: {
        target: 1296,
        actual: 1256,
        production_achievement_percent: 96.91,
        dispatches: { target: 871, actual: 418 },
      },
      Roopangarh: {
        target: 1134,
        actual: 980,
        production_achievement_percent: 86.41,
        dispatches: { target: 544, actual: 344 },
      },
    },
    despatches: { group: 2620, outside: 1867 },
  },
  {
    month: "Aug-25",
    production: { target: 4125, actual: 4306 },
    sites: {
      Bobbili: {
        target: 1875,
        actual: 2072,
        production_achievement_percent: 110.51,
        dispatches: { target: 1156, actual: 773 },
      },
      Bokaro: {
        target: 1200,
        actual: 1243,
        production_achievement_percent: 103.58,
        dispatches: { target: 943, actual: 398 },
      },
      Roopangarh: {
        target: 1050,
        actual: 991,
        production_achievement_percent: 94.38,
        dispatches: { target: 606, actual: 462 },
      },
    },
    despatches: { group: 2705, outside: 1633 },
  },
  {
    month: "Sep-25",
    production: { target: 4250, actual: 4380 },
    sites: {
      Bobbili: {
        target: 1990,
        actual: 2000,
        production_achievement_percent: 100.5,
        dispatches: { target: 1115, actual: 800 },
      },
      Bokaro: {
        target: 1290,
        actual: 1195,
        production_achievement_percent: 92.64,
        dispatches: { target: 754, actual: 423 },
      },
      Roopangarh: {
        target: 1060,
        actual: 1100,
        production_achievement_percent: 103.77,
        dispatches: { target: 720, actual: 515 },
      },
    },
    despatches: { group: 2400, outside: 1643 },
  },
];
const CustomTopLabel = ({ x, y, width, index, data }) => {
  const { group, outside } = data[index];
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fontSize={12}
      fontWeight="bold"
      fill="#000"
    >
      {group+outside}
    </text>
  );
};
export default function WiresBusinessDashboard() {
  const [selectedSite, setSelectedSite] = useState("Bobbili");
  const [selectedDispatchSite, setSelectedDispatchSite] = useState("Bobbili");

  const chartData = data.map((month) => ({
    month: month.month,
    target: month.sites[selectedSite].target,
    actual: month.sites[selectedSite].actual,
  }));

  const dispatchChartData = data.map((month) => ({
    month: month.month,
    outside: month.sites[selectedDispatchSite].dispatches.target,
    group: month.sites[selectedDispatchSite].dispatches.actual,
    total:
      month.sites[selectedDispatchSite].dispatches.target +
      month.sites[selectedDispatchSite].dispatches.actual,
  }));

  const achievementChartData = data.map((month) => ({
    month: month.month,
    Bobbili: month.sites.Bobbili.production_achievement_percent,
    Bokaro: month.sites.Bokaro.production_achievement_percent,
    Roopangarh: month.sites.Roopangarh.production_achievement_percent,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-amber-600">
          Wires Business Dashboard
        </h1>
      </header>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Production Insights
          </h2>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">Select Plant:</label>
            <select
              className="border rounded p-2"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              <option value="Bobbili">Bobbili</option>
              <option value="Bokaro">Bokaro</option>
              <option value="Roopangarh">Roopangarh</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="actual" fill="#10b981" name="Actual">
                <LabelList
                  dataKey="actual"
                  position="top"
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                />
              </Bar>
                            <Bar dataKey="target" fill="#f59e0b" name="Target">
                <LabelList
                  dataKey="target"
                  position="top"
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Dispatch Insights
          </h2>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">Select Site:</label>
            <select
              className="border rounded p-2"
              value={selectedDispatchSite}
              onChange={(e) => setSelectedDispatchSite(e.target.value)}
            >
              <option value="Bobbili">Bobbili</option>
              <option value="Bokaro">Bokaro</option>
              <option value="Roopangarh">Roopangarh</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border">
          <ResponsiveContainer width="100%" height={400}>
      <BarChart data={dispatchChartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis 
          ticks={[0, 600, 1200, 1800, 2400, 3000]}
        />

        <Tooltip
          formatter={(value, name) => [value, name.toUpperCase()]}
        />

        <Legend />

        {/* Stacked Bars */}
        <Bar dataKey="outside" stackId="dispatch" fill="#3b82f6" name="Group" />
        <Bar dataKey="group" stackId="dispatch" fill="#8b5cf6" name="Outside">
          <LabelList
            dataKey="total"
            content={(props) => (
              <CustomTopLabel {...props} data={dispatchChartData} />
            )}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
          <div className="mt-4 text-center text-sm text-gray-600">
            Stacked bars show Group + Outside dispatches for{" "}
            {selectedDispatchSite}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Production Target Achievement
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={achievementChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                domain={[0, 120]}
                ticks={[0, 20, 40, 60, 80, 100, 120]}
                label={{
                  value: "Achievement %",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Bobbili"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Bokaro"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Roopangarh"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
