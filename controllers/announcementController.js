const db = require('../config/db');

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await db.query('SELECT * FROM Announcements');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addAnnouncement = async (req, res) => {
  try {
    const { title, description, priority, postedBy } = req.body;
    await db.query(
      'INSERT INTO Announcements (title, description, priority, postedBy) VALUES (?, ?, ?, ?)',
      [title, description, priority || 'Normal', postedBy]
    );
    res.status(201).json({ message: 'Announcement created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;
    await db.query('UPDATE Announcements SET title = ?, description = ?, priority = ? WHERE id = ?', [title, description, priority, id]);
    res.json({ message: 'Announcement updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Announcements WHERE id = ?', [id]);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
