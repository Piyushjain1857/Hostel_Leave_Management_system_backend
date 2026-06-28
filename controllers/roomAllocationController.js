const db = require('../config/db');

exports.getAllocations = async (req, res) => {
  try {
    const allocations = await db.query('SELECT * FROM RoomAllocations');
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addAllocation = async (req, res) => {
  try {
    const { studentId, roomId, allocationDate } = req.body;
    await db.query(
      'INSERT INTO RoomAllocations (studentId, roomId, allocationDate) VALUES (?, ?, ?)',
      [studentId, roomId, allocationDate]
    );
    res.status(201).json({ message: 'Allocation added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomId } = req.body;
    await db.query('UPDATE RoomAllocations SET roomId = ? WHERE id = ?', [roomId, id]);
    res.json({ message: 'Allocation updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
