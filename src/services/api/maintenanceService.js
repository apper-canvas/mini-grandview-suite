import workOrdersData from '@/services/mockData/workOrders.json';
import equipmentData from '@/services/mockData/equipment.json';
import vendorsData from '@/services/mockData/vendors.json';
import { roomService } from '@/services/api/roomService';
import { toast } from 'react-toastify';

class MaintenanceService {
  constructor() {
    this.workOrders = [...workOrdersData];
    this.equipment = [...equipmentData];
    this.vendors = [...vendorsData];
    this.internalStaff = [
      { Id: 1, name: 'Tom Smith', role: 'Maintenance Technician', specialties: ['electrical', 'hardware'], phone: '(555) 100-0001', email: 'tom@hotel.com', status: 'available' },
      { Id: 2, name: 'Mike Johnson', role: 'HVAC Specialist', specialties: ['hvac'], phone: '(555) 100-0002', email: 'mike@hotel.com', status: 'busy' },
      { Id: 3, name: 'Carlos Rodriguez', role: 'General Maintenance', specialties: ['flooring', 'painting', 'general'], phone: '(555) 100-0003', email: 'carlos@hotel.com', status: 'available' },
      { Id: 4, name: 'Lisa Chang', role: 'Facilities Manager', specialties: ['management', 'vendor_coordination'], phone: '(555) 100-0004', email: 'lisa@hotel.com', status: 'available' }
    ];
  }

  // Work Order Management
  async getAllWorkOrders() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.workOrders].sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  async getWorkOrderById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const workOrder = this.workOrders.find(wo => wo.Id === parseInt(id));
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }
    return { ...workOrder };
  }

  async getWorkOrdersByStatus(status) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.workOrders.filter(wo => wo.status === status);
  }

  async getWorkOrdersByPriority(priority) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.workOrders.filter(wo => wo.priority === priority);
  }

  async createWorkOrder(orderData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newWorkOrder = {
      Id: Math.max(...this.workOrders.map(wo => wo.Id), 0) + 1,
      title: orderData.title,
      description: orderData.description,
      priority: orderData.priority || 'medium',
      status: 'open',
      category: orderData.category,
      roomId: orderData.roomId || null,
      roomNumber: orderData.roomNumber || null,
      equipmentId: orderData.equipmentId || null,
      equipmentName: orderData.equipmentName || null,
      assignedTo: orderData.assignedTo || null,
      assignedType: orderData.assignedType || null,
      assignedName: orderData.assignedName || null,
      reportedBy: orderData.reportedBy || 'Current User',
      reportedAt: new Date().toISOString(),
      assignedAt: orderData.assignedTo ? new Date().toISOString() : null,
      startedAt: null,
      dueDate: orderData.dueDate || null,
      estimatedHours: orderData.estimatedHours || null,
      actualHours: null,
      completedAt: null,
      photos: orderData.photos || [],
      notes: [],
      costEstimate: orderData.costEstimate || null,
      actualCost: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.workOrders.push(newWorkOrder);
    
    // Update room status if applicable
    if (newWorkOrder.roomId) {
      try {
        await roomService.updateStatus(newWorkOrder.roomId, 'Maintenance');
      } catch (error) {
        console.error('Failed to update room status:', error);
      }
    }

    toast.success('Work order created successfully');
    return { ...newWorkOrder };
  }

  async updateWorkOrder(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const orderIndex = this.workOrders.findIndex(wo => wo.Id === parseInt(id));
    if (orderIndex === -1) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    const currentOrder = this.workOrders[orderIndex];
    const updatedOrder = {
      ...currentOrder,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.workOrders[orderIndex] = updatedOrder;
    toast.success('Work order updated successfully');
    return { ...updatedOrder };
  }

  async updateWorkOrderStatus(id, newStatus) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const orderIndex = this.workOrders.findIndex(wo => wo.Id === parseInt(id));
    if (orderIndex === -1) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    const workOrder = this.workOrders[orderIndex];
    const now = new Date().toISOString();
    const updates = { status: newStatus, updatedAt: now };

    // Handle status-specific logic
    switch (newStatus) {
      case 'in_progress':
        if (!workOrder.startedAt) {
          updates.startedAt = now;
        }
        break;
      case 'completed':
        updates.completedAt = now;
        if (workOrder.startedAt) {
          const startTime = new Date(workOrder.startedAt);
          const completedTime = new Date(now);
          updates.actualHours = ((completedTime - startTime) / (1000 * 60 * 60)).toFixed(1);
        }
        // Update room status back to available if applicable
        if (workOrder.roomId) {
          try {
            await roomService.updateStatus(workOrder.roomId, 'Available');
          } catch (error) {
            console.error('Failed to update room status:', error);
          }
        }
        break;
      case 'on_hold':
        // Keep existing timestamps
        break;
    }

    this.workOrders[orderIndex] = { ...workOrder, ...updates };
    
    toast.success(`Work order marked as ${newStatus.replace('_', ' ')}`);
    return { ...this.workOrders[orderIndex] };
  }

  async addWorkOrderNote(id, noteText) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const orderIndex = this.workOrders.findIndex(wo => wo.Id === parseInt(id));
    if (orderIndex === -1) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    const workOrder = this.workOrders[orderIndex];
    const newNote = {
      Id: (workOrder.notes.length > 0 ? Math.max(...workOrder.notes.map(n => n.Id)) : 0) + 1,
      note: noteText,
      addedBy: 'Current User',
      addedAt: new Date().toISOString()
    };

    workOrder.notes.push(newNote);
    workOrder.updatedAt = new Date().toISOString();
    
    toast.success('Note added to work order');
    return { ...workOrder };
  }

  async deleteWorkOrder(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const orderIndex = this.workOrders.findIndex(wo => wo.Id === parseInt(id));
    if (orderIndex === -1) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    const workOrder = this.workOrders[orderIndex];
    
    // If room was in maintenance, revert to cleaning status
    if (workOrder.roomId && workOrder.status !== 'completed') {
      try {
        await roomService.updateStatus(workOrder.roomId, 'Cleaning');
      } catch (error) {
        console.error('Failed to update room status:', error);
      }
    }

    this.workOrders.splice(orderIndex, 1);
    toast.success('Work order deleted');
  }

  // Equipment Management
  async getAllEquipment() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.equipment];
  }

  async getEquipmentById(id) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const equipment = this.equipment.find(eq => eq.Id === parseInt(id));
    if (!equipment) {
      throw new Error(`Equipment with ID ${id} not found`);
    }
    return { ...equipment };
  }

  async getEquipmentByCategory(category) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.equipment.filter(eq => eq.category === category);
  }

  // Staff and Vendor Management
  async getInternalStaff() {
    await new Promise(resolve => setTimeout(resolve, 150));
    return [...this.internalStaff];
  }

  async getAvailableStaff() {
    await new Promise(resolve => setTimeout(resolve, 150));
    return this.internalStaff.filter(staff => staff.status === 'available');
  }

  async getAllVendors() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.vendors];
  }

  async getVendorsByCategory(category) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.vendors.filter(vendor => vendor.category === category);
  }

  async getPreferredVendors() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.vendors.filter(vendor => vendor.isPreferred);
  }

  // Dashboard Statistics
  async getMaintenanceStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const stats = this.workOrders.reduce((acc, wo) => {
      acc[wo.status] = (acc[wo.status] || 0) + 1;
      acc.priority[wo.priority] = (acc.priority[wo.priority] || 0) + 1;
      return acc;
    }, { priority: {} });

    const totalWorkOrders = this.workOrders.length;
    const activeOrders = (stats.open || 0) + (stats.in_progress || 0) + (stats.on_hold || 0);
    
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyOrders = this.workOrders.filter(wo => wo.createdAt.startsWith(thisMonth)).length;
    
    const avgCompletionTime = this.workOrders
      .filter(wo => wo.status === 'completed' && wo.actualHours)
      .reduce((sum, wo) => sum + parseFloat(wo.actualHours), 0) / 
      this.workOrders.filter(wo => wo.status === 'completed' && wo.actualHours).length || 0;

    return {
      total: totalWorkOrders,
      open: stats.open || 0,
      inProgress: stats.in_progress || 0,
      completed: stats.completed || 0,
      onHold: stats.on_hold || 0,
      active: activeOrders,
      highPriority: stats.priority.high || 0,
      mediumPriority: stats.priority.medium || 0,
      lowPriority: stats.priority.low || 0,
      monthlyOrders,
      avgCompletionTime: parseFloat(avgCompletionTime.toFixed(1))
    };
  }

  // Integration with Room Service
  async createMaintenanceRequestFromRoom(roomId, issueDescription, priority = 'medium') {
    const room = await roomService.getById(roomId);
    
    return this.createWorkOrder({
      title: `Maintenance Request - Room ${room.roomNumber}`,
      description: issueDescription,
      priority,
      category: 'general',
      roomId: room.Id,
      roomNumber: room.roomNumber,
      reportedBy: 'Room Status Board'
    });
  }
}

export const maintenanceService = new MaintenanceService();
export default maintenanceService;