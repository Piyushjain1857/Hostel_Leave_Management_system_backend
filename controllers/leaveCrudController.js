const db = require('../config/db');

/**
 * @desc    Get all leave requests with filters
 * @route   GET /leaves
 */
const getLeaves = async (req, res) => {
  try {
    const { search, status } = req.query;
    const leaves = await db.query('SELECT * FROM LeaveRequests');
    const students = await db.query('SELECT id, name FROM students');

    const studentMap = {};
    students.forEach(s => { studentMap[s.id] = s.name; });

    let mapped = leaves.map(l => ({
      ...l,
      studentName: studentMap[l.studentId] || 'Unknown Student'
    }));

    // Filter by status if provided
    if (status && status !== 'All') {
      mapped = mapped.filter(l => l.status === status || l.finalStatus === status);
    }

    // Filter by search query if provided
    if (search && search.trim()) {
      const q = search.toLowerCase();
      mapped = mapped.filter(l => 
        l.reason.toLowerCase().includes(q) ||
        l.destination.toLowerCase().includes(q) ||
        l.studentName.toLowerCase().includes(q) ||
        l.id.toString().includes(q)
      );
    }

    // Sort by createdAt descending
    mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(mapped);
  } catch (error) {
    console.error('Get Leaves Error:', error.message);
    res.status(500).json({ message: 'Error retrieving leave records.' });
  }
};

/**
 * @desc    Get single leave request details
 * @route   GET /leaves/:id
 */
const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const leaves = await db.query('SELECT * FROM LeaveRequests WHERE id = ?', [Number(id)]);
    if (leaves.length === 0) {
      return res.status(404).json({ message: 'Leave record not found.' });
    }

    const leave = leaves[0];
    const students = await db.query('SELECT * FROM students WHERE id = ?', [leave.studentId]);
    leave.studentName = students.length > 0 ? students[0].name : 'Unknown Student';

    res.json(leave);
  } catch (error) {
    console.error('Get Leave By ID Error:', error.message);
    res.status(500).json({ message: 'Error fetching leave details.' });
  }
};

/**
 * @desc    Update leave status (parentStatus, wardenStatus, finalStatus, status)
 * @route   PUT /leaves/:id
 */
const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentStatus, wardenStatus, finalStatus, status } = req.body;

    const leaves = await db.query('SELECT * FROM LeaveRequests WHERE id = ?', [Number(id)]);
    if (leaves.length === 0) {
      return res.status(404).json({ message: 'Leave record not found.' });
    }

    const leave = leaves[0];
    const newParentStatus = parentStatus || leave.parentStatus || 'Pending';
    const newWardenStatus = wardenStatus || leave.wardenStatus || 'Pending';
    
    let newFinalStatus = finalStatus || leave.finalStatus || 'Pending';
    let newStatus = status || leave.status || 'Pending';

    // Auto-calculate finalStatus if parent & warden are approved
    if (parentStatus || wardenStatus) {
      if (newParentStatus === 'Rejected' || newWardenStatus === 'Rejected') {
        newFinalStatus = 'Rejected';
        newStatus = 'Rejected';
      } else if (newParentStatus === 'Approved' && newWardenStatus === 'Approved') {
        newFinalStatus = 'Approved';
        newStatus = 'Approved';
      } else {
        newFinalStatus = 'Pending';
        newStatus = 'Pending';
      }
    }

    // Explicit override if sent directly
    if (finalStatus) {
      newStatus = finalStatus;
    }

    const result = await db.query(
      'UPDATE LeaveRequests SET parentStatus = ?, wardenStatus = ?, finalStatus = ?, status = ? WHERE id = ?',
      [newParentStatus, newWardenStatus, newFinalStatus, newStatus, Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to update leave record.' });
    }

    res.json({
      message: 'Leave request updated successfully.',
      leave: {
        id: Number(id),
        parentStatus: newParentStatus,
        wardenStatus: newWardenStatus,
        finalStatus: newFinalStatus,
        status: newStatus
      }
    });

  } catch (error) {
    console.error('Update Leave Error:', error.message);
    res.status(500).json({ message: 'Error updating leave details.' });
  }
};

/**
 * @desc    Delete leave record
 * @route   DELETE /leaves/:id
 */
const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM LeaveRequests WHERE id = ?', [Number(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Leave record not found.' });
    }

    res.json({ message: 'Leave record deleted successfully.' });
  } catch (error) {
    console.error('Delete Leave Error:', error.message);
    res.status(500).json({ message: 'Error deleting leave record.' });
  }
};

module.exports = {
  getLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave
};
