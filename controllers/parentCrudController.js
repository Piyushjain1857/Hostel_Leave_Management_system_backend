const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * @desc    Get all parents
 * @route   GET /parents
 */
const getParents = async (req, res) => {
  try {
    const q = req.query.search || '';
    const parents = await db.query('SELECT * FROM Parents');
    const students = await db.query('SELECT id, name FROM students');
    
    // Map student names to parents
    const studentMap = {};
    students.forEach(s => { studentMap[s.id] = s.name; });

    let mapped = parents.map(p => ({
      ...p,
      studentName: studentMap[p.studentId] || 'Unlinked'
    }));

    if (q.trim()) {
      const searchVal = q.toLowerCase();
      mapped = mapped.filter(p => 
        p.name.toLowerCase().includes(searchVal) ||
        p.email.toLowerCase().includes(searchVal) ||
        p.phone.toLowerCase().includes(searchVal) ||
        p.studentName.toLowerCase().includes(searchVal)
      );
    }
    res.json(mapped);
  } catch (error) {
    console.error('Get Parents Error:', error.message);
    res.status(500).json({ message: 'Error retrieving parents.' });
  }
};

/**
 * @desc    Get single parent by ID
 * @route   GET /parents/:id
 */
const getParentById = async (req, res) => {
  try {
    const { id } = req.params;
    const parents = await db.query('SELECT * FROM Parents WHERE id = ?', [Number(id)]);
    if (parents.length === 0) {
      return res.status(404).json({ message: 'Parent not found.' });
    }
    res.json(parents[0]);
  } catch (error) {
    console.error('Get Parent By ID Error:', error.message);
    res.status(500).json({ message: 'Error fetching parent details.' });
  }
};

/**
 * @desc    Create new parent
 * @route   POST /parents
 */
const createParent = async (req, res) => {
  try {
    const { name, email, phone, studentId, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const parents = await db.query('SELECT id FROM Parents WHERE email = ?', [email]);
    if (parents.length > 0) {
      return res.status(400).json({ message: 'Parent email already registered.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.query(
      'INSERT INTO Parents (name, email, password, phone, studentId) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || '', studentId ? Number(studentId) : null]
    );

    res.status(201).json({
      message: 'Parent account created successfully.',
      parentId: result.insertId
    });
  } catch (error) {
    console.error('Create Parent Error:', error.message);
    res.status(500).json({ message: 'Error creating parent.' });
  }
};

/**
 * @desc    Update parent details
 * @route   PUT /parents/:id
 */
const updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, studentId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const result = await db.query(
      'UPDATE Parents SET name = ?, email = ?, phone = ?, studentId = ? WHERE id = ?',
      [name, email, phone || '', studentId ? Number(studentId) : null, Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Parent not found or no changes made.' });
    }

    res.json({ message: 'Parent profile updated successfully.' });
  } catch (error) {
    console.error('Update Parent Error:', error.message);
    res.status(500).json({ message: 'Error updating parent details.' });
  }
};

/**
 * @desc    Delete parent profile
 * @route   DELETE /parents/:id
 */
const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM Parents WHERE id = ?', [Number(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Parent profile not found.' });
    }

    res.json({ message: 'Parent profile deleted successfully.' });
  } catch (error) {
    console.error('Delete Parent Error:', error.message);
    res.status(500).json({ message: 'Error deleting parent.' });
  }
};

module.exports = {
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent
};
