import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  loading?: boolean;
}

export default function MetricCard({
  title,
  value,
  change,
  trend = "neutral",
  icon,
  loading = false,
}: MetricCardProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-600";
  };

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-4 h-4" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>

        {change !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
