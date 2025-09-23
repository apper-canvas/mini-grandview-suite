import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import KPIGrid from "@/components/organisms/KPIGrid";
import RevenueChart from "@/components/organisms/RevenueChart";
import ActivityFeed from "@/components/organisms/ActivityFeed";
import NotificationsPanel from "@/components/organisms/NotificationsPanel";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { dashboardService } from "@/services/api/dashboardService";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    kpiMetrics: [],
    activities: [],
    notifications: [],
    chartData: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const data = await dashboardService.getDashboardOverview();
      
      setDashboardData(data);
      setLastUpdated(new Date());
      
      if (showRefreshing) {
        toast.success("Dashboard data refreshed");
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      
      if (showRefreshing) {
        toast.error("Failed to refresh dashboard data");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDismissNotification = async (notificationId) => {
    try {
      await dashboardService.dismissNotification(notificationId);
      
      setDashboardData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.Id === notificationId ? { ...n, read: true } : n
        )
      }));
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
      toast.error("Failed to dismiss notification");
    }
  };

  const handleRetry = () => {
    loadDashboardData(false);
  };

  // Initial load
  useEffect(() => {
    loadDashboardData(false);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isRefreshing) {
        loadDashboardData(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, isRefreshing]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/3"></div>
          </div>
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <DashboardHeader lastUpdated={lastUpdated} isRefreshing={isRefreshing} />
        <Error message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        lastUpdated={lastUpdated} 
        isRefreshing={isRefreshing}
      />

      <KPIGrid 
        metrics={dashboardData.kpiMetrics} 
        isLoading={loading}
      />

      <RevenueChart 
        chartData={dashboardData.chartData} 
        isLoading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed 
          activities={dashboardData.activities} 
          isLoading={loading}
        />
        
        <NotificationsPanel 
          notifications={dashboardData.notifications} 
          isLoading={loading}
          onDismissNotification={handleDismissNotification}
        />
      </div>
    </div>
  );
};

export default Dashboard;