import React from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const KPICard = ({ metric, className }) => {
  if (!metric) return null;

  const getTrendColor = (trend) => {
    if (trend > 0) return "text-success";
    if (trend < 0) return "text-error";
    return "text-secondary";
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return "TrendingUp";
    if (trend < 0) return "TrendingDown";
    return "Minus";
  };

  const formatValue = (value, unit) => {
    if (unit === "%") return `${value}%`;
    if (unit === "$") return `$${value.toLocaleString()}`;
    if (unit === "rating") return `${value}/5.0`;
    return value.toLocaleString();
  };

  return (
    <Card className={cn("border-l-4 border-primary/30 card-hover", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-secondary uppercase tracking-wide">
                {metric.title}
              </p>
              <div className="mt-2">
                <span className="text-3xl font-bold gradient-text">
                  {formatValue(metric.value, metric.unit)}
                </span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary/10 to-blue-100 flex items-center justify-center">
              <ApperIcon name="BarChart3" className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center space-x-1 text-sm font-medium",
              getTrendColor(metric.trend)
            )}>
              <ApperIcon name={getTrendIcon(metric.trend)} size={16} />
              <span>{Math.abs(metric.trend)}%</span>
            </div>
            <span className="text-sm text-secondary">
              {metric.comparison}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;