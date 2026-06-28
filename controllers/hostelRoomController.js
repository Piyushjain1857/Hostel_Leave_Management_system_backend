const db = require('../config/db');

// @desc    Get all Hostels
// @route   GET /api/hostels
// @access  Private
exports.getHostels = async (req, res) => {
  try {
    const hostels = await db.query('SELECT * FROM Hostels');
    const wardens = await db.query('SELECT * FROM wardens');
    
    const enriched = hostels.map(h => ({
      ...h,
      wardenName: wardens.find(w => w.id === h.wardenId)?.name || 'Unassigned'
    }));
    
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add Hostel
// @route   POST /api/hostels
// @access  Private
exports.addHostel = async (req, res) => {
  try {
    const { hostelName, capacity, occupiedRooms, wardenId } = req.body;
    await db.query('INSERT INTO Hostels (hostelName, capacity, occupiedRooms, wardenId) VALUES (?, ?, ?, ?)', 
      [hostelName, capacity, occupiedRooms, wardenId]);
    res.status(201).json({ message: 'Hostel added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update Hostel
// @route   PUT /api/hostels/:id
// @access  Private
exports.updateHostel = async (req, res) => {
  try {
    const { hostelName, capacity, occupiedRooms, wardenId } = req.body;
    await db.query('UPDATE Hostels SET hostelName = ?, capacity = ?, occupiedRooms = ?, wardenId = ? WHERE id = ?', 
      [hostelName, capacity, occupiedRooms, wardenId, req.params.id]);
    res.json({ message: 'Hostel updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete Hostel
// @route   DELETE /api/hostels/:id
// @access  Private
exports.deleteHostel = async (req, res) => {
  try {
    await db.query('DELETE FROM Hostels WHERE id = ?', [req.params.id]);
    res.json({ message: 'Hostel deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all Rooms
// @route   GET /api/rooms
// @access  Private
exports.getRooms = async (req, res) => {
  try {
    const rooms = await db.query('SELECT * FROM Rooms');
    const hostels = await db.query('SELECT * FROM Hostels');
    
    const enriched = rooms.map(r => ({
      ...r,
      hostelName: hostels.find(h => h.id === r.hostelId)?.hostelName || 'Unknown'
    }));
    
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add Room
// @route   POST /api/rooms
// @access  Private
exports.addRoom = async (req, res) => {
  try {
    const { roomNumber, hostelId, capacity, occupied } = req.body;
    await db.query('INSERT INTO Rooms (roomNumber, hostelId, capacity, occupied) VALUES (?, ?, ?, ?)', 
      [roomNumber, hostelId, capacity, occupied]);
    res.status(201).json({ message: 'Room added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update Room
// @route   PUT /api/rooms/:id
// @access  Private
exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, hostelId, capacity, occupied } = req.body;
    await db.query('UPDATE Rooms SET roomNumber = ?, hostelId = ?, capacity = ?, occupied = ? WHERE id = ?', 
      [roomNumber, hostelId, capacity, occupied, req.params.id]);
    res.json({ message: 'Room updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete Room
// @route   DELETE /api/rooms/:id
// @access  Private
exports.deleteRoom = async (req, res) => {
  try {
    await db.query('DELETE FROM Rooms WHERE id = ?', [req.params.id]);
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
