import kpiMetricsData from "@/services/mockData/kpiMetrics.json";
import activitiesData from "@/services/mockData/activities.json";
import notificationsData from "@/services/mockData/notifications.json";
import chartDataJson from "@/services/mockData/chartData.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate realistic fluctuations for real-time data
const generateFluctuation = (baseValue, percentage = 0.1) => {
  const fluctuation = (Math.random() - 0.5) * 2 * percentage;
  return Math.max(0, baseValue * (1 + fluctuation));
};

export const dashboardService = {
  // Get all KPI metrics with real-time updates
  async getKPIMetrics() {
    await delay(300);
    
    return kpiMetricsData.map(metric => ({
      ...metric,
      value: metric.unit === "%" || metric.unit === "rating" 
        ? parseFloat(generateFluctuation(metric.value, 0.05).toFixed(1))
        : Math.round(generateFluctuation(metric.value, 0.08)),
      lastUpdated: new Date().toISOString()
    }));
  },

  // Get recent activities
  async getActivities() {
    await delay(200);
    
    // Sort by timestamp descending and return copy
    return [...activitiesData].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },

  // Get notifications
  async getNotifications() {
    await delay(250);
    
    // Sort by timestamp descending and return copy
    return [...notificationsData].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },

  // Get chart data for revenue
  async getChartData() {
    await delay(350);
    
    // Add slight variations to make it feel more real-time
    const updatedChartData = { ...chartDataJson };
    
    // Update the last data point in daily chart with slight variation
    const dailyData = [...updatedChartData.daily.data];
    const lastDayIndex = dailyData.length - 1;
    dailyData[lastDayIndex] = {
      ...dailyData[lastDayIndex],
      value: Math.round(generateFluctuation(dailyData[lastDayIndex].value, 0.05))
    };
    
    updatedChartData.daily = {
      ...updatedChartData.daily,
      data: dailyData,
      total: dailyData.reduce((sum, item) => sum + item.value, 0)
    };
    
    return updatedChartData;
  },

  // Dismiss notification
  async dismissNotification(notificationId) {
    await delay(150);
    
    const notification = notificationsData.find(n => n.Id === notificationId);
    if (notification) {
      notification.read = true;
    }
    
    return { success: true };
  },

  // Get dashboard overview (combined data)
  async getDashboardOverview() {
    await delay(400);
    
    const [kpiMetrics, activities, notifications, chartData] = await Promise.all([
      this.getKPIMetrics(),
      this.getActivities(),
      this.getNotifications(),
      this.getChartData()
    ]);
    
    return {
      kpiMetrics,
      activities: activities.slice(0, 10), // Only recent activities
      notifications: notifications.slice(0, 8), // Only recent notifications
      chartData,
      lastUpdated: new Date().toISOString()
    };
  }
};