import { dashboardService } from './dashboardService';
import { toast } from 'react-toastify';

// Delay function for realistic API simulation
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ReportService {
  constructor() {
    this.availableMetrics = [
      // Revenue & Financial Metrics
      { key: 'total_revenue', label: 'Total Revenue', category: 'financial', icon: 'DollarSign', type: 'currency' },
      { key: 'daily_revenue', label: 'Daily Revenue', category: 'financial', icon: 'TrendingUp', type: 'currency' },
      { key: 'payment_methods', label: 'Payment Methods', category: 'financial', icon: 'CreditCard', type: 'count' },
      
      // Occupancy & Rooms
      { key: 'occupancy_rate', label: 'Occupancy Rate', category: 'operations', icon: 'Home', type: 'percentage' },
      { key: 'available_rooms', label: 'Available Rooms', category: 'operations', icon: 'Key', type: 'count' },
      { key: 'room_revenue', label: 'Room Revenue', category: 'operations', icon: 'Building', type: 'currency' },
      
      // Staff & Performance
      { key: 'staff_performance', label: 'Staff Performance', category: 'staff', icon: 'Users', type: 'percentage' },
      { key: 'staff_hours', label: 'Total Staff Hours', category: 'staff', icon: 'Clock', type: 'count' },
      { key: 'department_efficiency', label: 'Department Efficiency', category: 'staff', icon: 'Activity', type: 'percentage' },
      
      // Maintenance & Operations
      { key: 'maintenance_requests', label: 'Maintenance Requests', category: 'maintenance', icon: 'Wrench', type: 'count' },
      { key: 'completion_rate', label: 'Completion Rate', category: 'maintenance', icon: 'CheckCircle', type: 'percentage' },
      { key: 'equipment_status', label: 'Equipment Status', category: 'maintenance', icon: 'Settings', type: 'count' },
      
      // Guest & Bookings
      { key: 'total_bookings', label: 'Total Bookings', category: 'bookings', icon: 'Calendar', type: 'count' },
      { key: 'guest_satisfaction', label: 'Guest Satisfaction', category: 'bookings', icon: 'Star', type: 'percentage' },
      { key: 'booking_trends', label: 'Booking Trends', category: 'bookings', icon: 'BarChart', type: 'count' }
    ];

    this.reportTemplates = {
      'financial-overview': {
        name: 'Financial Overview',
        metrics: [
          { key: 'total_revenue', label: 'Total Revenue', category: 'financial', icon: 'DollarSign', type: 'currency' },
          { key: 'daily_revenue', label: 'Daily Revenue', category: 'financial', icon: 'TrendingUp', type: 'currency' },
          { key: 'payment_methods', label: 'Payment Methods', category: 'financial', icon: 'CreditCard', type: 'count' },
          { key: 'room_revenue', label: 'Room Revenue', category: 'operations', icon: 'Building', type: 'currency' }
        ],
        filters: { department: '', status: '', priority: '' }
      },
      'operational-summary': {
        name: 'Operations Summary',
        metrics: [
          { key: 'occupancy_rate', label: 'Occupancy Rate', category: 'operations', icon: 'Home', type: 'percentage' },
          { key: 'available_rooms', label: 'Available Rooms', category: 'operations', icon: 'Key', type: 'count' },
          { key: 'maintenance_requests', label: 'Maintenance Requests', category: 'maintenance', icon: 'Wrench', type: 'count' },
          { key: 'total_bookings', label: 'Total Bookings', category: 'bookings', icon: 'Calendar', type: 'count' }
        ],
        filters: { department: '', status: '', priority: '' }
      },
      'staff-performance': {
        name: 'Staff Performance',
        metrics: [
          { key: 'staff_performance', label: 'Staff Performance', category: 'staff', icon: 'Users', type: 'percentage' },
          { key: 'staff_hours', label: 'Total Staff Hours', category: 'staff', icon: 'Clock', type: 'count' },
          { key: 'department_efficiency', label: 'Department Efficiency', category: 'staff', icon: 'Activity', type: 'percentage' },
          { key: 'completion_rate', label: 'Completion Rate', category: 'maintenance', icon: 'CheckCircle', type: 'percentage' }
        ],
        filters: { department: '', status: '', priority: '' }
      }
    };
  }

  async getAvailableMetrics() {
    await delay(200);
    return [...this.availableMetrics];
  }

  async getReportTemplate(templateName) {
    await delay(150);
    
    const template = this.reportTemplates[templateName];
    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }
    
    return { ...template };
  }

  async generateCustomReport({ metrics, dateRange, filters = {} }) {
    await delay(1000); // Simulate complex data processing
    
    try {
      // Get aggregated data from dashboard service
      const reportData = await dashboardService.getReportData(metrics, dateRange, filters);
      const detailedData = await dashboardService.getDetailedReportData(metrics, dateRange, filters);
      
      // Generate summary metrics
      const summary = metrics.map(metricKey => {
        const metric = this.availableMetrics.find(m => m.key === metricKey);
        const value = reportData[metricKey] || this.generateMockValue(metric?.type);
        
        return {
          key: metricKey,
          label: metric?.label || metricKey,
          value: value,
          type: metric?.type || 'count',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          change: Math.floor(Math.random() * 20) - 10 // -10 to +10
        };
      });

      // Generate detailed breakdown
      const details = detailedData.length > 0 ? detailedData : this.generateMockDetailedData(metrics);

      return {
        id: Date.now(),
        name: `Custom Report - ${new Date().toLocaleDateString()}`,
        generatedAt: new Date().toISOString(),
        dateRange,
        filters,
        selectedMetrics: metrics,
        summary,
        details,
        totalRecords: details.length
      };
    } catch (error) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  generateMockValue(type) {
    switch (type) {
      case 'currency':
        return Math.floor(Math.random() * 100000) + 10000;
      case 'percentage':
        return Math.floor(Math.random() * 100);
      case 'count':
        return Math.floor(Math.random() * 1000) + 50;
      default:
        return Math.floor(Math.random() * 500);
    }
  }

  generateMockDetailedData(metrics) {
    const mockData = [];
    const recordCount = Math.floor(Math.random() * 50) + 20;
    
    for (let i = 0; i < recordCount; i++) {
      const record = {
        id: i + 1,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: ['Financial', 'Operations', 'Staff', 'Maintenance', 'Bookings'][Math.floor(Math.random() * 5)],
        value: Math.floor(Math.random() * 10000) + 100,
        status: ['Active', 'Completed', 'Pending', 'In Progress'][Math.floor(Math.random() * 4)],
        department: ['Front Desk', 'Housekeeping', 'Maintenance', 'Management'][Math.floor(Math.random() * 4)]
      };
      
      // Add metric-specific fields
      if (metrics.includes('total_revenue') || metrics.includes('daily_revenue')) {
        record.amount = Math.floor(Math.random() * 5000) + 100;
        record.paymentMethod = ['Credit Card', 'Cash', 'Bank Transfer'][Math.floor(Math.random() * 3)];
      }
      
      if (metrics.includes('occupancy_rate')) {
        record.roomNumber = Math.floor(Math.random() * 300) + 100;
        record.guestName = `Guest ${i + 1}`;
      }
      
      if (metrics.includes('staff_performance')) {
        record.staffName = `Staff Member ${i + 1}`;
        record.performance = Math.floor(Math.random() * 40) + 60;
      }
      
      mockData.push(record);
    }
    
    return mockData;
  }

  async exportReport(report, format) {
    await delay(800); // Simulate export processing
    
    try {
      if (format === 'pdf') {
        // Simulate PDF generation
        const pdfContent = this.generatePDFContent(report);
        this.downloadFile(pdfContent, `${report.name}.pdf`, 'application/pdf');
      } else if (format === 'csv') {
        // Generate CSV content
        const csvContent = this.generateCSVContent(report);
        this.downloadFile(csvContent, `${report.name}.csv`, 'text/csv');
      } else {
        throw new Error(`Export format "${format}" not supported`);
      }
      
      return true;
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  generateCSVContent(report) {
    if (report.details.length === 0) {
      return 'No data available for export';
    }
    
    // Generate CSV headers
    const headers = Object.keys(report.details[0]);
    const csvRows = [headers.join(',')];
    
    // Add data rows
    report.details.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }

  generatePDFContent(report) {
    // In a real implementation, this would generate actual PDF content
    // For this demo, we'll simulate PDF content as text
    let content = `HOTEL MANAGEMENT REPORT\n`;
    content += `Report: ${report.name}\n`;
    content += `Generated: ${new Date(report.generatedAt).toLocaleDateString()}\n`;
    content += `Date Range: ${report.dateRange.startDate} to ${report.dateRange.endDate}\n\n`;
    
    content += `SUMMARY\n`;
    content += `--------\n`;
    report.summary.forEach(item => {
      content += `${item.label}: ${item.value}\n`;
    });
    
    content += `\nDETAILS\n`;
    content += `-------\n`;
    if (report.details.length > 0) {
      const headers = Object.keys(report.details[0]);
      content += headers.join('\t') + '\n';
      report.details.forEach(row => {
        content += Object.values(row).join('\t') + '\n';
      });
    }
    
    return content;
  }

  downloadFile(content, filename, mimeType) {
    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }

  async getReportHistory() {
    await delay(300);
    
    // In a real implementation, this would fetch from storage
    return [
      {
        id: 1,
        name: 'Financial Overview - January',
        generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        metrics: ['total_revenue', 'daily_revenue', 'payment_methods'],
        status: 'completed'
      },
      {
        id: 2,
        name: 'Operations Summary - Week 3',
        generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        metrics: ['occupancy_rate', 'maintenance_requests', 'total_bookings'],
        status: 'completed'
      }
    ];
  }

  async deleteReport(reportId) {
    await delay(200);
    
    // In a real implementation, this would delete from storage
    toast.success('Report deleted successfully');
    return true;
  }
}

export const reportService = new ReportService();
export default reportService;