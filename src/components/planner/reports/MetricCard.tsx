"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: number;
  previousValue?: string | number;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange";
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trend,
  previousValue,
  icon,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  const trendColor = trend && trend > 0 ? "text-green-600" : "text-red-600";
  const TrendIcon = trend && trend > 0 ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>

          {trend !== undefined && (
            <div className="mt-2 flex items-center">
              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
              <span className={`ml-1 text-sm font-medium ${trendColor}`}>
                {Math.abs(trend)}%
              </span>
              {previousValue && (
                <span className="ml-2 text-sm text-gray-500">
                  vs {previousValue}
                </span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
