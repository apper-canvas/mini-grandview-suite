import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { roomService } from "@/services/api/roomService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import RoomDetailsModal from "@/components/molecules/RoomDetailsModal";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Dashboard from "@/components/pages/Dashboard";
import Maintenance from "@/components/pages/Maintenance";
const Rooms = () => {
const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [floorFilter, setFloorFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, room: null });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(null);

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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleRoomClick = (room, e) => {
    if (bulkActionMode) {
      e.preventDefault();
      handleRoomSelection(room.Id);
      return;
    }
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleRoomSelection = (roomId) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleSelectAll = () => {
    const allRoomIds = filteredRooms.map(room => room.Id);
    setSelectedRooms(prev => 
      prev.length === allRoomIds.length ? [] : allRoomIds
    );
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedRooms.length === 0) return;
    
    try {
      await roomService.bulkUpdateStatus(selectedRooms, newStatus);
      setRooms(prev => prev.map(room => 
        selectedRooms.includes(room.Id) 
          ? { ...room, status: newStatus, lastUpdated: new Date().toISOString() }
          : room
      ));
      toast.success(`Updated ${selectedRooms.length} rooms to ${newStatus}`);
      setSelectedRooms([]);
      setBulkActionMode(false);
    } catch (error) {
      toast.error('Failed to update rooms');
    }
  };

  const handleBulkBlock = async (reason) => {
    if (selectedRooms.length === 0) return;
    
    try {
      await roomService.bulkBlockRooms(selectedRooms, reason);
      setRooms(prev => prev.map(room => 
        selectedRooms.includes(room.Id) 
          ? { 
              ...room, 
              status: 'Out of Order', 
              blocked: true, 
              blockReason: reason,
              lastUpdated: new Date().toISOString() 
            }
          : room
      ));
      toast.success(`Blocked ${selectedRooms.length} rooms`);
      setSelectedRooms([]);
    } catch (error) {
      toast.error('Failed to block rooms');
    }
  };

const handleRightClick = (e, room) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      room: room
    });
  };

  const handleDropdownToggle = (roomId, e) => {
    e.stopPropagation();
    setDropdownVisible(dropdownVisible === roomId ? null : roomId);
  };

  const handleDropdownAction = async (action, room) => {
    setDropdownVisible(null);
    
    switch (action) {
      case 'view':
        setSelectedRoom(room);
        setIsModalOpen(true);
        break;
      case 'assign':
        if (room.status === 'Available') {
          setSelectedRoom(room);
          setIsModalOpen(true);
        } else {
          toast.error('Room must be available to assign guests');
        }
        break;
      case 'maintenance':
        await handleStatusChange(room.Id, 'Maintenance');
        break;
      case 'addNote':
        setSelectedRoom(room);
        setIsModalOpen(true);
        toast.info('Click "Add Note" in the room details to add notes');
        break;
      case 'block':
        const reason = prompt('Enter reason for blocking room:');
        if (reason) {
          try {
            await roomService.blockRoom(room.Id, reason);
            setRooms(prev => prev.map(r => 
              r.Id === room.Id 
                ? { ...r, status: 'Out of Order', blocked: true, blockReason: reason }
                : r
            ));
            toast.success(`Room ${room.roomNumber} blocked`);
          } catch (error) {
            toast.error('Failed to block room');
          }
        }
        break;
      case 'unblock':
        try {
          await roomService.unblockRoom(room.Id);
          setRooms(prev => prev.map(r => 
            r.Id === room.Id 
              ? { ...r, status: 'Available', blocked: false, blockReason: null }
              : r
          ));
          toast.success(`Room ${room.roomNumber} unblocked`);
        } catch (error) {
          toast.error('Failed to unblock room');
        }
        break;
    }
  };

  const handleContextAction = async (action, room) => {
    setContextMenu({ visible: false, x: 0, y: 0, room: null });
    
    switch (action) {
      case 'view':
        setSelectedRoom(room);
        setIsModalOpen(true);
        break;
      case 'assign':
        if (room.status === 'Available') {
          setSelectedRoom(room);
          setIsModalOpen(true);
        } else {
          toast.error('Room must be available to assign guests');
        }
        break;
      case 'addNote':
        setSelectedRoom(room);
        setIsModalOpen(true);
        toast.info('Click "Add Note" in the room details to add notes');
        break;
      case 'block':
        const reason = prompt('Enter reason for blocking room:');
        if (reason) {
          try {
            await roomService.blockRoom(room.Id, reason);
            setRooms(prev => prev.map(r => 
              r.Id === room.Id 
                ? { ...r, status: 'Out of Order', blocked: true, blockReason: reason }
                : r
            ));
            toast.success(`Room ${room.roomNumber} blocked`);
          } catch (error) {
            toast.error('Failed to block room');
          }
        }
        break;
      case 'unblock':
        try {
          await roomService.unblockRoom(room.Id);
          setRooms(prev => prev.map(r => 
            r.Id === room.Id 
              ? { ...r, status: 'Available', blocked: false, blockReason: null }
              : r
          ));
          toast.success(`Room ${room.roomNumber} unblocked`);
        } catch (error) {
          toast.error('Failed to unblock room');
        }
        break;
      case 'maintenance':
        await handleStatusChange(room.Id, 'Maintenance');
        break;
      case 'cleaning':
        await handleStatusChange(room.Id, 'Cleaning');
        break;
    }
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, room: null });
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
    
    // Search functionality
    const matchesSearch = !searchQuery || 
      room.roomNumber.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.guestName && room.guestName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (room.bookingId && room.bookingId.toString().toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesFloor && matchesSearch;
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
{/* Filters and Bulk Actions */}
      <Card className="mb-6">
<CardContent className="py-4">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
              <input
                type="text"
                placeholder="Search by room number, guest name, or booking ID..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary hover:text-error"
                >
                  <ApperIcon name="X" className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
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
                <option value="Out of Order">Out of Order</option>
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

            {/* Bulk Action Toggle */}
            <Button
              variant={bulkActionMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setBulkActionMode(!bulkActionMode);
                setSelectedRooms([]);
              }}
              className="ml-auto"
            >
              <ApperIcon name="CheckSquare" className="h-4 w-4 mr-2" />
              {bulkActionMode ? 'Exit Bulk Mode' : 'Bulk Select'}
            </Button>

            {/* Results Count */}
            <div className="text-sm text-secondary">
              Showing {filteredRooms.length} of {rooms.length} rooms
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {bulkActionMode && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedRooms.length === filteredRooms.length && filteredRooms.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm font-medium">
                    {selectedRooms.length} of {filteredRooms.length} selected
                  </span>
                </div>

                {selectedRooms.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkStatusChange('Available')}
                    >
                      <ApperIcon name="Check" className="h-3 w-3 mr-1" />
                      Available
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkStatusChange('Maintenance')}
                    >
                      <ApperIcon name="Wrench" className="h-3 w-3 mr-1" />
                      Maintenance
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkStatusChange('Cleaning')}
                    >
                      <ApperIcon name="Sparkles" className="h-3 w-3 mr-1" />
                      Cleaning
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const reason = prompt('Enter reason for blocking rooms:');
                        if (reason) handleBulkBlock(reason);
                      }}
                      className="text-error hover:text-error"
                    >
                      <ApperIcon name="Ban" className="h-3 w-3 mr-1" />
                      Block
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
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
                  onClick={(e) => handleRoomClick(room, e)}
                  onContextMenu={(e) => handleRightClick(e, room)}
                  className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 bg-white relative ${
                    selectedRooms.includes(room.Id) 
                      ? 'border-primary bg-primary/5' 
                      : room.blocked 
                        ? 'border-error/50 bg-error/5' 
                        : 'border-slate-200 hover:border-primary/30'
                  }`}
                >
                  {bulkActionMode && (
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedRooms.includes(room.Id)}
                        onChange={() => handleRoomSelection(room.Id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-primary"
                      />
                    </div>
                  )}
<div className={`flex items-center justify-between mb-2 ${bulkActionMode ? 'ml-6' : ''}`}>
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Bed" className="h-4 w-4 text-slate-600" />
                      <span className="font-semibold text-slate-900">{room.roomNumber}</span>
                      {room.blocked && (
                        <ApperIcon name="Ban" className="h-4 w-4 text-error" title="Room Blocked" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(room.status)}>
                        <ApperIcon name={getStatusIcon(room.status)} className="h-3 w-3 mr-1" />
                        {room.status}
                      </Badge>
                      {!bulkActionMode && (
                        <div className="relative">
                          <button
                            onClick={(e) => handleDropdownToggle(room.Id, e)}
                            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <ApperIcon name="MoreVertical" className="h-4 w-4 text-slate-500" />
                          </button>
                          {dropdownVisible === room.Id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setDropdownVisible(null)}
                              />
                              <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50 min-w-48">
                                <button
                                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm"
                                  onClick={() => handleDropdownAction('view', room)}
                                >
                                  <ApperIcon name="Eye" className="h-4 w-4" />
                                  View Details
                                </button>
                                
                                {room.status === 'Available' && (
                                  <button
                                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm"
                                    onClick={() => handleDropdownAction('assign', room)}
                                  >
                                    <ApperIcon name="UserPlus" className="h-4 w-4" />
                                    Assign Guest
                                  </button>
                                )}
                                
                                <button
                                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm"
                                  onClick={() => handleDropdownAction('maintenance', room)}
                                >
                                  <ApperIcon name="Wrench" className="h-4 w-4" />
                                  Schedule Maintenance
                                </button>
                                
                                <button
                                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm"
                                  onClick={() => handleDropdownAction('addNote', room)}
                                >
                                  <ApperIcon name="MessageSquare" className="h-4 w-4" />
                                  Add Notes
                                </button>

                                <div className="border-t my-1" />
                                
                                {!room.blocked ? (
                                  <button
                                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm text-error"
                                    onClick={() => handleDropdownAction('block', room)}
                                  >
                                    <ApperIcon name="Ban" className="h-4 w-4" />
                                    Block Room
                                  </button>
                                ) : (
                                  <button
                                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm text-success"
                                    onClick={() => handleDropdownAction('unblock', room)}
                                  >
                                    <ApperIcon name="CheckCircle" className="h-4 w-4" />
                                    Unblock Room
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
<div className={`space-y-1 mb-3 ${bulkActionMode ? 'ml-6' : ''}`}>
                    <p className="text-sm text-slate-600">{room.roomType}</p>
                    <p className="text-sm font-medium text-slate-900">${room.nightlyRate}/night</p>
                    {room.status === 'Occupied' && room.guestName && (
                      <>
                        <p className="text-sm text-slate-700">Guest: {room.guestName}</p>
                        <p className="text-xs text-slate-500">Check-out: {room.checkoutTime}</p>
                      </>
                    )}
                    {room.blocked && room.blockReason && (
                      <p className="text-xs text-error">Blocked: {room.blockReason}</p>
                    )}
                    {room.notes && room.notes.length > 0 && (
                      <div className="flex items-center gap-1">
                        <ApperIcon name="MessageSquare" className="h-3 w-3 text-secondary" />
                        <p className="text-xs text-secondary">{room.notes.length} note(s)</p>
                      </div>
                    )}
                  </div>

{!bulkActionMode && (
                    <div className="flex gap-1 flex-wrap">
                      {['Available', 'Occupied', 'Maintenance', 'Cleaning'].map(status => (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(room.Id, status);
                          }}
                          disabled={room.blocked && status !== 'Available'}
                          className={`px-2 py-1 text-xs rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            room.status === status 
                              ? 'bg-primary text-white' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
</div>
                  )}
                </div>
              ))}
                  
                  <p className="text-xs text-slate-400 mt-2">
                    Updated: {room.lastUpdated && !isNaN(new Date(room.lastUpdated))
                      ? new Date(room.lastUpdated).toLocaleTimeString()
                      : 'Unknown'
                    }
                  </p>
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
        onRoomUpdate={loadRooms}
      />

{/* Context Menu */}
      {contextMenu.visible && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeContextMenu}
          />
          <div 
            className="fixed bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50 min-w-48"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextAction('view', contextMenu.room)}
            >
              <ApperIcon name="Eye" className="h-4 w-4" />
              View Details
            </button>
            
            {contextMenu.room?.status === 'Available' && (
              <button
                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                onClick={() => handleContextAction('assign', contextMenu.room)}
              >
                <ApperIcon name="UserPlus" className="h-4 w-4" />
                Assign Guest
              </button>
            )}
            
            <button
              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextAction('addNote', contextMenu.room)}
            >
              <ApperIcon name="MessageSquare" className="h-4 w-4" />
              Add Notes
            </button>
            
            {!contextMenu.room?.blocked ? (
              <button
                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-error"
                onClick={() => handleContextAction('block', contextMenu.room)}
              >
                <ApperIcon name="Ban" className="h-4 w-4" />
                Block Room
              </button>
            ) : (
              <button
                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-success"
                onClick={() => handleContextAction('unblock', contextMenu.room)}
              >
                <ApperIcon name="CheckCircle" className="h-4 w-4" />
                Unblock Room
              </button>
            )}

            <div className="border-t my-1" />
            
            <button
              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextAction('maintenance', contextMenu.room)}
            >
              <ApperIcon name="Wrench" className="h-4 w-4" />
              Set Maintenance
            </button>
            
            <button
              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextAction('cleaning', contextMenu.room)}
            >
              <ApperIcon name="Sparkles" className="h-4 w-4" />
              Set Cleaning
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Rooms;