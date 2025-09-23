import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { reportService } from "@/services/api/reportService";
import { toast } from "react-toastify";

const Reports = () => {
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [availableMetrics, setAvailableMetrics] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [draggedMetric, setDraggedMetric] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    department: '',
    status: '',
    priority: ''
  });

  useEffect(() => {
    loadAvailableMetrics();
  }, []);

  const loadAvailableMetrics = async () => {
    try {
      const metrics = await reportService.getAvailableMetrics();
      setAvailableMetrics(metrics);
    } catch (error) {
      toast.error('Failed to load available metrics');
    }
  };

  const handleDragStart = (e, metric) => {
    setDraggedMetric(metric);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedMetric && !selectedMetrics.find(m => m.key === draggedMetric.key)) {
      setSelectedMetrics(prev => [...prev, draggedMetric]);
    }
    setDraggedMetric(null);
  };

  const removeMetric = (metricKey) => {
    setSelectedMetrics(prev => prev.filter(m => m.key !== metricKey));
  };

  const generateReport = async () => {
    if (selectedMetrics.length === 0) {
      toast.warning('Please select at least one metric');
      return;
    }

    setIsLoading(true);
    try {
      const report = await reportService.generateCustomReport({
        metrics: selectedMetrics.map(m => m.key),
        dateRange,
        filters: filterOptions
      });
      setGeneratedReport(report);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error(`Failed to generate report: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format) => {
    if (!generatedReport) {
      toast.warning('Please generate a report first');
      return;
    }

    try {
      await reportService.exportReport(generatedReport, format);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  const loadTemplate = async (templateName) => {
    try {
      const template = await reportService.getReportTemplate(templateName);
      setSelectedMetrics(template.metrics);
      setFilterOptions(template.filters);
      setActiveTemplate(templateName);
      toast.success(`Template "${templateName}" loaded`);
    } catch (error) {
      toast.error('Failed to load template');
    }
  };

  const formatValue = (value, type) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(value);
    }
    if (type === 'percentage') {
      return `${value}%`;
    }
    return value;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 gradient-text mb-2">
          Report Builder
        </h1>
        <div className="flex items-center space-x-2 text-sm text-secondary">
          <ApperIcon name="Home" size={14} />
          <span>Dashboard</span>
          <ApperIcon name="ChevronRight" size={14} />
          <span className="text-slate-900 font-medium">Reports</span>
        </div>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Layout" className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">Quick Templates</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'financial-overview', label: 'Financial Overview', icon: 'DollarSign' },
              { name: 'operational-summary', label: 'Operations Summary', icon: 'Activity' },
              { name: 'staff-performance', label: 'Staff Performance', icon: 'Users' }
            ].map(template => (
              <Button
                key={template.name}
                variant={activeTemplate === template.name ? "default" : "outline"}
                className="h-16 flex flex-col items-center space-y-1"
                onClick={() => loadTemplate(template.name)}
              >
                <ApperIcon name={template.icon} size={20} />
                <span className="text-sm">{template.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Metrics */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ApperIcon name="Database" className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">Available Metrics</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(
              availableMetrics.reduce((groups, metric) => {
                const group = groups[metric.category] || [];
                group.push(metric);
                groups[metric.category] = group;
                return groups;
              }, {})
            ).map(([category, metrics]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700 uppercase tracking-wide">
                  {category}
                </h4>
                <div className="space-y-1">
                  {metrics.map(metric => (
                    <div
                      key={metric.key}
                      draggable
                      onDragStart={(e) => handleDragStart(e, metric)}
                      className="flex items-center p-2 bg-slate-50 rounded-lg cursor-grab hover:bg-slate-100 transition-colors"
                    >
                      <ApperIcon name={metric.icon} size={16} className="mr-2 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">{metric.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Report Builder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ApperIcon name="BarChart3" className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-slate-900">Report Builder</h3>
              </div>
              <div className="flex items-center space-x-2">
                {generatedReport && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReport('pdf')}
                    >
                      <ApperIcon name="FileText" size={16} className="mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReport('csv')}
                    >
                      <ApperIcon name="Download" size={16} className="mr-1" />
                      CSV
                    </Button>
                  </>
                )}
                <Button
                  onClick={generateReport}
                  disabled={isLoading || selectedMetrics.length === 0}
                >
                  {isLoading ? (
                    <>
                      <ApperIcon name="Loader2" size={16} className="mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Play" size={16} className="mr-1" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Selected Metrics Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`min-h-32 p-4 border-2 border-dashed rounded-lg transition-colors ${
                selectedMetrics.length === 0
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-primary/20 bg-primary/5'
              }`}
            >
              {selectedMetrics.length === 0 ? (
                <div className="text-center text-slate-500">
                  <ApperIcon name="Target" size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Drag metrics here to build your report</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900 mb-3">Selected Metrics</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMetrics.map(metric => (
                      <div
                        key={metric.key}
                        className="flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        <ApperIcon name={metric.icon} size={14} className="mr-1" />
                        <span>{metric.label}</span>
                        <button
                          onClick={() => removeMetric(metric.key)}
                          className="ml-2 hover:text-error"
                        >
                          <ApperIcon name="X" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generated Report Display */}
            {generatedReport && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Generated Report</h4>
                  <span className="text-sm text-slate-500">
                    Generated on {new Date(generatedReport.generatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Report Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedReport.summary.map(item => (
                    <div key={item.key} className="p-4 bg-white border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">{item.label}</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {formatValue(item.value, item.type)}
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg ${
                          item.trend === 'up' ? 'bg-success/10' : 
                          item.trend === 'down' ? 'bg-error/10' : 'bg-slate-100'
                        }`}>
                          <ApperIcon
                            name={item.trend === 'up' ? 'TrendingUp' : 
                                 item.trend === 'down' ? 'TrendingDown' : 'Minus'}
                            size={20}
                            className={
                              item.trend === 'up' ? 'text-success' : 
                              item.trend === 'down' ? 'text-error' : 'text-slate-500'
                            }
                          />
                        </div>
                      </div>
                      {item.change && (
                        <p className={`text-sm mt-1 ${
                          item.trend === 'up' ? 'text-success' : 
                          item.trend === 'down' ? 'text-error' : 'text-slate-500'
                        }`}>
                          {item.change > 0 ? '+' : ''}{item.change}% from previous period
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Detailed Data Table */}
                {generatedReport.details.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <h5 className="font-medium text-slate-900">Detailed Breakdown</h5>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            {Object.keys(generatedReport.details[0]).map(header => (
                              <th key={header} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                {header.replace(/([A-Z])/g, ' $1').trim()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {generatedReport.details.slice(0, 10).map((row, index) => (
                            <tr key={index} className="hover:bg-slate-50">
                              {Object.values(row).map((value, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-3 text-sm text-slate-900">
                                  {typeof value === 'number' && value > 1000 
                                    ? value.toLocaleString() 
                                    : value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {generatedReport.details.length > 10 && (
                      <div className="px-4 py-3 bg-slate-50 text-center text-sm text-slate-500">
                        Showing 10 of {generatedReport.details.length} records. Export for complete data.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;