import React from "react";
import ApperIcon from "@/components/ApperIcon";
import RefreshIndicator from "@/components/molecules/RefreshIndicator";
import { format } from "date-fns";

const DashboardHeader = ({ lastUpdated, isRefreshing }) => {
  const currentDate = new Date();

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 gradient-text">
            Hotel Dashboard
          </h1>
          <div className="flex items-center space-x-2 mt-2">
<ApperIcon name="Calendar" size={16} className="text-secondary" />
            <span className="text-secondary">
              {currentDate && !isNaN(currentDate)
                ? format(currentDate, "EEEE, MMMM dd, yyyy")
                : format(new Date(), "EEEE, MMMM dd, yyyy")
              }
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <RefreshIndicator 
            lastUpdated={lastUpdated} 
            isRefreshing={isRefreshing}
            autoRefresh={true}
          />
        </div>
      </div>
      
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 mt-4 text-sm text-secondary">
        <ApperIcon name="Home" size={14} />
        <span>Dashboard</span>
        <ApperIcon name="ChevronRight" size={14} />
        <span className="text-slate-900 font-medium">Overview</span>
      </div>
    </div>
  );
};

export default DashboardHeader;