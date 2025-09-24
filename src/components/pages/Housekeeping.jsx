import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import { housekeepingService } from "@/services/api/housekeepingService";
import { roomService } from "@/services/api/roomService";
import { toast } from 'react-toastify';

const Housekeeping = () => {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('board'); // board, staff, assignments
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    loadHousekeepingData();
  }, []);

  const loadHousekeepingData = async () => {
    try {
      setLoading(true);
      const [tasksData, staffData, roomsData, statsData] = await Promise.all([
        housekeepingService.getAllTasks(),
        housekeepingService.getAllStaff(),
        roomService.getAll(),
        housekeepingService.getHousekeepingStats()
      ]);
      
      setTasks(tasksData);
      setStaff(staffData);
      setRooms(roomsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load housekeeping data:', error);
      setError(error.message);
      toast.error('Failed to load housekeeping data');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      await housekeepingService.updateTaskStatus(taskId, newStatus);
      await loadHousekeepingData();
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    if (draggedTask.status !== newStatus) {
      await handleTaskStatusUpdate(draggedTask.Id, newStatus);
    }
    setDraggedTask(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'quality_check': return 'accent';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return '--';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card>
          <CardContent className="text-center py-8">
            <ApperIcon name="AlertTriangle" className="h-12 w-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Housekeeping</h3>
            <p className="text-secondary mb-4">{error}</p>
            <Button onClick={loadHousekeepingData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 gradient-text mb-2">
          Housekeeping Management
        </h1>
        <div className="flex items-center space-x-2 text-sm text-secondary">
          <ApperIcon name="Home" size={14} />
          <span>Dashboard</span>
          <ApperIcon name="ChevronRight" size={14} />
          <span className="text-slate-900 font-medium">Housekeeping</span>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card hover={false}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">Pending Tasks</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingTasks}</p>
                </div>
                <div className="h-10 w-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Clock" className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover={false}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">In Progress</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.inProgressTasks}</p>
                </div>
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Activity" className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover={false}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">Completed Today</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.completedToday}</p>
                </div>
                <div className="h-10 w-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <ApperIcon name="CheckCircle" className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover={false}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">Avg. Time</p>
                  <p className="text-2xl font-bold text-slate-900">{formatTime(stats.averageTime)}</p>
                </div>
                <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Timer" className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Selection and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={selectedView === 'board' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('board')}
            className="flex items-center gap-2"
          >
            <ApperIcon name="LayoutGrid" className="h-4 w-4" />
            Cleaning Board
          </Button>
          <Button
            variant={selectedView === 'staff' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('staff')}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Users" className="h-4 w-4" />
            Staff Dashboard
          </Button>
        </div>

        <Button
          onClick={() => setShowAssignmentModal(true)}
          className="flex items-center gap-2"
        >
          <ApperIcon name="UserPlus" className="h-4 w-4" />
          Assign Tasks
        </Button>
      </div>

      {/* Content Views */}
      {selectedView === 'board' && (
        <CleaningBoard 
          tasks={tasks}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onStatusUpdate={handleTaskStatusUpdate}
          getPriorityColor={getPriorityColor}
          formatTime={formatTime}
        />
      )}

      {selectedView === 'staff' && (
        <StaffDashboard 
          staff={staff}
          tasks={tasks}
          onTaskUpdate={handleTaskStatusUpdate}
          getPriorityColor={getPriorityColor}
          formatTime={formatTime}
        />
      )}

      {/* Task Assignment Modal */}
      {showAssignmentModal && (
        <TaskAssignmentModal
          rooms={rooms.filter(r => r.status === 'Cleaning' || r.status === 'Maintenance')}
          staff={staff}
          onClose={() => setShowAssignmentModal(false)}
          onAssign={async (assignments) => {
            try {
              await housekeepingService.bulkAssignTasks(assignments);
              await loadHousekeepingData();
              setShowAssignmentModal(false);
            } catch (error) {
              console.error('Failed to assign tasks:', error);
              toast.error('Failed to assign tasks');
            }
          }}
        />
      )}
    </div>
  );
};

// Cleaning Board Component
const CleaningBoard = ({ tasks, onDragStart, onDragOver, onDrop, onStatusUpdate, getPriorityColor, formatTime }) => {
  const columns = [
    { key: 'pending', title: 'Pending', icon: 'Clock' },
    { key: 'in_progress', title: 'In Progress', icon: 'Activity' },
    { key: 'quality_check', title: 'Quality Check', icon: 'Eye' },
    { key: 'completed', title: 'Completed', icon: 'CheckCircle' }
  ];

  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <Card key={column.key} hover={false} className="h-fit">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ApperIcon name={column.icon} className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-slate-900">{column.title}</h3>
              </div>
              <Badge variant="default" className="text-xs">
                {getTasksByStatus(column.key).length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent
            className="space-y-3 min-h-96 pt-0"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, column.key)}
          >
            {getTasksByStatus(column.key).map((task) => (
              <div
                key={task.Id}
                draggable
                onDragStart={(e) => onDragStart(e, task)}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200 cursor-move hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-slate-900">Room {task.roomNumber}</h4>
                    <p className="text-xs text-secondary">{task.taskType?.replace('_', ' ')}</p>
                  </div>
                  <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
                
                {task.assignedStaff && (
                  <div className="flex items-center gap-2 mb-2">
                    <ApperIcon name="User" className="h-3 w-3 text-secondary" />
                    <span className="text-xs text-secondary">{task.assignedStaff}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-secondary">
                  <div className="flex items-center gap-1">
                    <ApperIcon name="Clock" className="h-3 w-3" />
                    <span>Est: {formatTime(task.estimatedTime)}</span>
                  </div>
                  {task.startTime && (
<div className="flex items-center gap-1">
                      <ApperIcon name="Play" className="h-3 w-3" />
                      <span>
                        {task.startTime && !isNaN(new Date(task.startTime))
                          ? new Date(task.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                          : '--:--'
                        }
                      </span>
                    </div>
                  )}
                </div>
                
                {task.specialInstructions && (
                  <p className="text-xs text-slate-600 mt-2 italic">
                    "{task.specialInstructions}"
                  </p>
                )}
              </div>
            ))}
            
            {getTasksByStatus(column.key).length === 0 && (
              <div className="text-center py-8 text-secondary">
                <ApperIcon name="Package" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No {column.title.toLowerCase()} tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Staff Dashboard Component
const StaffDashboard = ({ staff, tasks, onTaskUpdate, getPriorityColor, formatTime }) => {
  const getStaffTasks = (staffId) => tasks.filter(task => task.assignedTo === staffId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {staff.map((member) => {
        const staffTasks = getStaffTasks(member.Id);
        const activeTasks = staffTasks.filter(t => ['pending', 'in_progress'].includes(t.status));
        
        return (
          <Card key={member.Id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                    <ApperIcon name="User" className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{member.name}</h3>
                    <p className="text-sm text-secondary">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={member.status === 'available' ? 'success' : 'warning'}>
                    {member.status}
                  </Badge>
                  <p className="text-xs text-secondary mt-1">
                    ⭐ {member.rating} rating
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-primary">{member.activeAssignments}</p>
                  <p className="text-xs text-secondary">Active</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-success">{member.completedToday}</p>
                  <p className="text-xs text-secondary">Today</p>
                </div>
              </div>

              {activeTasks.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900 text-sm">Active Assignments</h4>
                  {activeTasks.map((task) => (
                    <div key={task.Id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Room {task.roomNumber}</span>
                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-secondary">
                        <span>Est: {formatTime(task.estimatedTime)}</span>
                        <Badge variant={task.status === 'pending' ? 'warning' : 'info'} className="text-xs">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {task.status === 'pending' && (
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => onTaskUpdate(task.Id, 'in_progress')}
                        >
                          Start Task
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-secondary">
                  <ApperIcon name="CheckCircle" className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">No active assignments</p>
                </div>
              )}

              <div className="text-xs text-secondary">
                <p><strong>Specialties:</strong> {member.specialties?.join(', ') || 'General cleaning'}</p>
                <p><strong>Shift:</strong> {member.shift}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Task Assignment Modal Component
const TaskAssignmentModal = ({ rooms, staff, onClose, onAssign }) => {
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [supplies, setSupplies] = useState([]);
  const [priority, setPriority] = useState('medium');
  const [suppliesInput, setSuppliesInput] = useState('');

  const availableStaff = staff.filter(s => s.status === 'available');

  const handleRoomToggle = (roomId) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleSuppliesAdd = () => {
    if (suppliesInput.trim() && !supplies.includes(suppliesInput.trim())) {
      setSupplies([...supplies, suppliesInput.trim()]);
      setSuppliesInput('');
    }
  };

  const handleSubmit = () => {
    if (!selectedRooms.length || !selectedStaff) {
      toast.error('Please select rooms and staff member');
      return;
    }

    onAssign([{
      roomIds: selectedRooms,
      staffId: selectedStaff,
      specialInstructions: specialInstructions || null,
      supplies: supplies.length ? supplies : ['standard cleaning kit'],
      priority
    }]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ApperIcon name="UserPlus" className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Assign Cleaning Tasks</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Select Rooms ({selectedRooms.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {rooms.map((room) => (
                <div
                  key={room.Id}
                  onClick={() => handleRoomToggle(room.Id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRooms.includes(room.Id)
                      ? 'border-primary bg-primary/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Room {room.number}</span>
                    <Badge variant={room.status === 'Cleaning' ? 'cleaning' : 'maintenance'} className="text-xs">
                      {room.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-secondary">{room.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Assign To</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="">Select staff member</option>
              {availableStaff.map((member) => (
                <option key={member.Id} value={member.Id}>
                  {member.name} - {member.role} (⭐ {member.rating})
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Priority</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((p) => (
                <Button
                  key={p}
                  variant={priority === p ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setPriority(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Special Instructions</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Any special cleaning requirements or notes..."
            />
          </div>

          {/* Supplies */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Required Supplies</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={suppliesInput}
                onChange={(e) => setSuppliesInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSuppliesAdd()}
                className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Add supply item..."
              />
              <Button onClick={handleSuppliesAdd} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {supplies.map((supply, index) => (
                <Badge key={index} variant="default" className="text-xs">
                  {supply}
                  <button
                    onClick={() => setSupplies(supplies.filter((_, i) => i !== index))}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Assign Tasks</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Housekeeping;