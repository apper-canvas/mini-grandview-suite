import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import NotificationItem from "@/components/molecules/NotificationItem";
import ApperIcon from "@/components/ApperIcon";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";

const NotificationsPanel = ({ notifications, isLoading, onDismissNotification }) => {
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return null;
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const displayNotifications = showAll 
    ? notifications 
    : notifications?.slice(0, 5) || [];

  const handleDismiss = (notificationId) => {
    if (onDismissNotification) {
      onDismissNotification(notificationId);
      toast.success("Notification dismissed");
    }
  };

  const handleClearAll = () => {
    if (notifications && notifications.length > 0) {
      notifications.forEach(n => {
        if (onDismissNotification) {
          onDismissNotification(n.Id);
        }
      });
      toast.success("All notifications cleared");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <ApperIcon name="Bell" className="h-5 w-5 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 h-4 w-4 bg-error text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {notifications && notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {!notifications || notifications.length === 0 ? (
          <div className="p-6">
            <Empty 
              title="No notifications"
              message="You're all caught up! New notifications will appear here."
              icon="Bell"
            />
          </div>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto p-4 space-y-3">
              {displayNotifications.map((notification) => (
                <NotificationItem 
                  key={notification.Id} 
                  notification={notification}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
            
            {notifications.length > 5 && (
              <div className="p-4 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full gap-2"
                >
                  {showAll ? "Show Less" : `Show ${notifications.length - 5} More`}
                  <ApperIcon 
                    name={showAll ? "ChevronUp" : "ChevronDown"} 
                    size={14} 
                  />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;