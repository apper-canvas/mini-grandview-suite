import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import bookingService from "@/services/api/bookingService";
import { toast } from "react-toastify";

const PaymentModal = ({ isOpen, onClose, onPaymentComplete }) => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadUnpaidBookings();
    }
  }, [isOpen]);

  const loadUnpaidBookings = async () => {
    try {
      setLoading(true);
      const unpaidBookings = await bookingService.getUnpaidBookings();
      setBookings(unpaidBookings);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedBooking) {
      newErrors.booking = 'Please select a booking';
    }
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter expiry date (MM/YY)';
    }
    
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    if (value.length <= 19) {
      setFormData(prev => ({ ...prev, cardNumber: value }));
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    if (value.length <= 5) {
      setFormData(prev => ({ ...prev, expiryDate: value }));
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setFormData(prev => ({ ...prev, cvv: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const paymentData = {
        bookingId: selectedBooking.Id,
        guestName: selectedBooking.guestName,
        roomNumber: selectedBooking.roomNumber,
        amount: selectedBooking.totalAmount - selectedBooking.paidAmount,
        method: 'card',
        cardLastFour: formData.cardNumber.slice(-4).replace(/\s/g, ''),
        cardBrand: getCardBrand(formData.cardNumber),
        items: [
          { description: `Room Charge - ${selectedBooking.roomNumber}`, amount: selectedBooking.totalAmount - selectedBooking.paidAmount }
        ]
      };
      
      await onPaymentComplete(paymentData);
      
      // Reset form
      setFormData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      });
      setSelectedBooking(null);
      setErrors({});
      
      onClose();
    } catch (error) {
      toast.error(error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const getCardBrand = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Unknown';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon name="CreditCard" size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">Process Payment</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <ApperIcon name="X" size={16} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Booking Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Booking
              </label>
              {loading ? (
                <div className="h-20 bg-slate-100 rounded animate-pulse"></div>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {bookings.map(booking => (
                    <div
                      key={booking.Id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedBooking?.Id === booking.Id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900">{booking.guestName}</p>
                          <p className="text-sm text-slate-600">Room {booking.roomNumber}</p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          ${(booking.totalAmount - booking.paidAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.booking && <p className="text-sm text-error mt-1">{errors.booking}</p>}
            </div>

            {/* Card Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Payment Details</h4>
              
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors.cardNumber && <p className="text-sm text-error mt-1">{errors.cardNumber}</p>}
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.expiryDate && <p className="text-sm text-error mt-1">{errors.expiryDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.cvv && <p className="text-sm text-error mt-1">{errors.cvv}</p>}
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors.cardholderName && <p className="text-sm text-error mt-1">{errors.cardholderName}</p>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="CreditCard" size={16} />
                    <span>
                      Process Payment
                      {selectedBooking && ` ($${(selectedBooking.totalAmount - selectedBooking.paidAmount).toFixed(2)})`}
                    </span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;