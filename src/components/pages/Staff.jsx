import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { staffService } from "@/services/api/staffService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Dashboard from "@/components/pages/Dashboard";

const Staff = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const tabs = [
    { id: 'schedule', name: 'Schedule Calendar', icon: 'Calendar' },
    { id: 'employees', name: 'Employee Dashboard', icon: 'Users' },
    { id: 'shifts', name: 'Shift Management', icon: 'Clock' },
    { id: 'requests', name: 'Time Off', icon: 'CalendarX' }
  ];

  useEffect(() => {
    loadData();
  }, [selectedWeek, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffData, scheduleData, requestsData] = await Promise.all([
        staffService.getAllStaff(),
        staffService.getWeeklySchedule(selectedWeek),
        staffService.getTimeOffRequests()
      ]);

      setStaff(staffData);
      setWeeklySchedule(scheduleData);
      setTimeOffRequests(requestsData);
    } catch (error) {
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      housekeeping: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-orange-100 text-orange-800',
      reception: 'bg-green-100 text-green-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[department] || colors.general;
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      busy: 'bg-yellow-100 text-yellow-800',
      off_duty: 'bg-gray-100 text-gray-800',
      unavailable: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.available;
  };

  const formatWeekRange = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const ScheduleCalendar = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const timeSlots = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Weekly Schedule</h3>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            <span className="text-sm font-medium">{formatWeekRange(selectedWeek)}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 gap-0 min-w-[800px]">
                {/* Header */}
                <div className="p-3 bg-slate-50 border-b border-r font-medium text-sm">Time</div>
                {weekDays.map(day => (
                  <div key={day} className="p-3 bg-slate-50 border-b border-r font-medium text-sm text-center">
                    {day}
                  </div>
                ))}

                {/* Time slots */}
                {timeSlots.map(time => (
                  <React.Fragment key={time}>
                    <div className="p-3 border-b border-r text-sm bg-slate-50/50 font-medium">
                      {time}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const dayShifts = weeklySchedule.filter(shift => {
                        const shiftDate = new Date(shift.date);
                        return shiftDate.getDay() === dayIndex && 
                               shift.startTime <= time && 
                               shift.endTime > time;
                      });

                      return (
                        <div key={`${time}-${day}`} className="p-1 border-b border-r min-h-[60px]">
                          {dayShifts.map(shift => (
                            <div
                              key={shift.Id}
                              className={`p-2 rounded text-xs mb-1 ${getDepartmentColor(shift.department)}`}
                            >
                              <div className="font-medium truncate">{shift.staffName}</div>
                              <div className="text-xs opacity-75">{shift.startTime}-{shift.endTime}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const EmployeeDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Employee Profiles</h3>
        <Button variant="primary" size="sm">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(member => (
          <Card key={member.Id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-primary/10 to-blue-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="User" className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{member.name}</h4>
                  <p className="text-sm text-secondary">{member.role}</p>
                </div>
                <Badge className={getStatusColor(member.status)}>
                  {member.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Department</span>
                  <Badge className={getDepartmentColor(member.department)}>
                    {member.department}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Rating</span>
                  <div className="flex items-center space-x-1">
                    <ApperIcon name="Star" size={14} className="text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{member.rating}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Weekly Hours</span>
                  <span className="text-sm font-medium">{member.weeklyHours}h</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Completed Today</span>
                  <span className="text-sm font-medium">{member.completedToday} tasks</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Active Tasks</span>
                  <span className="text-sm font-medium">{member.activeAssignments}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <ApperIcon name="Calendar" size={14} className="mr-2" />
                  Schedule
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <ApperIcon name="MessageSquare" size={14} className="mr-2" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ShiftManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Shift Management</h3>
        <Button variant="primary" size="sm">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Create Shift
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h4 className="font-semibold text-slate-900">Today's Shifts</h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklySchedule.filter(shift => {
                const today = new Date().toISOString().split('T')[0];
                return shift.date === today;
              }).map(shift => (
                <div key={shift.Id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={getDepartmentColor(shift.department)}>
                      {shift.department}
                    </Badge>
                    <div>
                      <p className="font-medium">{shift.staffName}</p>
                      <p className="text-sm text-secondary">{shift.startTime} - {shift.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <ApperIcon name="Edit" size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ApperIcon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h4 className="font-semibold text-slate-900">Department Overview</h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['housekeeping', 'maintenance', 'reception'].map(dept => {
                const deptStaff = staff.filter(s => s.department === dept);
                const activeStaff = deptStaff.filter(s => s.status === 'available' || s.status === 'busy').length;
                
                return (
                  <div key={dept} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getDepartmentColor(dept)}>
                          {dept}
                        </Badge>
                        <span className="text-sm font-medium">{deptStaff.length} staff</span>
                      </div>
                      <span className="text-sm text-secondary">{activeStaff} active</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${deptStaff.length > 0 ? (activeStaff / deptStaff.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const TimeOffRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Time-off Requests</h3>
        <Button variant="primary" size="sm">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          New Request
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            {timeOffRequests.map(request => (
              <div key={request.Id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gradient-to-r from-primary/10 to-blue-100 rounded-full flex items-center justify-center">
                    <ApperIcon name="User" className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{request.staffName}</p>
                    <p className="text-sm text-secondary">
                      {request.startDate} to {request.endDate}
                    </p>
                    <p className="text-sm text-secondary">{request.reason}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {request.status}
                  </Badge>
                  
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <ApperIcon name="Check" size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button variant="outline" size="sm">
                        <ApperIcon name="X" size={14} className="mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 gradient-text mb-2">
          Staff Management
        </h1>
        <div className="flex items-center space-x-2 text-sm text-secondary">
          <ApperIcon name="Home" size={14} />
          <span>Dashboard</span>
          <ApperIcon name="ChevronRight" size={14} />
          <span className="text-slate-900 font-medium">Staff</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'schedule' && <ScheduleCalendar />}
        {activeTab === 'employees' && <EmployeeDashboard />}
        {activeTab === 'shifts' && <ShiftManagement />}
        {activeTab === 'requests' && <TimeOffRequests />}
      </div>
    </div>
  );
};

export default Staff;