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
  }
};

export default bookingService;