const express = require('express');
const cors = require('cors');
require('dotenv').config({ override: true });
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const parentRoutes = require('./routes/parentRoutes');
const wardenRoutes = require('./routes/wardenRoutes');
const gateRoutes = require('./routes/gateRoutes');

// Screens 21 to 30 Routes
const trackingRoutes = require('./routes/trackingRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const supportRoutes = require('./routes/supportRoutes');
const publicContentRoutes = require('./routes/publicContentRoutes');

// Admin and Admin CRUD Routes
const adminRoutes = require('./routes/adminRoutes');
const studentCrudRoutes = require('./routes/studentCrudRoutes');
const wardenCrudRoutes = require('./routes/wardenCrudRoutes');
const parentCrudRoutes = require('./routes/parentCrudRoutes');
const leaveCrudRoutes = require('./routes/leaveCrudRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const gateLogsRoutes = require('./routes/gateLogsRoutes');

// Advanced Screens (31-40) Routes
const advancedProfileRoutes = require('./routes/advancedProfileRoutes');
const advancedLeavesRoutes = require('./routes/advancedLeavesRoutes');
const activityLogsRoutes = require('./routes/activityLogsRoutes');
const qrPassRoutes = require('./routes/qrPassRoutes');
const hostelRoomRoutes = require('./routes/hostelRoomRoutes');

// Screens 41-48 Routes
const roleRoutes = require('./routes/roleRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const emergencyContactRoutes = require('./routes/emergencyContactRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const roomAllocationRoutes = require('./routes/roomAllocationRoutes');
const leaveAnalyticsRoutes = require('./routes/leaveAnalyticsRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React app can communicate with the backend
app.use(cors());

// Body parser middleware with expanded limits to process Base64 image payloads in requests
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// Log incoming requests for debugging (disabled in production for performance)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} request to: ${req.url}`);
  }
  next();
});

// Mount Authentication Routes
app.use('/api/auth', authRoutes);

// Mount Protected Student Dashboard Routes
app.use('/api/student', studentRoutes);
app.use('/student', studentRoutes); // Support direct student profile routing

// Mount Modular HLMS Feature Routes
app.use('/leave', leaveRoutes);
app.use('/parent', parentRoutes);
app.use('/warden', wardenRoutes);
app.use('/', gateRoutes);

// Mount Screens 21 to 30 Features
app.use('/tracking', trackingRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/support', supportRoutes);
app.use('/public', publicContentRoutes);

// Root Notifications Endpoints for Screen 22
const { protect } = require('./middleware/authMiddleware');
const { getRoleNotifications, markNotificationAsRead, deleteNotification } = require('./controllers/notificationController');
app.get('/:role/notifications', protect, getRoleNotifications);
app.put('/notification/read/:id', protect, markNotificationAsRead);
app.delete('/notification/:id', protect, deleteNotification);

// Mount Admin Portal Ecosystem Routes (Screens 11 to 20)
app.use('/admin', adminRoutes);
app.use('/students', studentCrudRoutes);
app.use('/wardens', wardenCrudRoutes);
app.use('/parents', parentCrudRoutes);
app.use('/leaves', leaveCrudRoutes);
app.use('/reports', reportRoutes);
app.use('/notifications', notificationRoutes);
app.use('/settings', settingsRoutes);
app.use('/gatelogs', gateLogsRoutes);

// Mount Advanced Screens (31-40) Routes
app.use('/api/advanced-profile', advancedProfileRoutes);
app.use('/api/advanced-leaves', advancedLeavesRoutes);
app.use('/api/activity-logs', activityLogsRoutes);
app.use('/api/qr', qrPassRoutes);
app.use('/api', hostelRoomRoutes); // mounts /hostels and /rooms

// Mount Screens 41-48 Routes
app.use('/api/roles', roleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/emergency-contacts', emergencyContactRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/room-allocation', roomAllocationRoutes);
app.use('/api/leave-analytics', leaveAnalyticsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/announcements', announcementRoutes);

// Base route to check API status
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Welcome to the Hostel Leave Management System Student API Portal.',
    endpoints: {
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register'
    }
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({
    message: 'A serious error occurred on the API server.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Initialize database and start the server
async function startServer() {
  await db.initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 API Server is running on port ${PORT}`);
    console.log(`📡 Access endpoints at http://localhost:${PORT}`);
  });
}

startServer();
