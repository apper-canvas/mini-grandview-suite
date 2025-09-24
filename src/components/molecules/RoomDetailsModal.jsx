import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { roomService } from "@/services/api/roomService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const RoomDetailsModal = ({ room, isOpen, onClose, onStatusChange, onRoomUpdate }) => {
const [isUpdating, setIsUpdating] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [guestData, setGuestData] = useState({
    guestName: '',
    checkoutTime: ''
  });

  if (!isOpen || !room) return null;

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(room.Id, newStatus);
      if (newStatus === 'Available') {
        setShowGuestForm(false);
        setGuestData({ guestName: '', checkoutTime: '' });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGuestAssignment = async () => {
    if (!guestData.guestName.trim()) {
      toast.error('Please enter guest name');
      return;
    }

    setIsUpdating(true);
    try {
      const checkoutDate = new Date();
      checkoutDate.setDate(checkoutDate.getDate() + 1);
      checkoutDate.setHours(11, 0, 0, 0);

      await roomService.assignGuest(room.Id, {
        guestName: guestData.guestName,
        checkoutTime: guestData.checkoutTime || checkoutDate.toISOString()
      });

      await onStatusChange(room.Id, 'Occupied');
      setShowGuestForm(false);
      setGuestData({ guestName: '', checkoutTime: '' });
      toast.success(`Guest ${guestData.guestName} checked into room ${room.roomNumber}`);
    } catch (error) {
      toast.error('Failed to assign guest');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckout = async () => {
    if (!confirm(`Check out guest from room ${room.roomNumber}?`)) return;
    
    setIsUpdating(true);
    try {
      await roomService.checkoutGuest(room.Id);
      await onStatusChange(room.Id, 'Cleaning');
      toast.success(`Guest checked out from room ${room.roomNumber}`);
    } catch (error) {
      toast.error('Failed to check out guest');
    } finally {
      setIsUpdating(false);
    }
};

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setIsUpdating(true);
    try {
      await roomService.addNote(room.Id, newNote);
      setNewNote('');
      setShowNotesForm(false);
      toast.success('Note added successfully');
      onRoomUpdate && onRoomUpdate();
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBlockRoom = async () => {
    const reason = prompt('Enter reason for blocking room:');
    if (!reason) return;

    setIsUpdating(true);
    try {
      await roomService.blockRoom(room.Id, reason);
      await onStatusChange(room.Id, 'Out of Order');
      toast.success(`Room ${room.roomNumber} blocked`);
    } catch (error) {
      toast.error('Failed to block room');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnblockRoom = async () => {
    if (!confirm(`Unblock room ${room.roomNumber}?`)) return;

    setIsUpdating(true);
    try {
      await roomService.unblockRoom(room.Id);
      await onStatusChange(room.Id, 'Available');
      toast.success(`Room ${room.roomNumber} unblocked`);
    } catch (error) {
      toast.error('Failed to unblock room');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Available': return 'available';
      case 'Occupied': return 'occupied';
      case 'Maintenance': return 'maintenance';
      case 'Cleaning': return 'cleaning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available': return 'CheckCircle';
      case 'Occupied': return 'User';
      case 'Maintenance': return 'Wrench';
      case 'Cleaning': return 'Sparkles';
      default: return 'Circle';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ApperIcon name="Bed" className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Room {room.roomNumber}</h2>
                  <p className="text-sm text-secondary">{room.roomType} • Floor {room.floor}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(room.status)}>
                  <ApperIcon name={getStatusIcon(room.status)} className="h-3 w-3 mr-1" />
                  {room.status}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Room Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Room Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary">Room Type:</span>
                    <span className="font-medium">{room.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Nightly Rate:</span>
                    <span className="font-medium">${room.nightlyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Floor:</span>
                    <span className="font-medium">{room.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(room.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Guest Information */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Guest Information</h3>
                {room.status === 'Occupied' && room.guestName ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary">Guest:</span>
                      <span className="font-medium">{room.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Check-in:</span>
                      <span className="font-medium">
                        {room.checkinTime ? new Date(room.checkinTime).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Check-out:</span>
                      <span className="font-medium">
                        {room.checkoutTime ? new Date(room.checkoutTime).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-secondary">No guest currently assigned</p>
                )}
              </div>
            </div>

            {/* Status Management */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Status Management</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Available', 'Occupied', 'Maintenance', 'Cleaning'].map(status => (
                  <Button
                    key={status}
                    variant={room.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                    disabled={isUpdating}
                    className="flex items-center gap-2"
                  >
                    <ApperIcon name={getStatusIcon(status)} className="h-3 w-3" />
                    {status}
                  </Button>
                ))}
              </div>

              {/* Guest Assignment Form */}
              {room.status === 'Available' && (
                <div className="border rounded-lg p-4 bg-slate-50">
                  {!showGuestForm ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowGuestForm(true)}
                      className="w-full"
                    >
                      <ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
                      Assign Guest
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-900">Assign Guest</h4>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Guest Name
                        </label>
                        <input
                          type="text"
                          value={guestData.guestName}
                          onChange={(e) => setGuestData(prev => ({...prev, guestName: e.target.value}))}
                          placeholder="Enter guest name"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Check-out Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={guestData.checkoutTime ? guestData.checkoutTime.split('T')[0] : ''}
                          onChange={(e) => setGuestData(prev => ({...prev, checkoutTime: e.target.value ? new Date(e.target.value).toISOString() : ''}))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleGuestAssignment}
                          disabled={isUpdating}
                        >
                          Assign Guest
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowGuestForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Checkout Button */}
              {room.status === 'Occupied' && room.guestName && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCheckout}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ApperIcon name="LogOut" className="h-4 w-4" />
                  Check Out Guest
                </Button>
)}

              {/* Room Blocking Controls */}
              <div className="border rounded-lg p-4 bg-slate-50 mt-4">
                <h4 className="font-medium text-slate-900 mb-3">Room Management</h4>
                <div className="flex gap-2">
                  {!room.blocked ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBlockRoom}
                      disabled={isUpdating}
                      className="text-error hover:text-error"
                    >
                      <ApperIcon name="Ban" className="h-4 w-4 mr-2" />
                      Block Room
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleUnblockRoom}
                      disabled={isUpdating}
                      className="text-success hover:text-success"
                    >
                      <ApperIcon name="CheckCircle" className="h-4 w-4 mr-2" />
                      Unblock Room
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowNotesForm(!showNotesForm)}
                  >
                    <ApperIcon name="MessageSquare" className="h-4 w-4 mr-2" />
                    {showNotesForm ? 'Cancel Note' : 'Add Note'}
                  </Button>
                </div>

                {room.blocked && room.blockReason && (
                  <div className="mt-3 p-2 bg-error/10 border border-error/20 rounded">
                    <p className="text-sm font-medium text-error">Blocked</p>
                    <p className="text-sm text-error/80">Reason: {room.blockReason}</p>
                  </div>
                )}

                {/* Add Note Form */}
                {showNotesForm && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Enter maintenance or housekeeping note..."
                      rows="3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleAddNote}
                        disabled={isUpdating || !newNote.trim()}
                      >
                        Add Note
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setShowNotesForm(false);
                          setNewNote('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status History */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Status History</h3>
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {room.statusHistory && room.statusHistory.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {room.statusHistory.slice(-10).reverse().map((entry, index) => (
                      <div key={index} className="p-3 hover:bg-slate-50">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={getStatusBadgeVariant(entry.status)} className="text-xs">
                            {entry.status}
                          </Badge>
                          <span className="text-xs text-secondary">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          {entry.changedFrom && (
                            <span>Changed from {entry.changedFrom} • </span>
                          )}
                          <span>By: {entry.changedBy}</span>
                          {entry.guestName && (
                            <span> • Guest: {entry.guestName}</span>
                          )}
                        </div>
                        {entry.note && (
                          <p className="text-xs text-slate-500 mt-1">{entry.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-secondary">
                    No status history available
                  </div>
                )}
              </div>
</div>

            {/* Notes Section */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Notes & Comments</h3>
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {room.notes && room.notes.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {room.notes.slice(-10).reverse().map((note, index) => (
                      <div key={index} className="p-3 hover:bg-slate-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{note.type || 'General'}</span>
                          <span className="text-xs text-secondary">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{note.content}</p>
                        <p className="text-xs text-slate-400 mt-1">By: {note.addedBy}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-secondary">
                    No notes available
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoomDetailsModal;