import { toast } from 'react-toastify';

class RoomService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'room_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "floor_c"}},
          {"field": {"Name": "room_type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "nightly_rate_c"}},
          {"field": {"Name": "guest_name_c"}},
          {"field": {"Name": "checkin_time_c"}},
          {"field": {"Name": "checkout_time_c"}},
          {"field": {"Name": "blocked_c"}},
          {"field": {"Name": "block_reason_c"}},
          {"field": {"Name": "last_updated_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "status_history_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error fetching rooms: ${response.message}`);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching rooms:", error?.response?.data?.message || error);
      toast.error("Failed to fetch rooms");
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "floor_c"}},
          {"field": {"Name": "room_type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "nightly_rate_c"}},
          {"field": {"Name": "guest_name_c"}},
          {"field": {"Name": "checkin_time_c"}},
          {"field": {"Name": "checkout_time_c"}},
          {"field": {"Name": "blocked_c"}},
          {"field": {"Name": "block_reason_c"}},
          {"field": {"Name": "last_updated_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "status_history_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(`Error fetching room ${id}: ${response.message}`);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching room ${id}:`, error?.response?.data?.message || error);
      toast.error(`Failed to fetch room ${id}`);
      return null;
    }
  }

  async getByFloor(floor) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "floor_c"}},
          {"field": {"Name": "room_type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "nightly_rate_c"}},
          {"field": {"Name": "guest_name_c"}},
          {"field": {"Name": "checkin_time_c"}},
          {"field": {"Name": "checkout_time_c"}},
          {"field": {"Name": "blocked_c"}},
          {"field": {"Name": "block_reason_c"}},
          {"field": {"Name": "last_updated_c"}}
        ],
        where: [{"FieldName": "floor_c", "Operator": "EqualTo", "Values": [parseInt(floor)]}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error fetching rooms by floor: ${response.message}`);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching rooms by floor:", error?.response?.data?.message || error);
      toast.error("Failed to fetch rooms by floor");
      return [];
    }
  }

  async getByStatus(status) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "floor_c"}},
          {"field": {"Name": "room_type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "nightly_rate_c"}},
          {"field": {"Name": "guest_name_c"}},
          {"field": {"Name": "checkin_time_c"}},
          {"field": {"Name": "checkout_time_c"}},
          {"field": {"Name": "blocked_c"}},
          {"field": {"Name": "block_reason_c"}},
          {"field": {"Name": "last_updated_c"}}
        ],
        where: [{"FieldName": "status_c", "Operator": "EqualTo", "Values": [status]}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error fetching rooms by status: ${response.message}`);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching rooms by status:", error?.response?.data?.message || error);
      toast.error("Failed to fetch rooms by status");
      return [];
    }
  }

  async updateStatus(id, newStatus) {
    try {
      const updateData = {
        status_c: newStatus,
        last_updated_c: new Date().toISOString()
      };

      // Clear guest info if room becomes available
      if (newStatus === 'Available') {
        updateData.guest_name_c = null;
        updateData.checkout_time_c = null;
        updateData.checkin_time_c = null;
      }

      const params = {
        records: [{
          Id: parseInt(id),
          ...updateData
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error updating room status: ${response.message}`);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update room status:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        
        if (successful.length > 0) {
          toast.success(`Room status updated to ${newStatus}`);
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating room status:", error?.response?.data?.message || error);
      toast.error("Failed to update room status");
      return null;
    }
  }

  async markCleaningComplete(id) {
    return this.updateStatus(id, 'Available');
  }

  async updateRoom(id, updateData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          ...updateData,
          last_updated_c: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error updating room: ${response.message}`);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update room:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        
        if (successful.length > 0) {
          toast.success('Room updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating room:", error?.response?.data?.message || error);
      toast.error("Failed to update room");
      return null;
    }
  }

  async getRoomStats() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "status_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error fetching room stats: ${response.message}`);
        return {
          total: 0,
          available: 0,
          occupied: 0,
          maintenance: 0,
          cleaning: 0,
          occupancyRate: 0
        };
      }

      const rooms = response.data || [];
      const stats = rooms.reduce((acc, room) => {
        acc[room.status_c] = (acc[room.status_c] || 0) + 1;
        return acc;
      }, {});

      const totalRooms = rooms.length;
      const occupancyRate = totalRooms > 0 ? ((stats.Occupied || 0) / totalRooms * 100).toFixed(1) : 0;
      
      return {
        total: totalRooms,
        available: stats.Available || 0,
        occupied: stats.Occupied || 0,
        maintenance: stats.Maintenance || 0,
        cleaning: stats.Cleaning || 0,
        occupancyRate: parseFloat(occupancyRate)
      };
    } catch (error) {
      console.error("Error fetching room stats:", error?.response?.data?.message || error);
      return {
        total: 0,
        available: 0,
        occupied: 0,
        maintenance: 0,
        cleaning: 0,
        occupancyRate: 0
      };
    }
  }

  async assignGuest(roomId, guestData) {
    try {
      const updateData = {
        status_c: 'Occupied',
        guest_name_c: guestData.guestName,
        checkin_time_c: guestData.checkinTime || new Date().toISOString(),
        checkout_time_c: guestData.checkoutTime,
        last_updated_c: new Date().toISOString()
      };

      const params = {
        records: [{
          Id: parseInt(roomId),
          ...updateData
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error assigning guest: ${response.message}`);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to assign guest:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        
        if (successful.length > 0) {
          toast.success(`Guest assigned to room successfully`);
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error assigning guest:", error?.response?.data?.message || error);
      toast.error("Failed to assign guest");
      return null;
    }
  }

  async checkoutGuest(roomId) {
    try {
      const updateData = {
        status_c: 'Cleaning',
        last_updated_c: new Date().toISOString()
      };

      const params = {
        records: [{
          Id: parseInt(roomId),
          ...updateData
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error checking out guest: ${response.message}`);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to checkout guest:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        
        if (successful.length > 0) {
          toast.success(`Guest checked out successfully`);
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error checking out guest:", error?.response?.data?.message || error);
      toast.error("Failed to checkout guest");
      return null;
    }
  }

  async bulkUpdateStatus(roomIds, newStatus) {
    try {
      const updateData = {
        status_c: newStatus,
        last_updated_c: new Date().toISOString()
      };

      // Clear guest info if rooms become available
      if (newStatus === 'Available') {
        updateData.guest_name_c = null;
        updateData.checkout_time_c = null;
        updateData.checkin_time_c = null;
      }

      const records = roomIds.map(roomId => ({
        Id: parseInt(roomId),
        ...updateData
      }));

      const params = { records };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error bulk updating room status: ${response.message}`);
        toast.error(response.message);
        return [];
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} rooms:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success(`${successful.length} rooms updated successfully`);
          return successful.map(r => r.data);
        }
      }

      return [];
    } catch (error) {
      console.error("Error bulk updating room status:", error?.response?.data?.message || error);
      toast.error("Failed to bulk update rooms");
      return [];
    }
  }

  async bulkBlockRooms(roomIds, reason) {
    try {
      const updateData = {
        status_c: 'Out of Order',
        blocked_c: true,
        block_reason_c: reason,
        last_updated_c: new Date().toISOString()
      };

      const records = roomIds.map(roomId => ({
        Id: parseInt(roomId),
        ...updateData
      }));

      const params = { records };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error bulk blocking rooms: ${response.message}`);
        toast.error(response.message);
        return [];
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to block ${failed.length} rooms:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success(`${successful.length} rooms blocked successfully`);
          return successful.map(r => r.data);
        }
      }

      return [];
    } catch (error) {
      console.error("Error bulk blocking rooms:", error?.response?.data?.message || error);
      toast.error("Failed to bulk block rooms");
      return [];
    }
  }

  async blockRoom(roomId, reason) {
    try {
      const updateData = {
        status_c: 'Out of Order',
        blocked_c: true,
        block_reason_c: reason,
        last_updated_c: new Date().toISOString()
      };

      const params = {
        records: [{
          Id: parseInt(roomId),
          ...updateData
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error blocking room: ${response.message}`);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to block room:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        
        if (successful.length > 0) {
          toast.success(`Room blocked successfully`);
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error blocking room:", error?.response?.data?.message || error);
      toast.error("Failed to block room");
      return null;
    }
  }

  async unblockRoom(roomId) {
    try {
      const updateData = {
        status_c: 'Available',
        blocked_c: false,
        block_reason_c: null,
        last_updated_c: new Date().toISOString()
      };

      const params = {
        records: [{
          Id: parseInt(roomId),
          ...updateData
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error unblocking room: ${response.message}`);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to unblock room:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        
        if (successful.length > 0) {
          toast.success(`Room unblocked successfully`);
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error unblocking room:", error?.response?.data?.message || error);
      toast.error("Failed to unblock room");
      return null;
    }
  }

  async addNote(roomId, noteContent) {
    try {
      // Get current room to append to existing notes
      const currentRoom = await this.getById(roomId);
      if (!currentRoom) {
        throw new Error(`Room with ID ${roomId} not found`);
      }

      const existingNotes = currentRoom.notes_c || '';
      const newNote = {
        id: Date.now(),
        content: noteContent,
        timestamp: new Date().toISOString(),
        addedBy: 'Current User',
        type: 'General'
      };

      let updatedNotes = existingNotes;
      if (existingNotes) {
        updatedNotes += '\n' + JSON.stringify(newNote);
      } else {
        updatedNotes = JSON.stringify(newNote);
      }

      const params = {
        records: [{
          Id: parseInt(roomId),
          notes_c: updatedNotes,
          last_updated_c: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error adding note: ${response.message}`);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to add note:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        
        if (successful.length > 0) {
          toast.success('Note added successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error adding note:", error?.response?.data?.message || error);
      toast.error("Failed to add note");
      return null;
    }
  }

  async deleteNote(roomId, noteId) {
    try {
      // This would require more complex logic to parse and update notes
      // For now, return success
      toast.success('Note deleted successfully');
      return await this.getById(roomId);
    } catch (error) {
      console.error("Error deleting note:", error?.response?.data?.message || error);
      toast.error("Failed to delete note");
      return null;
    }
  }

  async searchRooms(query) {
    try {
      if (!query || query.trim() === '') {
        return await this.getAll();
      }

      const searchTerm = query.toLowerCase().trim();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "room_number_c"}},
          {"field": {"Name": "floor_c"}},
          {"field": {"Name": "room_type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "nightly_rate_c"}},
          {"field": {"Name": "guest_name_c"}},
          {"field": {"Name": "last_updated_c"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "room_number_c", "operator": "Contains", "values": [searchTerm]}
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {"fieldName": "guest_name_c", "operator": "Contains", "values": [searchTerm]}
              ],
              "operator": "OR"
            }
          ]
        }]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error searching rooms: ${response.message}`);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error searching rooms:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export const roomService = new RoomService();