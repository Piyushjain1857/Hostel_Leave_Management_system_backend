const db = require('../config/db');

/**
 * @desc    Fetch university and hostel settings
 * @route   GET /settings
 */
const getSettings = async (req, res) => {
  try {
    const list = await db.query('SELECT * FROM Settings LIMIT 1');
    if (list.length === 0) {
      // Return default if table somehow empty
      return res.json({
        id: 1,
        universityName: 'State Institute of Technology',
        hostelName: 'Block-B Academic Hostel',
        contactEmail: 'admin.hostel@college.edu',
        contactPhone: '+91 9876543210'
      });
    }
    res.json(list[0]);
  } catch (error) {
    console.error('Get Settings Error:', error.message);
    res.status(500).json({ message: 'Error retrieving system settings.' });
  }
};

/**
 * @desc    Update system settings
 * @route   PUT /settings
 */
const updateSettings = async (req, res) => {
  try {
    const { universityName, hostelName, contactEmail, contactPhone } = req.body;

    if (!universityName || !hostelName || !contactEmail || !contactPhone) {
      return res.status(400).json({ message: 'All settings parameters are required.' });
    }

    const list = await db.query('SELECT id FROM Settings LIMIT 1');
    let result;
    if (list.length === 0) {
      result = await db.query(
        'INSERT INTO Settings (universityName, hostelName, contactEmail, contactPhone) VALUES (?, ?, ?, ?)',
        [universityName, hostelName, contactEmail, contactPhone]
      );
    } else {
      const id = list[0].id;
      result = await db.query(
        'UPDATE Settings SET universityName = ?, hostelName = ?, contactEmail = ?, contactPhone = ? WHERE id = ?',
        [universityName, hostelName, contactEmail, contactPhone, id]
      );
    }

    res.json({
      message: 'System settings updated successfully.',
      settings: { universityName, hostelName, contactEmail, contactPhone }
    });
  } catch (error) {
    console.error('Update Settings Error:', error.message);
    res.status(500).json({ message: 'Error updating system settings.' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
