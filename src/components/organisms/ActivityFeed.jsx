import React from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import ActivityItem from "@/components/molecules/ActivityItem";
import ApperIcon from "@/components/ApperIcon";
import Empty from "@/components/ui/Empty";

const ActivityFeed = ({ activities, isLoading }) => {
  if (isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <ApperIcon name="Activity" className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
        </div>
        <span className="text-sm text-secondary">
          {activities?.length || 0} recent items
        </span>
      </CardHeader>
      
      <CardContent className="p-0">
        {!activities || activities.length === 0 ? (
          <div className="p-6">
            <Empty 
              title="No recent activity"
              message="Recent hotel activities will appear here"
              icon="Activity"
            />
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {activities.slice(0, 10).map((activity) => (
                <ActivityItem key={activity.Id} activity={activity} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;