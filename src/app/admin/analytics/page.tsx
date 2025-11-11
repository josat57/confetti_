"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Example stat type
interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function AnalyticsPage() {
  // Example stats (replace with real API data as needed)
  const [stats, setStats] = useState<Stat[]>([
    {
      label: "Total Users",
      value: 1247,
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active Users",
      value: 892,
      icon: <Activity className="w-6 h-6" />,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Revenue",
      value: "$125,000",
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "User Growth",
      value: "+8.2%",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-600",
    },
  ]);

  // Example chart data (replace with real chart library and data)
  const [chartData] = useState([
    { month: "Jan", users: 200, revenue: 10000 },
    { month: "Feb", users: 300, revenue: 15000 },
    { month: "Mar", users: 400, revenue: 20000 },
    { month: "Apr", users: 500, revenue: 25000 },
    { month: "May", users: 600, revenue: 30000 },
    { month: "Jun", users: 700, revenue: 35000 },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <BarChart3 className="w-4 h-4 mr-1" /> Analytics
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-6 flex items-center"
          >
            <div className={`p-3 rounded-full ${stat.color}`}>{stat.icon}</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section using recharts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth & Revenue (Last 6 Months)</h2>
        <div className="w-full h-72 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="users" fill="#8884d8" name="Users" />
              <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-6 gap-4 text-xs text-gray-500">
          {chartData.map((data) => (
            <div key={data.month} className="flex flex-col items-center">
              <span className="font-semibold text-gray-700">{data.month}</span>
              <span>Users: {data.users}</span>
              <span>Revenue: ${data.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity (placeholder) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Analytics Activity</h2>
        <ul className="space-y-2">
          <li className="text-sm text-gray-700">- 50 new users signed up this week</li>
          <li className="text-sm text-gray-700">- Revenue increased by 12% compared to last month</li>
          <li className="text-sm text-gray-700">- 3 vendors upgraded their plans</li>
        </ul>
      </div>
    </div>
  );
} 