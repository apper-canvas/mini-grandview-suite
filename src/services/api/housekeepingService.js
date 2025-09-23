import mockData from '@/services/mockData/housekeeping.json';
import { roomService } from '@/services/api/roomService';
import { toast } from 'react-toastify';

class HousekeepingService {
  constructor() {
    this.tasks = [...mockData.tasks];
    this.staff = [...mockData.staff];
  }

  // Task Management
  async getAllTasks() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.tasks.map(task => ({ ...task }));
  }

  async getTasksByStatus(status) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks
      .filter(task => task.status === status)
      .map(task => ({ ...task }));
  }

  async getTaskById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const task = this.tasks.find(t => t.Id === parseInt(id));
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }
    return { ...task };
  }

  async createTask(taskData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newTask = {
      Id: Math.max(...this.tasks.map(t => t.Id), 0) + 1,
      status: 'pending',
      assignedTo: null,
      assignedStaff: null,
      actualTime: null,
      startTime: null,
      completedTime: null,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
      ...taskData
    };

    this.tasks.push(newTask);
    toast.success('Task created successfully');
    return { ...newTask };
  }

  async updateTaskStatus(id, newStatus, updates = {}) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const taskIndex = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${id} not found`);
    }

    const task = this.tasks[taskIndex];
    const now = new Date().toISOString();
    
    // Update task with status-specific logic
    const updatedTask = {
      ...task,
      status: newStatus,
      ...updates
    };

    // Handle status-specific updates
    if (newStatus === 'in_progress' && !task.startTime) {
      updatedTask.startTime = now;
    } else if (newStatus === 'completed') {
      updatedTask.completedTime = now;
      if (task.startTime) {
        const startTime = new Date(task.startTime);
        const completedTime = new Date(now);
        updatedTask.actualTime = Math.round((completedTime - startTime) / 60000); // minutes
      }
      
      // Update room status when task completes
      try {
        await roomService.updateStatus(task.roomId, 'Available');
      } catch (error) {
        console.error('Failed to update room status:', error);
      }
    }

    this.tasks[taskIndex] = updatedTask;
    
    // Update staff active assignments
    this.updateStaffAssignments();
    
    toast.success(`Task ${newStatus.replace('_', ' ')}`);
    return { ...updatedTask };
  }

  async assignTask(taskId, staffId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const taskIndex = this.tasks.findIndex(t => t.Id === parseInt(taskId));
    const staff = this.staff.find(s => s.Id === parseInt(staffId));
    
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    if (!staff) {
      throw new Error(`Staff member with ID ${staffId} not found`);
    }

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      assignedTo: parseInt(staffId),
      assignedStaff: staff.name
    };

    this.updateStaffAssignments();
    toast.success(`Task assigned to ${staff.name}`);
    return { ...this.tasks[taskIndex] };
  }

  async bulkAssignTasks(assignments) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedTasks = [];
    
    for (const assignment of assignments) {
      const { roomIds, staffId, specialInstructions, supplies, priority } = assignment;
      
      for (const roomId of roomIds) {
        const existingTaskIndex = this.tasks.findIndex(
          t => t.roomId === roomId && ['pending', 'in_progress'].includes(t.status)
        );
        
        if (existingTaskIndex !== -1) {
          // Update existing task
          const staff = this.staff.find(s => s.Id === parseInt(staffId));
          this.tasks[existingTaskIndex] = {
            ...this.tasks[existingTaskIndex],
            assignedTo: parseInt(staffId),
            assignedStaff: staff?.name || 'Unknown',
            specialInstructions: specialInstructions || this.tasks[existingTaskIndex].specialInstructions,
            supplies: supplies || this.tasks[existingTaskIndex].supplies,
            priority: priority || this.tasks[existingTaskIndex].priority
          };
          updatedTasks.push(this.tasks[existingTaskIndex]);
        } else {
          // Create new task
          const room = await roomService.getById(roomId);
          const staff = this.staff.find(s => s.Id === parseInt(staffId));
          
          const newTask = {
            Id: Math.max(...this.tasks.map(t => t.Id), 0) + 1,
            roomNumber: room.number,
            roomId: roomId,
            status: 'pending',
            assignedTo: parseInt(staffId),
            assignedStaff: staff?.name || 'Unknown',
            priority: priority || 'medium',
            estimatedTime: 30,
            actualTime: null,
            startTime: null,
            completedTime: null,
            taskType: 'standard_cleaning',
            specialInstructions: specialInstructions || null,
            supplies: supplies || ['standard cleaning kit'],
            createdAt: new Date().toISOString(),
            createdBy: 'Current User'
          };
          
          this.tasks.push(newTask);
          updatedTasks.push(newTask);
        }
      }
    }
    
    this.updateStaffAssignments();
    toast.success(`${updatedTasks.length} tasks assigned successfully`);
    return updatedTasks;
  }

  // Staff Management
  async getAllStaff() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.staff.map(member => ({ ...member }));
  }

  async getAvailableStaff() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.staff
      .filter(member => member.status === 'available')
      .map(member => ({ ...member }));
  }

  async getStaffById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const staff = this.staff.find(s => s.Id === parseInt(id));
    if (!staff) {
      throw new Error(`Staff member with ID ${id} not found`);
    }
    return { ...staff };
  }

  async getStaffTasks(staffId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks
      .filter(task => task.assignedTo === parseInt(staffId))
      .map(task => ({ ...task }));
  }

  // Statistics and Analytics
  async getHousekeepingStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const totalTasks = this.tasks.length;
    const pendingTasks = this.tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = this.tasks.filter(t => t.status === 'in_progress').length;
    const completedToday = this.tasks.filter(t => 
      t.status === 'completed' && 
      new Date(t.completedTime).toDateString() === new Date().toDateString()
    ).length;
    
    const averageTime = this.tasks
      .filter(t => t.actualTime)
      .reduce((sum, t) => sum + t.actualTime, 0) / 
      this.tasks.filter(t => t.actualTime).length || 0;

    const staffStats = this.staff.map(member => ({
      ...member,
      activeAssignments: this.tasks.filter(
        t => t.assignedTo === member.Id && ['pending', 'in_progress'].includes(t.status)
      ).length,
      completedToday: this.tasks.filter(
        t => t.assignedTo === member.Id && 
        t.status === 'completed' && 
        new Date(t.completedTime).toDateString() === new Date().toDateString()
      ).length
    }));

    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedToday,
      averageTime: Math.round(averageTime),
      staffStats
    };
  }

  // Helper methods
  updateStaffAssignments() {
    this.staff.forEach(member => {
      const activeAssignments = this.tasks.filter(
        t => t.assignedTo === member.Id && ['pending', 'in_progress'].includes(t.status)
      ).length;
      
      member.activeAssignments = activeAssignments;
      member.status = activeAssignments > 0 ? 'busy' : 'available';
    });
  }

  async deleteTask(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const taskIndex = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${id} not found`);
    }

    this.tasks.splice(taskIndex, 1);
    this.updateStaffAssignments();
    toast.success('Task deleted successfully');
    return true;
  }
}

export const housekeepingService = new HousekeepingService();