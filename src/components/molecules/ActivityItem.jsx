import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { format } from "date-fns";
import { cn } from "@/utils/cn";

const ActivityItem = ({ activity }) => {
  if (!activity) return null;

  const getActivityIcon = (type) => {
    switch (type) {
      case "booking": return "Calendar";
      case "checkin": return "LogIn";
      case "checkout": return "LogOut";
      case "payment": return "CreditCard";
      case "maintenance": return "Wrench";
      case "housekeeping": return "Sparkles";
      default: return "Bell";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "booking": return "text-primary bg-primary/10";
      case "checkin": return "text-success bg-success/10";
      case "checkout": return "text-warning bg-warning/10";
      case "payment": return "text-accent bg-accent/10";
      case "maintenance": return "text-error bg-error/10";
      case "housekeeping": return "text-purple-600 bg-purple-100";
      default: return "text-secondary bg-secondary/10";
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "high": return "high";
      case "medium": return "medium";
      case "low": return "low";
      default: return "default";
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200">
      <div className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
        getActivityColor(activity.type)
      )}>
        <ApperIcon name={getActivityIcon(activity.type)} size={18} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <p className="text-sm text-slate-900 font-medium line-clamp-2">
            {activity.description}
          </p>
          {activity.priority && (
            <Badge variant={getPriorityVariant(activity.priority)} className="ml-2 flex-shrink-0">
              {activity.priority}
            </Badge>
          )}
        </div>
        <p className="text-xs text-secondary mt-1">
{activity.timestamp 
            ? format(new Date(activity.timestamp), "MMM dd, yyyy 'at' h:mm a")
            : 'Just now'
          }
        </p>
      </div>
    </div>
  );
};

export default ActivityItem;