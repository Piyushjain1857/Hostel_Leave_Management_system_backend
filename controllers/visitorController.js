const db = require('../config/db');

exports.getVisitors = async (req, res) => {
  try {
    const visitors = await db.query('SELECT * FROM Visitors');
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addVisitor = async (req, res) => {
  try {
    const { visitorName, phone, studentId, purpose, visitDate, status } = req.body;
    await db.query(
      'INSERT INTO Visitors (visitorName, phone, studentId, purpose, visitDate, status) VALUES (?, ?, ?, ?, ?, ?)',
      [visitorName, phone, studentId, purpose, visitDate, status || 'Pending']
    );
    res.status(201).json({ message: 'Visitor added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateVisitorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.query('UPDATE Visitors SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Visitor status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Visitors WHERE id = ?', [id]);
    res.json({ message: 'Visitor deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
