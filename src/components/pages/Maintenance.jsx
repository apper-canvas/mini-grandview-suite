import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";
import maintenanceService from "@/services/api/maintenanceService";

const Maintenance = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, statsData] = await Promise.all([
        maintenanceService.getAllWorkOrders(),
        maintenanceService.getMaintenanceStats()
      ]);
      setWorkOrders(ordersData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await maintenanceService.updateWorkOrderStatus(orderId, newStatus);
      loadData(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  const getFilteredOrders = () => {
    if (selectedFilter === 'all') return workOrders;
    return workOrders.filter(order => order.status === selectedFilter);
  };

  // Helper functions for styling
  // Helper functions for styling
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'on_hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return 'AlertCircle';
      case 'in_progress': return 'Wrench';
      case 'completed': return 'CheckCircle';
      case 'on_hold': return 'Pause';
      default: return 'Circle';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
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
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
            <ApperIcon name="Plus" size={16} />
            <span>New Work Order</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary mb-1">Active Orders</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ApperIcon name="Wrench" className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary mb-1">High Priority</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.highPriority}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <ApperIcon name="AlertTriangle" className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary mb-1">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <ApperIcon name="CheckCircle" className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary mb-1">Avg. Completion</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.avgCompletionTime}h</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <ApperIcon name="Clock" className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'all', label: 'All Orders', count: workOrders.length },
              { key: 'open', label: 'Open', count: stats?.open || 0 },
              { key: 'in_progress', label: 'In Progress', count: stats?.inProgress || 0 },
              { key: 'on_hold', label: 'On Hold', count: stats?.onHold || 0 },
              { key: 'completed', label: 'Completed', count: stats?.completed || 0 }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedFilter === filter.key
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Work Orders List */}
          <div className="space-y-4">
            {getFilteredOrders().length === 0 ? (
              <div className="text-center py-12">
                <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-primary/10 to-blue-100 flex items-center justify-center mb-4">
                  <ApperIcon name="Wrench" className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Work Orders Found</h3>
                <p className="text-secondary max-w-md mx-auto mb-6">
                  {selectedFilter === 'all' 
                    ? 'Start by creating your first work order to track maintenance tasks.'
                    : `No work orders match the "${selectedFilter}" status filter.`}
                </p>
                {selectedFilter === 'all' && (
                  <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 mx-auto">
                    <ApperIcon name="Plus" size={16} />
                    <span>Create First Work Order</span>
                  </Button>
                )}
              </div>
            ) : (
              getFilteredOrders().map((order) => (
                <Card key={order.Id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <ApperIcon name={getStatusIcon(order.status)} className="h-5 w-5 text-slate-600" />
                          <h3 className="text-lg font-semibold text-slate-900">{order.title}</h3>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-secondary mb-3">{order.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-secondary">
                          {order.roomNumber && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="MapPin" size={14} />
                              <span>Room {order.roomNumber}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="User" size={14} />
                            <span>{order.assignedName || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Clock" size={14} />
                            <span>{formatTimeAgo(order.createdAt)}</span>
                          </div>
                          {order.estimatedHours && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="Timer" size={14} />
                              <span>{order.estimatedHours}h est.</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {order.status === 'open' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.Id, 'in_progress')}
                            className="flex items-center space-x-1"
                          >
                            <ApperIcon name="Play" size={14} />
                            <span>Start</span>
                          </Button>
                        )}
                        {order.status === 'in_progress' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(order.Id, 'on_hold')}
                              className="flex items-center space-x-1"
                            >
                              <ApperIcon name="Pause" size={14} />
                              <span>Hold</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.Id, 'completed')}
                              className="flex items-center space-x-1"
                            >
                              <ApperIcon name="CheckCircle" size={14} />
                              <span>Complete</span>
                            </Button>
                          </>
                        )}
                        {order.status === 'on_hold' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.Id, 'in_progress')}
                            className="flex items-center space-x-1"
                          >
                            <ApperIcon name="Play" size={14} />
                            <span>Resume</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center space-x-1"
                        >
                          <ApperIcon name="Eye" size={14} />
                          <span>View</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Work Order Modal Placeholder */}
      {showCreateModal && (
        <CreateWorkOrderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

      {/* Work Order Details Modal Placeholder */}
      {selectedOrder && (
        <WorkOrderDetailsModal
          workOrder={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
};

// Placeholder components for modals (to be implemented when UI components are available)
const CreateWorkOrderModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Work Order</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            <ApperIcon name="X" size={16} />
          </Button>
        </div>
        <p className="text-secondary mb-4">
          Work order creation form will be implemented when form components are available.
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSuccess}>Create Order</Button>
        </div>
      </div>
    </div>
  );
};

const WorkOrderDetailsModal = ({ workOrder, isOpen, onClose, onUpdate }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{workOrder.title}</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            <ApperIcon name="X" size={16} />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-secondary">{workOrder.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Priority</h4>
<Badge className="bg-red-100 text-red-800 border-red-200 inline-flex">
                {workOrder.priority.toUpperCase()}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-1">Status</h4>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 inline-flex">
                {workOrder.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
{workOrder.notes && workOrder.notes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <div className="space-y-2">
                {workOrder.notes.map((note) => (
                  <div key={note.Id} className="bg-slate-50 p-3 rounded">
<p className="text-sm">{note.note}</p>
                    <p className="text-xs text-secondary mt-1">
                      {note.addedBy} - {note.addedAt && !isNaN(new Date(note.addedAt))
                        ? new Date(note.addedAt).toLocaleDateString()
                        : 'Unknown date'
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;