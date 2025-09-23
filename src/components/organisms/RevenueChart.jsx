import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Chart from "react-apexcharts";

const RevenueChart = ({ chartData, isLoading }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("daily");

  const chartOptions = useMemo(() => ({
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
      fontFamily: "Inter, system-ui, sans-serif",
      foreColor: "#64748b"
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#1e40af"]
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        colorStops: [
          { offset: 0, color: "#1e40af", opacity: 0.3 },
          { offset: 100, color: "#1e40af", opacity: 0.05 }
        ]
      }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#e2e8f0",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: { fontSize: "12px" },
        datetimeUTC: false
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value.toLocaleString()}`,
        style: { fontSize: "12px" }
      }
    },
    tooltip: {
      theme: "light",
      x: { format: "dd MMM yyyy" },
      y: { formatter: (value) => `$${value.toLocaleString()}` },
      style: { fontSize: "12px" }
    },
    colors: ["#1e40af"]
  }), []);

  const periods = [
    { key: "daily", label: "Daily", icon: "Calendar" },
    { key: "weekly", label: "Weekly", icon: "CalendarDays" },
    { key: "monthly", label: "Monthly", icon: "CalendarRange" }
  ];

  if (isLoading || !chartData) {
    return null;
  }

  const currentData = chartData[selectedPeriod] || chartData.daily;
  
  const series = [{
    name: "Revenue",
    data: currentData.data.map(item => ({
      x: new Date(item.date).getTime(),
      y: item.value
    }))
  }];

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Revenue Overview</h3>
          <p className="text-sm text-secondary mt-1">
            Total: <span className="font-medium gradient-text">${currentData.total.toLocaleString()}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {periods.map((period) => (
            <Button
              key={period.key}
              variant={selectedPeriod === period.key ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period.key)}
              className="gap-2"
            >
              <ApperIcon name={period.icon} size={14} />
              {period.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <Chart
          options={chartOptions}
          series={series}
          type="area"
          height={350}
        />
      </CardContent>
    </Card>
  );
};

export default RevenueChart;