import React from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";

const Loading = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} hover={false}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-2/3"></div>
                <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2"></div>
                <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Loading */}
      <Card hover={false}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/4"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-16"></div>
              ))}
            </div>
            <div className="h-80 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover={false}>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/3"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse flex space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications Loading */}
        <Card hover={false}>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/3"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse flex space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-5/6"></div>
                    <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Loading;