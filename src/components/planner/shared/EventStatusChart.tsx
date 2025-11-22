"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface EventStatusChartProps {
  data: {
    draft: number;
    planning: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

export default function EventStatusChart({ data }: EventStatusChartProps) {
  // Handle undefined or null data
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Event Status Distribution
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Loading event data...
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Draft", value: data.draft, color: "#9CA3AF" },
    { name: "Planning", value: data.planning, color: "#3B82F6" },
    { name: "Confirmed", value: data.confirmed, color: "#10B981" },
    { name: "In Progress", value: data.inProgress, color: "#F59E0B" },
    { name: "Completed", value: data.completed, color: "#8B5CF6" },
    { name: "Cancelled", value: data.cancelled, color: "#EF4444" },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Event Status Distribution
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No events to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Event Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
