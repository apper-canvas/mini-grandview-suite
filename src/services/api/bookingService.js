import bookingsData from "@/services/mockData/bookings.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let bookings = [...bookingsData];

// Audit log storage
let auditLog = [];

const bookingService = {
  // Get all bookings
  async getAll() {
    await delay(300);
    return [...bookings];
  },

  // Get booking by ID
  async getById(id) {
    await delay(200);
    const booking = bookings.find(b => b.Id === parseInt(id));
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    return { ...booking };
  },

  // Get unpaid bookings
  async getUnpaidBookings() {
    await delay(250);
    return bookings.filter(b => b.paidAmount < b.totalAmount);
  },

  // Get filtered bookings
  async getFilteredBookings(filters) {
    await delay(300);
    let filtered = [...bookings];
    
    if (filters.status) {
      filtered = filtered.filter(b => b.status === filters.status);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(b => new Date(b.checkIn) >= new Date(filters.dateFrom));
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(b => new Date(b.checkOut) <= new Date(filters.dateTo));
    }
    
    if (filters.guestName) {
      filtered = filtered.filter(b => 
        b.guestName.toLowerCase().includes(filters.guestName.toLowerCase())
      );
    }
    
    return filtered;
  },

  // Update booking status
  async updateBookingStatus(id, newStatus) {
    await delay(400);
    const bookingIndex = bookings.findIndex(b => b.Id === parseInt(id));
    if (bookingIndex === -1) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    const oldStatus = bookings[bookingIndex].status;
    bookings[bookingIndex].status = newStatus;
    bookings[bookingIndex].updatedAt = new Date().toISOString();
    
    // Log audit entry
    this.logAuditEntry({
      bookingId: parseInt(id),
      action: 'status_update',
      oldValue: oldStatus,
      newValue: newStatus,
      timestamp: new Date().toISOString(),
      user: 'System' // In real app, would be current user
    });
    
    // Trigger housekeeping notification if needed
    if (newStatus === 'confirmed' || newStatus === 'checked_out') {
      await this.notifyHousekeeping(bookings[bookingIndex]);
    }
    
    return { ...bookings[bookingIndex] };
  },

  // Log audit entry
  logAuditEntry(entry) {
    auditLog.push({
      id: auditLog.length + 1,
      ...entry
    });
  },

  // Get audit log for booking
  async getAuditLog(bookingId) {
    await delay(200);
    return auditLog.filter(entry => entry.bookingId === parseInt(bookingId));
  },

  // Notify housekeeping service
  async notifyHousekeeping(booking) {
    try {
      // In real implementation, this would call housekeeping service
      console.log(`Housekeeping notified for room ${booking.roomNumber}`, {
        bookingId: booking.Id,
        guestName: booking.guestName,
        status: booking.status,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut
      });
    } catch (error) {
      console.error('Failed to notify housekeeping:', error);
    }
  },

  // Search available rooms
  async searchAvailableRooms(searchCriteria) {
    await delay(400);
    const { checkIn, checkOut, guests, roomTypes } = searchCriteria;
    
    // Import room data dynamically to avoid circular imports
    const roomsModule = await import("@/services/mockData/rooms.json");
    const rooms = roomsModule.default;
    
    // Check for conflicting bookings
    const conflictingBookings = bookings.filter(booking => {
      if (booking.status === 'cancelled') return false;
      
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      const searchCheckIn = new Date(checkIn);
      const searchCheckOut = new Date(checkOut);
      
      return (searchCheckIn < bookingCheckOut && searchCheckOut > bookingCheckIn);
    });
    
    const occupiedRoomNumbers = conflictingBookings.map(b => b.roomNumber);
    
    // Filter available rooms
    let availableRooms = rooms.filter(room => {
      const isNotOccupied = !occupiedRoomNumbers.includes(room.roomNumber);
      const isOperational = ['Available', 'Cleaning'].includes(room.status);
      const matchesRoomType = !roomTypes || roomTypes.length === 0 || roomTypes.includes(room.roomType);
      
      return isNotOccupied && isOperational && matchesRoomType;
    });
    
    // Add calculated pricing
    const nights = this.calculateNights(checkIn, checkOut);
    availableRooms = availableRooms.map(room => ({
      ...room,
      nights,
      subtotal: room.nightlyRate * nights,
      taxes: Math.round(room.nightlyRate * nights * 0.12 * 100) / 100,
      total: Math.round(room.nightlyRate * nights * 1.12 * 100) / 100,
      amenities: this.getRoomAmenities(room.roomType),
      photos: this.getRoomPhotos(room.roomType)
    }));
    
    return availableRooms;
  },

  // Calculate number of nights
  calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Calculate total cost
  calculateTotal(nightlyRate, nights) {
    const subtotal = nightlyRate * nights;
    const taxes = subtotal * 0.12;
    return {
      nights,
      subtotal: Math.round(subtotal * 100) / 100,
      taxes: Math.round(taxes * 100) / 100,
      total: Math.round((subtotal + taxes) * 100) / 100
    };
  },

  // Get room amenities based on type
  getRoomAmenities(roomType) {
    const amenityMap = {
      'Standard Queen': ['Free WiFi', 'Air Conditioning', 'TV', 'Coffee Maker'],
      'Standard King': ['Free WiFi', 'Air Conditioning', 'TV', 'Coffee Maker', 'Work Desk'],
      'Deluxe Queen': ['Free WiFi', 'Air Conditioning', 'TV', 'Coffee Maker', 'Balcony', 'Mini Fridge'],
      'Deluxe King': ['Free WiFi', 'Air Conditioning', 'TV', 'Coffee Maker', 'Work Desk', 'Balcony', 'Mini Fridge'],
      'Suite': ['Free WiFi', 'Air Conditioning', 'TV', 'Coffee Maker', 'Living Area', 'Kitchenette', 'Balcony'],
      'Penthouse Suite': ['Free WiFi', 'Air Conditioning', 'TV', 'Coffee Maker', 'Living Area', 'Full Kitchen', 'Balcony', 'Jacuzzi']
    };
    return amenityMap[roomType] || ['Free WiFi', 'Air Conditioning', 'TV'];
  },

  // Get room photos (placeholder URLs)
  getRoomPhotos(roomType) {
    return [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400'
    ];
  },

  // Create new booking
  async create(bookingData) {
    await delay(600);
    
    const newBooking = {
      ...bookingData,
Id: Math.max(...bookings.map(b => b.Id), 0) + 1,
      status: 'pending_payment',
      createdAt: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    
    // Log audit entry
    this.logAuditEntry({
      bookingId: newBooking.Id,
      action: 'booking_created',
      oldValue: null,
      newValue: newBooking,
      timestamp: new Date().toISOString(),
      user: 'System'
    });
    
    return { ...newBooking };
  },

  // Update booking
  async update(id, updateData) {
    await delay(400);
    const bookingIndex = bookings.findIndex(b => b.Id === parseInt(id));
    if (bookingIndex === -1) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    const oldBooking = { ...bookings[bookingIndex] };
    
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      ...updateData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    
    // Log audit entry
    this.logAuditEntry({
      bookingId: parseInt(id),
      action: 'booking_updated',
      oldValue: oldBooking,
      newValue: bookings[bookingIndex],
      timestamp: new Date().toISOString(),
      user: 'System'
    });
    
    return { ...bookings[bookingIndex] };
  },

  // Delete booking
  async delete(id) {
    await delay(300);
    const index = bookings.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    const deletedBooking = { ...bookings[index] };
    
    bookings.splice(index, 1);
    
    // Log audit entry
    this.logAuditEntry({
      bookingId: parseInt(id),
      action: 'booking_deleted',
      oldValue: deletedBooking,
      newValue: null,
      timestamp: new Date().toISOString(),
      user: 'System'
    });
    
    return { success: true };
  }
};
export default bookingService;