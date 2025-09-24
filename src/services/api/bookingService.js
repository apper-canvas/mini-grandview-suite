import bookingsData from "@/services/mockData/bookings.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let bookings = [...bookingsData];

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
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    return { ...newBooking };
  },

  // Update booking
  async update(id, updateData) {
    await delay(400);
    const bookingIndex = bookings.findIndex(b => b.Id === parseInt(id));
    if (bookingIndex === -1) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      ...updateData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    
    return { ...bookings[bookingIndex] };
  },

  // Delete booking
  async delete(id) {
    await delay(300);
    const index = bookings.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    bookings.splice(index, 1);
    return { success: true };
  }
};
export default bookingService;