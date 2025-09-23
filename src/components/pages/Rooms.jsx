import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import RoomDetailsModal from "@/components/molecules/RoomDetailsModal";
import { roomService } from "@/services/api/roomService";
import { toast } from "react-toastify";
const Rooms = () => {
const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [floorFilter, setFloorFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const roomData = await roomService.getAll();
      setRooms(roomData);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await roomService.updateStatus(roomId, newStatus);
      setRooms(prev => prev.map(room => 
        room.Id === roomId 
          ? { ...room, status: newStatus, lastUpdated: new Date().toISOString() }
          : room
      ));
      toast.success(`Room ${rooms.find(r => r.Id === roomId)?.roomNumber} status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update room status');
    }
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
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

  const filteredRooms = rooms.filter(room => {
    const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
    const matchesFloor = floorFilter === 'All' || room.floor.toString() === floorFilter;
    return matchesStatus && matchesFloor;
  });

  const groupedByFloor = filteredRooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {});

  const floors = Object.keys(groupedByFloor).sort((a, b) => parseInt(a) - parseInt(b));

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Room Management</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-secondary">Loading rooms...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 gradient-text mb-2">
          Room Management
        </h1>
        <div className="flex items-center space-x-2 text-sm text-secondary">
          <ApperIcon name="Home" size={14} />
          <span>Dashboard</span>
          <ApperIcon name="ChevronRight" size={14} />
          <span className="text-slate-900 font-medium">Rooms</span>
        </div>
      </div>

      {/* Placeholder Content */}
{/* Filter Bar */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <ApperIcon name="Filter" className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary">Status:</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Cleaning">Cleaning</option>
              </select>
            </div>

            {/* Floor Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary">Floor:</span>
              <select 
                value={floorFilter} 
                onChange={(e) => setFloorFilter(e.target.value)}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All Floors</option>
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="ml-auto text-sm text-secondary">
              Showing {filteredRooms.length} of {rooms.length} rooms
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Status Board */}
      {floors.map(floor => (
        <Card key={floor} className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Building" className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-slate-900">Floor {floor}</h3>
                <Badge variant="default">{groupedByFloor[floor].length} rooms</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedByFloor[floor].map(room => (
                <div 
                  key={room.Id}
                  onClick={() => handleRoomClick(room)}
                  className="p-4 border border-slate-200 rounded-lg cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 bg-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Bed" className="h-4 w-4 text-slate-600" />
                      <span className="font-semibold text-slate-900">{room.roomNumber}</span>
                    </div>
                    <Badge variant={getStatusBadgeVariant(room.status)}>
                      <ApperIcon name={getStatusIcon(room.status)} className="h-3 w-3 mr-1" />
                      {room.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-slate-600">{room.roomType}</p>
                    <p className="text-sm font-medium text-slate-900">${room.nightlyRate}/night</p>
                    {room.status === 'Occupied' && room.guestName && (
                      <>
                        <p className="text-sm text-slate-700">Guest: {room.guestName}</p>
                        <p className="text-xs text-slate-500">Check-out: {room.checkoutTime}</p>
                      </>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {['Available', 'Occupied', 'Maintenance', 'Cleaning'].map(status => (
                      <button
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(room.Id, status);
                        }}
                        className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                          room.status === status 
                            ? 'bg-primary text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-slate-400 mt-2">
                    Updated: {new Date(room.lastUpdated).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredRooms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center mb-4">
              <ApperIcon name="Search" className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Rooms Found</h3>
            <p className="text-secondary max-w-md mx-auto">
              No rooms match your current filter criteria. Try adjusting your filters to see more results.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Room Details Modal */}
      <RoomDetailsModal 
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Rooms;