const db = require('../config/db');

// @desc    Get QR History
// @route   GET /api/qr/history
// @access  Private
exports.getQRHistory = async (req, res) => {
  try {
    const qrs = await db.query('SELECT * FROM QRPasses');
    const leaves = await db.query('SELECT * FROM leaverequests');
    const students = await db.query('SELECT * FROM students');
    
    const enrichedQRs = qrs.map(qr => {
      const leave = leaves.find(l => l.id === qr.leaveId);
      const student = students.find(s => s.id === leave?.studentId);
      return {
        ...qr,
        studentName: student?.name || 'Unknown',
        leaveDetails: leave?.reason || 'Unknown'
      };
    });

    res.json(enrichedQRs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching QR history' });
  }
};

// @desc    Regenerate QR Pass
// @route   POST /api/qr/regenerate/:id
// @access  Private
exports.regenerateQR = async (req, res) => {
  try {
    const qrId = req.params.id;
    const { leaveId } = req.body;
    
    // In real app, generate a base64 QR code image here based on token
    const newQRCode = 'data:image/png;base64,mockRegeneratedQRData...';
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);

    await db.query('UPDATE QRPasses SET status = ? WHERE id = ?', ['Expired', qrId]);
    await db.query('INSERT INTO QRPasses (leaveId, qrCode, expiryDate) VALUES (?, ?, ?)', [leaveId, newQRCode, expiryDate]);

    res.json({ message: 'QR Pass regenerated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error regenerating QR' });
  }
};

// @desc    Download QR Pass
// @route   GET /api/qr/download/:id
// @access  Private
exports.downloadQR = async (req, res) => {
  try {
    // Send base64 back so frontend can trigger download
    const qrs = await db.query('SELECT * FROM QRPasses WHERE id = ?', [req.params.id]);
    if (qrs.length === 0) return res.status(404).json({ message: 'QR not found' });
    
    res.json({ qrCode: qrs[0].qrCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error downloading QR' });
  }
};
