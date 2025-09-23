import React from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const Maintenance = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 gradient-text mb-2">
          Maintenance Management
        </h1>
        <div className="flex items-center space-x-2 text-sm text-secondary">
          <ApperIcon name="Home" size={14} />
          <span>Dashboard</span>
          <ApperIcon name="ChevronRight" size={14} />
          <span className="text-slate-900 font-medium">Maintenance</span>
        </div>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ApperIcon name="Wrench" className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Work Order System</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-primary/10 to-blue-100 flex items-center justify-center mb-4">
              <ApperIcon name="Wrench" className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Maintenance System Coming Soon</h3>
            <p className="text-secondary max-w-md mx-auto">
              Work order tracking and scheduling system with maintenance requests, asset management, and service history.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;