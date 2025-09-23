import React from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const Payments = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 gradient-text mb-2">
          Payment Management
        </h1>
        <div className="flex items-center space-x-2 text-sm text-secondary">
          <ApperIcon name="Home" size={14} />
          <span>Dashboard</span>
          <ApperIcon name="ChevronRight" size={14} />
          <span className="text-slate-900 font-medium">Payments</span>
        </div>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ApperIcon name="CreditCard" className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Billing & Payments</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-primary/10 to-blue-100 flex items-center justify-center mb-4">
              <ApperIcon name="CreditCard" className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Payment System Coming Soon</h3>
            <p className="text-secondary max-w-md mx-auto">
              Complete billing and payment processing interface with transaction history, refunds, and financial reporting.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;