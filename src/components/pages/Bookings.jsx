import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { toast } from "react-toastify";
import paymentService from "@/services/api/paymentService";
import bookingService from "@/services/api/bookingService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Dashboard from "@/components/pages/Dashboard";
import Rooms from "@/components/pages/Rooms";

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomTypes: []
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    email: '',
    phone: '',
    specialRequests: '',
    paymentMethod: 'card'
  });

  const roomTypes = ['Standard Queen', 'Standard King', 'Deluxe Queen', 'Deluxe King', 'Suite', 'Penthouse Suite'];

  useEffect(() => {
    if (activeTab === 'manage') {
      loadBookings();
    }
  }, [activeTab]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const bookingData = await bookingService.getAll();
      setBookings(bookingData);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchCriteria.checkIn || !searchCriteria.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (new Date(searchCriteria.checkIn) >= new Date(searchCriteria.checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    try {
      setLoading(true);
      const rooms = await bookingService.searchAvailableRooms(searchCriteria);
      setAvailableRooms(rooms);
      if (rooms.length === 0) {
        toast.info('No rooms available for selected dates');
      } else {
        toast.success(`Found ${rooms.length} available rooms`);
      }
    } catch (error) {
      toast.error('Failed to search rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingForm.guestName || !bookingForm.email || !bookingForm.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Create booking
      const bookingData = {
        guestName: bookingForm.guestName,
        email: bookingForm.email,
        phone: bookingForm.phone,
        roomNumber: selectedRoom.roomNumber,
        checkIn: searchCriteria.checkIn,
        checkOut: searchCriteria.checkOut,
        totalAmount: selectedRoom.total,
        paidAmount: selectedRoom.total,
        specialRequests: bookingForm.specialRequests
      };

      const newBooking = await bookingService.create(bookingData);
      
      // Process payment
      const paymentData = {
        bookingId: newBooking.Id,
        guestName: bookingForm.guestName,
        roomNumber: selectedRoom.roomNumber,
        amount: selectedRoom.total,
        paymentMethod: bookingForm.paymentMethod,
        cardBrand: 'Visa',
        cardLastFour: '4242'
      };

      await paymentService.processPayment(paymentData);

      toast.success('Booking confirmed successfully!');
      
      // Simulate email confirmation
      setTimeout(() => {
        toast.info(`Confirmation email sent to ${bookingForm.email}`);
      }, 1000);

      // Reset form and close modal
      setShowBookingForm(false);
      setSelectedRoom(null);
      setBookingForm({
        guestName: '',
        email: '',
        phone: '',
        specialRequests: '',
        paymentMethod: 'card'
      });

      // Refresh search results
      handleSearch();
      
    } catch (error) {
      toast.error(error.message || 'Failed to process booking');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomTypeToggle = (roomType) => {
    setSearchCriteria(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.includes(roomType)
        ? prev.roomTypes.filter(type => type !== roomType)
        : [...prev.roomTypes, roomType]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'confirmed': return 'available';
      case 'pending_payment': return 'warning';
      case 'cancelled': return 'maintenance';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 gradient-text mb-2">
          Booking Management
        </h1>
        <div className="flex items-center space-x-2 text-sm text-secondary">
          <ApperIcon name="Home" size={14} />
          <span>Dashboard</span>
          <ApperIcon name="ChevronRight" size={14} />
          <span className="text-slate-900 font-medium">Bookings</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ApperIcon name="Search" className="h-4 w-4 mr-2 inline" />
              Search & Book
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'manage'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ApperIcon name="Calendar" className="h-4 w-4 mr-2 inline" />
              Manage Reservations
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* Search & Book Tab */}
      {activeTab === 'search' && (
        <>
          {/* Search Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ApperIcon name="Search" className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-slate-900">Search Available Rooms</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Check-in Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Check-in Date</label>
                  <input
                    type="date"
                    value={searchCriteria.checkIn}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, checkIn: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Check-out Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Check-out Date</label>
                  <input
                    type="date"
                    value={searchCriteria.checkOut}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, checkOut: e.target.value }))}
                    min={searchCriteria.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Guests</label>
                  <select
                    value={searchCriteria.guests}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Search" className="h-4 w-4 mr-2" />
                        Search Rooms
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Room Type Filters */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Room Types (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {roomTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => handleRoomTypeToggle(type)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        searchCriteria.roomTypes.includes(type)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-primary'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Results */}
          {availableRooms.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Home" className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-slate-900">Available Rooms</h3>
                  <Badge variant="default">{availableRooms.length} rooms found</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {availableRooms.map(room => (
                    <div key={room.Id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Room Image */}
                      <div className="h-48 bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center">
                        <ApperIcon name="Camera" className="h-12 w-12 text-slate-400" />
                      </div>

                      {/* Room Details */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900">Room {room.roomNumber}</h4>
                            <p className="text-sm text-slate-600">{room.roomType}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">Floor {room.floor}</p>
                            <p className="text-lg font-bold text-primary">${room.nightlyRate}/night</p>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-slate-700 mb-2">Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.slice(0, 4).map((amenity, index) => (
                              <span key={index} className="px-2 py-1 bg-slate-100 text-xs text-slate-600 rounded">
                                {amenity}
                              </span>
                            ))}
                            {room.amenities.length > 4 && (
                              <span className="px-2 py-1 bg-slate-100 text-xs text-slate-600 rounded">
                                +{room.amenities.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pricing Summary */}
                        <div className="border-t border-slate-100 pt-3 mb-4">
                          <div className="flex justify-between text-sm text-slate-600 mb-1">
                            <span>{room.nights} nights × ${room.nightlyRate}</span>
                            <span>${room.subtotal}</span>
                          </div>
                          <div className="flex justify-between text-sm text-slate-600 mb-1">
                            <span>Taxes & fees</span>
                            <span>${room.taxes}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold text-slate-900 border-t border-slate-100 pt-2">
                            <span>Total</span>
                            <span>${room.total}</span>
                          </div>
                        </div>

                        {/* Book Button */}
                        <Button
                          onClick={() => handleBookRoom(room)}
                          className="w-full"
                        >
                          <ApperIcon name="Calendar" className="h-4 w-4 mr-2" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Manage Reservations Tab */}
      {activeTab === 'manage' && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ApperIcon name="Calendar" className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">Current Reservations</h3>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-4"></div>
                <p className="text-secondary">Loading reservations...</p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Guest</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Room</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Check-in</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Check-out</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.Id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-900">{booking.guestName}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-900">{booking.roomNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(booking.checkIn)}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(booking.checkOut)}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">${booking.totalAmount}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            {booking.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p className="text-slate-600">{booking.email}</p>
                            <p className="text-slate-600">{booking.phone}</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center mb-4">
                  <ApperIcon name="Calendar" className="h-10 w-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Reservations Found</h3>
                <p className="text-secondary max-w-md mx-auto">
                  No current reservations to display. New bookings will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Complete Booking</h3>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>

              {/* Room Summary */}
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-slate-900 mb-2">Room {selectedRoom.roomNumber}</h4>
                <p className="text-sm text-slate-600 mb-2">{selectedRoom.roomType}</p>
                <p className="text-sm text-slate-600 mb-2">
                  {formatDate(searchCriteria.checkIn)} - {formatDate(searchCriteria.checkOut)}
                </p>
                <p className="text-lg font-semibold text-slate-900">Total: ${selectedRoom.total}</p>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.guestName}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, guestName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter guest full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="guest@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Special Requests</label>
                  <textarea
                    value={bookingForm.specialRequests}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Any special requests or preferences..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                  <select
                    value={bookingForm.paymentMethod}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="card">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;