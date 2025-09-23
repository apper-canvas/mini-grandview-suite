import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { format } from "date-fns";
import { cn } from "@/utils/cn";

const NotificationItem = ({ notification, onDismiss }) => {
  if (!notification) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "border-l-error bg-error/5";
      case "medium": return "border-l-warning bg-warning/5";
      case "low": return "border-l-success bg-success/5";
      default: return "border-l-info bg-info/5";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high": return "AlertTriangle";
      case "medium": return "Clock";
      case "low": return "Info";
      default: return "Bell";
    }
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border-l-4 transition-all duration-200",
      getPriorityColor(notification.priority),
      !notification.read && "shadow-sm"
    )}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <ApperIcon 
            name={getPriorityIcon(notification.priority)} 
            size={18} 
            className="text-slate-600"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className={cn(
              "text-sm leading-relaxed",
              !notification.read ? "font-medium text-slate-900" : "text-slate-700"
            )}>
              {notification.message}
            </p>
            
            <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
              <Badge variant={notification.priority || "default"} className="text-xs">
                {notification.priority || "info"}
              </Badge>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(notification.Id)}
                  className="h-6 w-6 p-0 hover:bg-slate-200"
                >
                  <ApperIcon name="X" size={12} />
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-xs text-secondary mt-1">
            {format(new Date(notification.timestamp), "MMM dd, yyyy 'at' h:mm a")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;