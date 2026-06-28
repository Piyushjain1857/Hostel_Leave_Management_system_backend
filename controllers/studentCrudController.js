const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * @desc    Get all students
 * @route   GET /students
 */
const getStudents = async (req, res) => {
  try {
    const q = req.query.search || '';
    const students = await db.query('SELECT * FROM students');
    
    let filtered = students;
    if (q.trim()) {
      const searchVal = q.toLowerCase();
      filtered = students.filter(s => 
        s.name.toLowerCase().includes(searchVal) ||
        s.email.toLowerCase().includes(searchVal) ||
        (s.hostelRoom && s.hostelRoom.toLowerCase().includes(searchVal))
      );
    }
    res.json(filtered);
  } catch (error) {
    console.error('Get Students Error:', error.message);
    res.status(500).json({ message: 'Error retrieving students.' });
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /students/:id
 */
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const students = await db.query('SELECT * FROM students WHERE id = ?', [Number(id)]);
    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    res.json(students[0]);
  } catch (error) {
    console.error('Get Student By ID Error:', error.message);
    res.status(500).json({ message: 'Error fetching student details.' });
  }
};

/**
 * @desc    Create new student
 * @route   POST /students
 */
const createStudent = async (req, res) => {
  try {
    const { name, email, phone, course, year, hostelRoom, password } = req.body;

    if (!name || !email || !hostelRoom || !password) {
      return res.status(400).json({ message: 'Name, email, hostel room, and password are required.' });
    }

    const students = await db.query('SELECT id FROM students WHERE email = ?', [email]);
    if (students.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.query(
      'INSERT INTO students (name, email, password, hostelRoom, phone, course, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, hostelRoom, phone || '', course || '', year || '']
    );

    res.status(201).json({
      message: 'Student account created successfully.',
      studentId: result.insertId
    });
  } catch (error) {
    console.error('Create Student Error:', error.message);
    res.status(500).json({ message: 'Error creating student.' });
  }
};

/**
 * @desc    Update student details
 * @route   PUT /students/:id
 */
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, course, year, hostelRoom } = req.body;

    if (!name || !email || !hostelRoom) {
      return res.status(400).json({ message: 'Name, email, and hostel room are required.' });
    }

    const result = await db.query(
      'UPDATE students SET name = ?, email = ?, phone = ?, course = ?, year = ?, hostelRoom = ? WHERE id = ?',
      [name, email, phone || '', course || '', year || '', hostelRoom, Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found or no changes made.' });
    }

    res.json({ message: 'Student profile updated successfully.' });
  } catch (error) {
    console.error('Update Student Error:', error.message);
    res.status(500).json({ message: 'Error updating student details.' });
  }
};

/**
 * @desc    Delete student profile
 * @route   DELETE /students/:id
 */
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM students WHERE id = ?', [Number(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    res.json({ message: 'Student profile deleted successfully.' });
  } catch (error) {
    console.error('Delete Student Error:', error.message);
    res.status(500).json({ message: 'Error deleting student.' });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
