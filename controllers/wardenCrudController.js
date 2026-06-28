const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * @desc    Get all wardens
 * @route   GET /wardens
 */
const getWardens = async (req, res) => {
  try {
    const q = req.query.search || '';
    const wardens = await db.query('SELECT * FROM Wardens');
    
    let filtered = wardens;
    if (q.trim()) {
      const searchVal = q.toLowerCase();
      filtered = wardens.filter(w => 
        w.name.toLowerCase().includes(searchVal) ||
        w.email.toLowerCase().includes(searchVal) ||
        (w.hostelAssigned && w.hostelAssigned.toLowerCase().includes(searchVal))
      );
    }
    res.json(filtered);
  } catch (error) {
    console.error('Get Wardens Error:', error.message);
    res.status(500).json({ message: 'Error retrieving wardens.' });
  }
};

/**
 * @desc    Get single warden by ID
 * @route   GET /wardens/:id
 */
const getWardenById = async (req, res) => {
  try {
    const { id } = req.params;
    const wardens = await db.query('SELECT * FROM Wardens WHERE id = ?', [Number(id)]);
    if (wardens.length === 0) {
      return res.status(404).json({ message: 'Warden not found.' });
    }
    res.json(wardens[0]);
  } catch (error) {
    console.error('Get Warden By ID Error:', error.message);
    res.status(500).json({ message: 'Error fetching warden details.' });
  }
};

/**
 * @desc    Create new warden
 * @route   POST /wardens
 */
const createWarden = async (req, res) => {
  try {
    const { name, email, phone, hostelAssigned, shift, password } = req.body;

    if (!name || !email || !hostelAssigned || !password) {
      return res.status(400).json({ message: 'Name, email, hostel assigned, and password are required.' });
    }

    const wardens = await db.query('SELECT id FROM Wardens WHERE email = ?', [email]);
    if (wardens.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.query(
      'INSERT INTO Wardens (name, email, password, phone, hostelAssigned, shift) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || '', hostelAssigned, shift || '']
    );

    res.status(201).json({
      message: 'Warden account created successfully.',
      wardenId: result.insertId
    });
  } catch (error) {
    console.error('Create Warden Error:', error.message);
    res.status(500).json({ message: 'Error creating warden.' });
  }
};

/**
 * @desc    Update warden details
 * @route   PUT /wardens/:id
 */
const updateWarden = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, hostelAssigned, shift } = req.body;

    if (!name || !email || !hostelAssigned) {
      return res.status(400).json({ message: 'Name, email, and hostel assigned are required.' });
    }

    const result = await db.query(
      'UPDATE Wardens SET name = ?, email = ?, phone = ?, hostelAssigned = ?, shift = ? WHERE id = ?',
      [name, email, phone || '', hostelAssigned, shift || '', Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Warden not found or no changes made.' });
    }

    res.json({ message: 'Warden profile updated successfully.' });
  } catch (error) {
    console.error('Update Warden Error:', error.message);
    res.status(500).json({ message: 'Error updating warden details.' });
  }
};

/**
 * @desc    Delete warden profile
 * @route   DELETE /wardens/:id
 */
const deleteWarden = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM Wardens WHERE id = ?', [Number(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Warden profile not found.' });
    }

    res.json({ message: 'Warden profile deleted successfully.' });
  } catch (error) {
    console.error('Delete Warden Error:', error.message);
    res.status(500).json({ message: 'Error deleting warden.' });
  }
};

module.exports = {
  getWardens,
  getWardenById,
  createWarden,
  updateWarden,
  deleteWarden
};
