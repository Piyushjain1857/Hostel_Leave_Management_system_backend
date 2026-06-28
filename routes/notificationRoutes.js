const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  createNotification,
  deleteNotification,
  markNotificationAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// Secure notifications routes with protect validation
router.get('/', getNotifications);
router.post('/', protect, createNotification);
router.delete('/:id', protect, deleteNotification);
router.put('/read/:id', markNotificationAsRead);
router.put('/read-all', markAllAsRead);

module.exports = router;
