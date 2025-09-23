import React from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry, className }) => {
  return (
    <Card className={`text-center py-12 ${className || ""}`} hover={false}>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-error/10 to-red-100 flex items-center justify-center">
            <ApperIcon name="AlertTriangle" className="h-10 w-10 text-error" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">Oops! Something went wrong</h3>
          <p className="text-secondary max-w-md mx-auto">{message}</p>
        </div>
        
        {onRetry && (
          <Button onClick={onRetry} variant="primary" size="lg" className="gap-2">
            <ApperIcon name="RotateCcw" size={16} />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Error;