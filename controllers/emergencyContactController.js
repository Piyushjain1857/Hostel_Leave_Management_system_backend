const db = require('../config/db');

exports.getContacts = async (req, res) => {
  try {
    const contacts = await db.query('SELECT * FROM EmergencyContacts');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addContact = async (req, res) => {
  try {
    const { studentId, name, relation, phone, address } = req.body;
    await db.query(
      'INSERT INTO EmergencyContacts (studentId, name, relation, phone, address) VALUES (?, ?, ?, ?, ?)',
      [studentId, name, relation, phone, address]
    );
    res.status(201).json({ message: 'Contact added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, relation, phone, address } = req.body;
    await db.query(
      'UPDATE EmergencyContacts SET name = ?, relation = ?, phone = ?, address = ? WHERE id = ?',
      [name, relation, phone, address, id]
    );
    res.json({ message: 'Contact updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM EmergencyContacts WHERE id = ?', [id]);
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
