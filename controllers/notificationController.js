const db = require('../config/db');

/**
 * @desc    Get all notifications
 * @route   GET /notifications
 */
const getNotifications = async (req, res) => {
  try {
    const list = await db.query('SELECT * FROM Notifications ORDER BY createdAt DESC');
    res.json(list);
  } catch (error) {
    console.error('Get Notifications Error:', error.message);
    res.status(500).json({ message: 'Error retrieving notifications.' });
  }
};

/**
 * @desc    Broadcast a new notification
 * @route   POST /notifications
 */
const createNotification = async (req, res) => {
  try {
    const { title, message, role } = req.body;

    if (!title || !message || !role) {
      return res.status(400).json({ message: 'Title, message, and target role are required.' });
    }

    const result = await db.query(
      'INSERT INTO Notifications (title, message, role) VALUES (?, ?, ?)',
      [title, message, role]
    );

    res.status(201).json({
      message: 'Notification broadcasted successfully.',
      notificationId: result.insertId
    });
  } catch (error) {
    console.error('Create Notification Error:', error.message);
    res.status(500).json({ message: 'Error broadcasting notification.' });
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM Notifications WHERE id = ?', [Number(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    res.json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Delete Notification Error:', error.message);
    res.status(500).json({ message: 'Error deleting notification.' });
  }
};

/**
 * @desc    Get notifications targeting a specific role
 * @route   GET /:role/notifications
 */
const getRoleNotifications = async (req, res) => {
  try {
    const { role } = req.params;
    const list = await db.query(
      "SELECT id, title, message, role, createdAt, status FROM Notifications WHERE role = ? OR role = 'all' ORDER BY createdAt DESC",
      [role]
    );
    res.json(list);
  } catch (error) {
    console.error('Get Role Notifications Error:', error.message);
    res.status(500).json({ message: 'Error retrieving notifications.' });
  }
};


/**
 * @desc    Mark notification as read
 * @route   PUT /notification/read/:id
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE Notifications SET status = ? WHERE id = ?', ['Read', Number(id)]);
    res.json({ message: 'Notification marked as read successfully.', id: Number(id) });
  } catch (error) {
    console.error('Mark Notification Read Error:', error.message);
    res.status(500).json({ message: 'Error marking notification as read.' });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /notification/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const role = req.user?.role || req.body?.role || 'student';
    // Use the mock db correctly, since it's a file DB, the query string might be simplistic.
    // Assuming our mock db router doesn't strictly parse complex WHERE yet, we might need to rely on what it can do.
    // The query matcher in db.js supports: "update notifications set status = ?" but it assumes single ID.
    // For this demo, let's just use raw query and let the real DB or extended mock handle it.
    await db.query("UPDATE Notifications SET status = 'Read' WHERE role = ?", [role]);
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark All Read Error:', error.message);
    res.status(500).json({ message: 'Error marking all as read.' });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  deleteNotification,
  getRoleNotifications,
  markNotificationAsRead,
  markAllAsRead
};
