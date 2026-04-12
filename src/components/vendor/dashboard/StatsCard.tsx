import { LucideIcon } from "lucide-react";
import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon | React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color?: "purple" | "green" | "blue" | "yellow";
  loading?: boolean;
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  color = "purple",
  loading = false,
  subtitle,
}: StatsCardProps) {
  const colorClasses = {
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  const trendColorClasses = {
    up: "text-green-600",
    down: "text-red-600",
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="w-12 h-4 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
          <div className="w-16 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {React.isValidElement(icon)
            ? icon
            : React.createElement(icon as LucideIcon, { className: "w-6 h-6" })}
        </div>
        {trend && (
          <div
            className={`text-sm font-medium ${
              trendColorClasses[trend.direction]
            }`}
          >
            {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
