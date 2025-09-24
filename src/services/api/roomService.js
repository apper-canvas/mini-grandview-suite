import mockRooms from "@/services/mockData/rooms.json";

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

  async markCleaningComplete(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roomIndex = this.rooms.findIndex(r => r.Id === parseInt(id));
    if (roomIndex === -1) {
      throw new Error(`Room with ID ${id} not found`);
    }

    return this.updateStatus(id, 'Available');
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

  async bulkUpdateStatus(roomIds, newStatus) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    roomIds.forEach(roomId => {
      const roomIndex = this.rooms.findIndex(r => r.Id === parseInt(roomId));
      if (roomIndex !== -1) {
        const room = this.rooms[roomIndex];
        const oldStatus = room.status;
        
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
              changedBy: 'Current User',
              note: `Bulk status change`
            }
          ]
        };

        // Clear guest info if room becomes available
        if (newStatus === 'Available') {
          this.rooms[roomIndex].guestName = null;
          this.rooms[roomIndex].checkoutTime = null;
          this.rooms[roomIndex].checkinTime = null;
        }
      }
    });

    return this.rooms.filter(room => roomIds.includes(room.Id.toString()));
  }

  async bulkBlockRooms(roomIds, reason) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    roomIds.forEach(roomId => {
      const roomIndex = this.rooms.findIndex(r => r.Id === parseInt(roomId));
      if (roomIndex !== -1) {
        const room = this.rooms[roomIndex];
        
        this.rooms[roomIndex] = {
          ...room,
          status: 'Out of Order',
          blocked: true,
          blockReason: reason,
          lastUpdated: new Date().toISOString(),
          statusHistory: [
            ...room.statusHistory,
            {
              status: 'Out of Order',
              timestamp: new Date().toISOString(),
              changedFrom: room.status,
              changedBy: 'Current User',
              note: `Room blocked - ${reason}`
            }
          ]
        };
      }
    });

    return this.rooms.filter(room => roomIds.includes(room.Id.toString()));
  }

  async blockRoom(roomId, reason) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roomIndex = this.rooms.findIndex(r => r.Id === parseInt(roomId));
    if (roomIndex === -1) {
      throw new Error(`Room with ID ${roomId} not found`);
    }

    const room = this.rooms[roomIndex];
    
    this.rooms[roomIndex] = {
      ...room,
      status: 'Out of Order',
      blocked: true,
      blockReason: reason,
      lastUpdated: new Date().toISOString(),
      statusHistory: [
        ...room.statusHistory,
        {
          status: 'Out of Order',
          timestamp: new Date().toISOString(),
          changedFrom: room.status,
          changedBy: 'Current User',
          note: `Room blocked - ${reason}`
        }
      ]
    };

    return { ...this.rooms[roomIndex] };
  }

  async unblockRoom(roomId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roomIndex = this.rooms.findIndex(r => r.Id === parseInt(roomId));
    if (roomIndex === -1) {
      throw new Error(`Room with ID ${roomId} not found`);
    }

    const room = this.rooms[roomIndex];
    
    this.rooms[roomIndex] = {
      ...room,
      status: 'Available',
      blocked: false,
      blockReason: null,
      lastUpdated: new Date().toISOString(),
      statusHistory: [
        ...room.statusHistory,
        {
          status: 'Available',
          timestamp: new Date().toISOString(),
          changedFrom: room.status,
          changedBy: 'Current User',
          note: 'Room unblocked and made available'
        }
      ]
    };

    return { ...this.rooms[roomIndex] };
  }

  async addNote(roomId, noteContent) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const roomIndex = this.rooms.findIndex(r => r.Id === parseInt(roomId));
    if (roomIndex === -1) {
      throw new Error(`Room with ID ${roomId} not found`);
    }

    const room = this.rooms[roomIndex];
    const newNote = {
      id: Date.now(),
      content: noteContent,
      timestamp: new Date().toISOString(),
      addedBy: 'Current User',
      type: 'General'
    };

    this.rooms[roomIndex] = {
      ...room,
      notes: [...(room.notes || []), newNote],
      lastUpdated: new Date().toISOString()
    };

    return { ...this.rooms[roomIndex] };
  }

  async deleteNote(roomId, noteId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const roomIndex = this.rooms.findIndex(r => r.Id === parseInt(roomId));
    if (roomIndex === -1) {
      throw new Error(`Room with ID ${roomId} not found`);
    }

    const room = this.rooms[roomIndex];
    
    this.rooms[roomIndex] = {
      ...room,
      notes: (room.notes || []).filter(note => note.id !== noteId),
      lastUpdated: new Date().toISOString()
    };

    return { ...this.rooms[roomIndex] };
return { ...this.rooms[roomIndex] };
  }
}

export const roomService = new RoomService();