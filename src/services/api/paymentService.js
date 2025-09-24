import paymentsData from "@/services/mockData/payments.json";
import bookingsData from "@/services/mockData/bookings.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let payments = [...paymentsData];
let bookings = [...bookingsData];

const paymentService = {
  // Get all payments
  async getAll() {
    await delay(300);
    return [...payments].sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt));
  },

  // Get payment by ID
  async getById(id) {
    await delay(200);
    const payment = payments.find(p => p.Id === parseInt(id));
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    return { ...payment };
  },

  // Create new payment
  async create(paymentData) {
    await delay(500);
    
    const newPayment = {
      ...paymentData,
      Id: Math.max(...payments.map(p => p.Id), 0) + 1,
      processedAt: new Date().toISOString(),
      transactionId: `TXN_${new Date().getFullYear()}_${String(Math.max(...payments.map(p => p.Id), 0) + 1).padStart(3, '0')}`
    };
    
    payments.push(newPayment);
    return { ...newPayment };
  },

// Process payment
  async processPayment(paymentData) {
    await delay(800); // Simulate payment processing time
    
    // Simulate payment processing with 95% success rate
    const isSuccessful = Math.random() > 0.05;
    
    const payment = {
      ...paymentData,
      Id: Math.max(...payments.map(p => p.Id), 0) + 1,
      status: isSuccessful ? 'completed' : 'failed',
      processedAt: new Date().toISOString(),
      transactionId: `TXN_${new Date().getFullYear()}_${String(Math.max(...payments.map(p => p.Id), 0) + 1).padStart(3, '0')}`
    };
    
    payments.push(payment);
    
    // Update booking payment status if successful
    if (isSuccessful && paymentData.bookingId) {
      const bookingIndex = bookings.findIndex(b => b.Id === parseInt(paymentData.bookingId));
      if (bookingIndex !== -1) {
        bookings[bookingIndex] = {
          ...bookings[bookingIndex],
          paidAmount: paymentData.amount,
          status: 'confirmed'
        };
      }
    }
    
    if (!isSuccessful) {
      throw new Error('Payment processing failed. Please try again.');
    }
    
    return { ...payment };
  },

  // Delete payment
  async delete(id) {
    await delay(200);
    const index = payments.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    payments.splice(index, 1);
    return { success: true };
  },

  // Get payment statistics
  async getStats() {
    await delay(250);
    
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const todaysPayments = payments.filter(p => {
      const today = new Date().toDateString();
      const paymentDate = new Date(p.processedAt).toDateString();
      return paymentDate === today && p.status === 'completed';
    });
    
    const todaysRevenue = todaysPayments.reduce((sum, p) => sum + p.amount, 0);
    
    return {
      totalRevenue,
      todaysRevenue,
      totalTransactions: payments.filter(p => p.status === 'completed').length,
      todaysTransactions: todaysPayments.length,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      failedPayments: payments.filter(p => p.status === 'failed').length
    };
  }
};

export default paymentService;