const db = require('../config/db');

/**
 * @desc    Raise a support ticket
 * @route   POST /support/ticket
 * @access  Private (Student)
 */
const raiseSupportTicket = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and issue description fields are required.' });
    }

    const insertResult = await db.query(
      'INSERT INTO SupportTickets (userId, subject, description, status) VALUES (?, ?, ?, ?)',
      [studentId, subject, description, 'Pending']
    );

    res.status(201).json({
      message: 'Support ticket raised successfully.',
      ticketId: insertResult.insertId
    });
  } catch (error) {
    console.error('Raise Ticket Error:', error.message);
    res.status(500).json({ message: 'Error raising support ticket.' });
  }
};

/**
 * @desc    Get support tickets history
 * @route   GET /support/tickets
 * @access  Private (Student/Admin/Warden)
 */
const getSupportTickets = async (req, res) => {
  try {
    const role = req.user.role || 'student';
    let queryStr = 'SELECT * FROM SupportTickets ORDER BY createdAt DESC';
    let params = [];

    if (role === 'student') {
      queryStr = 'SELECT * FROM SupportTickets WHERE userId = ? ORDER BY createdAt DESC';
      params = [req.user.id];
    }

    const tickets = await db.query(queryStr, params);
    res.json(tickets);
  } catch (error) {
    console.error('Get Support Tickets Error:', error.message);
    res.status(500).json({ message: 'Error fetching support tickets history.' });
  }
};

module.exports = {
  raiseSupportTicket,
  getSupportTickets
};
