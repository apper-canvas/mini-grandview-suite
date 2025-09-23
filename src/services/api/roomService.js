import mockRooms from '@/services/mockData/rooms.json';
import { toast } from 'react-toastify';

class RoomService {
  constructor() {
    this.rooms = [...mockRooms];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.rooms.map(room => ({ ...room }));
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const room = this.rooms.find(r => r.Id === parseInt(id));
    if (!room) {
      throw new Error(`Room with ID ${id} not found`);
    }
    return { ...room };
  }

  async getByFloor(floor) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.rooms
      .filter(room => room.floor === parseInt(floor))
      .map(room => ({ ...room }));
  }

  async getByStatus(status) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.rooms
      .filter(room => room.status === status)
      .map(room => ({ ...room }));
  }

  async updateStatus(id, newStatus) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roomIndex = this.rooms.findIndex(r => r.Id === parseInt(id));
    if (roomIndex === -1) {
      throw new Error(`Room with ID ${id} not found`);
    }

    const room = this.rooms[roomIndex];
    const oldStatus = room.status;
    
    // Update room status and timestamp
    this.rooms[roomIndex] = {
      ...room,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
      statusHistory: [
        ...room.statusHistory,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          changedFrom: oldStatus,
          changedBy: 'Current User'
        }
      ]
    };

    // Clear guest info if room becomes available
    if (newStatus === 'Available') {
      this.rooms[roomIndex].guestName = null;
      this.rooms[roomIndex].checkoutTime = null;
      this.rooms[roomIndex].checkinTime = null;
    }

    return { ...this.rooms[roomIndex] };
  }

  async updateRoom(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const roomIndex = this.rooms.findIndex(r => r.Id === parseInt(id));
    if (roomIndex === -1) {
      throw new Error(`Room with ID ${id} not found`);
    }

    this.rooms[roomIndex] = {
      ...this.rooms[roomIndex],
      ...updateData,
      Id: parseInt(id), // Ensure ID doesn't change
      lastUpdated: new Date().toISOString()
    };

    return { ...this.rooms[roomIndex] };
  }

  async getRoomStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const stats = this.rooms.reduce((acc, room) => {
      acc[room.status] = (acc[room.status] || 0) + 1;
      return acc;
    }, {});

    const totalRooms = this.rooms.length;
    const occupancyRate = ((stats.Occupied || 0) / totalRooms * 100).toFixed(1);
    
    return {
      total: totalRooms,
      available: stats.Available || 0,
      occupied: stats.Occupied || 0,
      maintenance: stats.Maintenance || 0,
      cleaning: stats.Cleaning || 0,
      occupancyRate: parseFloat(occupancyRate)
    };
  }

  async assignGuest(roomId, guestData) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const roomIndex = this.rooms.findIndex(r => r.Id === parseInt(roomId));
    if (roomIndex === -1) {
      throw new Error(`Room with ID ${roomId} not found`);
    }

    const room = this.rooms[roomIndex];
    if (room.status !== 'Available') {
      throw new Error(`Room ${room.roomNumber} is not available for assignment`);
    }

    this.rooms[roomIndex] = {
      ...room,
      status: 'Occupied',
      guestName: guestData.guestName,
      checkinTime: guestData.checkinTime || new Date().toISOString(),
      checkoutTime: guestData.checkoutTime,
      lastUpdated: new Date().toISOString(),
      statusHistory: [
        ...room.statusHistory,
        {
          status: 'Occupied',
          timestamp: new Date().toISOString(),
          changedFrom: 'Available',
          changedBy: 'Current User',
          guestName: guestData.guestName
        }
      ]
    };

    return { ...this.rooms[roomIndex] };
  }

  async checkoutGuest(roomId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roomIndex = this.rooms.findIndex(r => r.Id === parseInt(roomId));
    if (roomIndex === -1) {
      throw new Error(`Room with ID ${roomId} not found`);
    }

    const room = this.rooms[roomIndex];
    if (room.status !== 'Occupied') {
      throw new Error(`Room ${room.roomNumber} is not currently occupied`);
    }

    this.rooms[roomIndex] = {
      ...room,
      status: 'Cleaning',
      lastUpdated: new Date().toISOString(),
      statusHistory: [
        ...room.statusHistory,
        {
          status: 'Cleaning',
          timestamp: new Date().toISOString(),
          changedFrom: 'Occupied',
          changedBy: 'Current User',
          note: 'Guest checkout completed'
        }
      ]
    };

    return { ...this.rooms[roomIndex] };
  }
}

export const roomService = new RoomService();