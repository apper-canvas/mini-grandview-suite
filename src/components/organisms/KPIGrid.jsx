import React from "react";
import KPICard from "@/components/molecules/KPICard";

const KPIGrid = ({ metrics, isLoading }) => {
  if (isLoading || !metrics || metrics.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => (
        <KPICard key={metric.Id} metric={metric} />
      ))}
    </div>
  );
};

export default KPIGrid;