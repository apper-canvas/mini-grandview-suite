import React from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data available", 
  message = "There's nothing to show right now",
  action,
  actionLabel = "Refresh",
  icon = "Database",
  className 
}) => {
  return (
    <Card className={`text-center py-12 ${className || ""}`} hover={false}>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
            <ApperIcon name={icon} className="h-10 w-10 text-slate-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="text-secondary max-w-md mx-auto">{message}</p>
        </div>
        
        {action && (
          <Button onClick={action} variant="primary" size="lg" className="gap-2">
            <ApperIcon name="Plus" size={16} />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Empty;