import React from "react";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";
import { cn } from "@/utils/cn";

const RefreshIndicator = ({ lastUpdated, isRefreshing = false, autoRefresh = true }) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-secondary">
      <div className="flex items-center space-x-1">
        <ApperIcon 
          name="RefreshCw" 
          size={14} 
          className={cn(
            "transition-transform duration-300",
            isRefreshing && "animate-spin"
          )}
        />
        <span className="text-xs">
          Last updated: {format(lastUpdated, "h:mm:ss a")}
        </span>
      </div>
      
      {autoRefresh && (
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs">Live</span>
        </div>
      )}
    </div>
  );
};

export default RefreshIndicator;