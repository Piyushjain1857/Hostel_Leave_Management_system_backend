const db = require('../config/db');

/**
 * @desc    Submit a new complaint feedback
 * @route   POST /feedback
 * @access  Private (Student)
 */
const submitFeedback = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { subject, description, category } = req.body;

    if (!subject || !description || !category) {
      return res.status(400).json({ message: 'Subject, description, and category fields are required.' });
    }

    const insertResult = await db.query(
      'INSERT INTO Feedback (userId, subject, description, category, status) VALUES (?, ?, ?, ?, ?)',
      [studentId, subject, description, category, 'Pending']
    );

    res.status(201).json({
      message: 'Complaint submitted successfully.',
      feedbackId: insertResult.insertId
    });
  } catch (error) {
    console.error('Submit Feedback Error:', error.message);
    res.status(500).json({ message: 'Error submitting complaint.' });
  }
};

/**
 * @desc    Get student complaints history
 * @route   GET /feedback
 * @access  Private (Student/Admin/Warden)
 */
const getFeedbackList = async (req, res) => {
  try {
    // If the logged-in user is a student, filter by their userId, else return all (for wardens/admins)
    const role = req.user.role || 'student';
    let queryStr = 'SELECT * FROM Feedback ORDER BY createdAt DESC';
    let params = [];

    if (role === 'student') {
      queryStr = 'SELECT * FROM Feedback WHERE userId = ? ORDER BY createdAt DESC';
      params = [req.user.id];
    }

    const list = await db.query(queryStr, params);
    res.json(list);
  } catch (error) {
    console.error('Get Feedback Error:', error.message);
    res.status(500).json({ message: 'Error fetching complaints history.' });
  }
};

/**
 * @desc    Update complaint status
 * @route   PUT /feedback/:id
 * @access  Private (Admin/Warden)
 */
const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status field is required.' });
    }

    const result = await db.query(
      'UPDATE Feedback SET status = ? WHERE id = ?',
      [status, Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    res.json({ message: 'Feedback status updated successfully.' });
  } catch (error) {
    console.error('Update Feedback Status Error:', error.message);
    res.status(500).json({ message: 'Error updating complaint status.' });
  }
};

module.exports = {
  submitFeedback,
  getFeedbackList,
  updateFeedbackStatus
};
