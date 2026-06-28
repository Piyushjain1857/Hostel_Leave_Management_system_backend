const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Get all policies (type = portal or hostel)
router.get('/policies', async (req, res) => {
  try {
    const type = req.query.type;
    let query = 'SELECT * FROM Policies';
    let params = [];
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    const policies = await db.query(query, params);
    
    // Map 'description' column back to 'desc' for the frontend (handling both MySQL and Mock DB)
    const mapped = policies.map(p => ({
      id: p.id,
      title: p.title,
      desc: p.description || p.desc
    }));
    
    res.json({ policies: mapped });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ message: 'Failed to fetch policies' });
  }
});

// Update policies (Admin only)
router.put('/policies', protect, async (req, res) => {
  try {
    const { type, policies } = req.body;
    if (!type || !policies) {
      return res.status(400).json({ message: 'Type and policies are required' });
    }

    // Since we don't have transaction support in mock DB, we just clear and re-insert
    await db.query('DELETE FROM Policies WHERE type = ?', [type]);
    
    for (const p of policies) {
      await db.query(
        'INSERT INTO Policies (id, type, title, description) VALUES (?, ?, ?, ?)',
        [p.id, type, p.title, p.desc]
      );
    }
    
    res.json({ message: 'Policies updated successfully' });
  } catch (error) {
    console.error('Error updating policies:', error);
    res.status(500).json({ message: 'Failed to update policies' });
  }
});

// Get warden directory cards
router.get('/warden-directory', async (req, res) => {
  try {
    const directory = await db.query('SELECT * FROM WardenDirectoryCards');
    res.json({ directory });
  } catch (error) {
    console.error('Error fetching warden directory:', error);
    res.status(500).json({ message: 'Failed to fetch warden directory' });
  }
});

// Update warden directory cards (Admin only)
router.put('/warden-directory', protect, async (req, res) => {
  try {
    const { directory } = req.body;
    if (!directory) {
      return res.status(400).json({ message: 'Directory data is required' });
    }

    await db.query('DELETE FROM WardenDirectoryCards');
    
    for (const w of directory) {
      await db.query(
        'INSERT INTO WardenDirectoryCards (id, role, name, location, phone, email, color, initials) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [w.id, w.role, w.name, w.location, w.phone, w.email, w.color, w.initials]
      );
    }
    
    res.json({ message: 'Warden directory updated successfully' });
  } catch (error) {
    console.error('Error updating warden directory:', error);
    res.status(500).json({ message: 'Failed to update warden directory' });
  }
});

module.exports = router;
