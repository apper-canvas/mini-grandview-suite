import mockData from '@/services/mockData/housekeeping.json';
import { toast } from 'react-toastify';

class StaffService {
  constructor() {
    // Enhanced staff data with scheduling
    this.staff = mockData.staff.map(member => ({
      ...member,
      department: this.getDepartmentFromRole(member.role),
      hoursWorked: Math.floor(Math.random() * 40) + 20,
      weeklyHours: Math.floor(Math.random() * 40) + 35,
      lastActivity: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      schedule: this.generateWeeklySchedule(member.shift)
    }));

    // Shift templates by department
    this.shiftTemplates = [
      { Id: 1, name: 'Morning Housekeeping', start: '07:00', end: '15:00', department: 'housekeeping' },
      { Id: 2, name: 'Evening Housekeeping', start: '15:00', end: '23:00', department: 'housekeeping' },
      { Id: 3, name: 'Night Maintenance', start: '23:00', end: '07:00', department: 'maintenance' },
      { Id: 4, name: 'Front Desk Morning', start: '06:00', end: '14:00', department: 'reception' },
      { Id: 5, name: 'Front Desk Evening', start: '14:00', end: '22:00', department: 'reception' }
    ];

    // Time-off requests
    this.timeOffRequests = [
      {
        Id: 1,
        staffId: 1,
        staffName: 'Sarah Johnson',
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        reason: 'Personal leave',
        status: 'pending',
        requestDate: '2024-01-15',
        type: 'vacation'
      },
      {
        Id: 2,
        staffId: 3,
        staffName: 'David Chen',
        startDate: '2024-01-25',
        endDate: '2024-01-25',
        reason: 'Medical appointment',
        status: 'approved',
        requestDate: '2024-01-18',
        type: 'personal'
      }
    ];

    this.shifts = this.generateShiftsFromStaff();
  }

  getDepartmentFromRole(role) {
    if (role.toLowerCase().includes('housekeeper')) return 'housekeeping';
    if (role.toLowerCase().includes('maintenance')) return 'maintenance';
    if (role.toLowerCase().includes('front') || role.toLowerCase().includes('desk')) return 'reception';
    return 'general';
  }

  generateWeeklySchedule(shiftType) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedule = {};
    
    days.forEach(day => {
      const isScheduled = Math.random() > 0.2; // 80% chance of being scheduled
      if (isScheduled) {
        schedule[day] = {
          start: shiftType === 'morning' ? '07:00' : '15:00',
          end: shiftType === 'morning' ? '15:00' : '23:00',
          department: 'housekeeping'
        };
      }
    });
    
    return schedule;
  }

  generateShiftsFromStaff() {
    const shifts = [];
    let shiftId = 1;

    this.staff.forEach(member => {
      Object.entries(member.schedule).forEach(([day, shift]) => {
        shifts.push({
          Id: shiftId++,
          staffId: member.Id,
          staffName: member.name,
          date: this.getDateForDay(day),
          startTime: shift.start,
          endTime: shift.end,
          department: shift.department,
          role: member.role,
          status: 'scheduled'
        });
      });
    });

    return shifts;
  }

  getDateForDay(dayName) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const currentDay = today.getDay();
    const targetDay = days.indexOf(dayName.toLowerCase());
    const diff = targetDay - currentDay;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  }

  // Staff Management
  async getAllStaff() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.staff.map(member => ({ ...member }));
  }

  async getStaffById(id) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const staff = this.staff.find(member => member.Id === id);
    if (!staff) {
      throw new Error('Staff member not found');
    }
    return { ...staff };
  }

  async getStaffByDepartment(department) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.staff.filter(member => member.department === department).map(member => ({ ...member }));
  }

  async updateStaffStatus(id, status) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const staffIndex = this.staff.findIndex(member => member.Id === id);
    if (staffIndex === -1) {
      throw new Error('Staff member not found');
    }

    this.staff[staffIndex].status = status;
    this.staff[staffIndex].lastActivity = new Date().toISOString();
    
    toast.success(`Staff status updated to ${status}`);
    return { ...this.staff[staffIndex] };
  }

  // Schedule Management
  async getWeeklySchedule(weekStart) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return this.shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= new Date(weekStart) && shiftDate <= weekEnd;
    });
  }

  async createShift(shiftData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check for conflicts
    const conflicts = this.shifts.filter(existing => 
      existing.staffId === shiftData.staffId && 
      existing.date === shiftData.date &&
      this.timesOverlap(existing.startTime, existing.endTime, shiftData.startTime, shiftData.endTime)
    );

    if (conflicts.length > 0) {
      throw new Error('Shift conflicts with existing schedule');
    }

    const newShift = {
      Id: Math.max(...this.shifts.map(s => s.Id), 0) + 1,
      ...shiftData,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    this.shifts.push(newShift);
    toast.success('Shift created successfully');
    return newShift;
  }

  async updateShift(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const shiftIndex = this.shifts.findIndex(shift => shift.Id === id);
    if (shiftIndex === -1) {
      throw new Error('Shift not found');
    }

    this.shifts[shiftIndex] = { ...this.shifts[shiftIndex], ...updates };
    toast.success('Shift updated successfully');
    return { ...this.shifts[shiftIndex] };
  }

  async deleteShift(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const shiftIndex = this.shifts.findIndex(shift => shift.Id === id);
    if (shiftIndex === -1) {
      throw new Error('Shift not found');
    }

    this.shifts.splice(shiftIndex, 1);
    toast.success('Shift deleted successfully');
    return true;
  }

  // Time-off Management
  async getTimeOffRequests(status = null) {
    await new Promise(resolve => setTimeout(resolve, 150));
    if (status) {
      return this.timeOffRequests.filter(request => request.status === status);
    }
    return [...this.timeOffRequests];
  }

  async createTimeOffRequest(requestData) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const newRequest = {
      Id: Math.max(...this.timeOffRequests.map(r => r.Id), 0) + 1,
      ...requestData,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0]
    };

    this.timeOffRequests.push(newRequest);
    toast.success('Time-off request submitted');
    return newRequest;
  }

  async updateTimeOffRequest(id, status, notes = '') {
    await new Promise(resolve => setTimeout(resolve, 200));
    const requestIndex = this.timeOffRequests.findIndex(req => req.Id === id);
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    this.timeOffRequests[requestIndex].status = status;
    this.timeOffRequests[requestIndex].reviewDate = new Date().toISOString().split('T')[0];
    if (notes) this.timeOffRequests[requestIndex].notes = notes;

    toast.success(`Time-off request ${status}`);
    return { ...this.timeOffRequests[requestIndex] };
  }

  // Performance Analytics
  async getStaffPerformance(staffId = null) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (staffId) {
      const staff = this.staff.find(member => member.Id === staffId);
      if (!staff) throw new Error('Staff member not found');
      
      return {
        staffId: staff.Id,
        name: staff.name,
        rating: staff.rating,
        completedToday: staff.completedToday,
        weeklyHours: staff.weeklyHours,
        productivity: Math.round(staff.rating * 20), // Convert to percentage
        punctuality: Math.floor(Math.random() * 20) + 80, // 80-100%
        taskCompletionRate: Math.floor(Math.random() * 15) + 85 // 85-100%
      };
    }

    return this.staff.map(member => ({
      staffId: member.Id,
      name: member.name,
      rating: member.rating,
      completedToday: member.completedToday,
      weeklyHours: member.weeklyHours,
      productivity: Math.round(member.rating * 20),
      punctuality: Math.floor(Math.random() * 20) + 80,
      taskCompletionRate: Math.floor(Math.random() * 15) + 85
    }));
  }

  async getDepartmentStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const departments = {};
    this.staff.forEach(member => {
      if (!departments[member.department]) {
        departments[member.department] = {
          name: member.department,
          totalStaff: 0,
          activeStaff: 0,
          averageRating: 0,
          totalHours: 0
        };
      }
      
      departments[member.department].totalStaff++;
      if (member.status === 'available' || member.status === 'busy') {
        departments[member.department].activeStaff++;
      }
      departments[member.department].totalHours += member.weeklyHours;
    });

    // Calculate averages
    Object.values(departments).forEach(dept => {
      const deptStaff = this.staff.filter(s => s.department === dept.name);
      dept.averageRating = deptStaff.reduce((sum, s) => sum + s.rating, 0) / deptStaff.length;
    });

    return Object.values(departments);
  }

  // Utility methods
  timesOverlap(start1, end1, start2, end2) {
    return start1 < end2 && end1 > start2;
  }

  async getShiftTemplates() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.shiftTemplates];
  }
}

export const staffService = new StaffService();