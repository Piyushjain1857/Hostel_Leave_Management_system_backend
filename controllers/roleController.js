const db = require('../config/db');

exports.getRoles = async (req, res) => {
  try {
    const roles = await db.query('SELECT * FROM Roles');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addRole = async (req, res) => {
  try {
    const { roleName, permissions } = req.body;
    await db.query('INSERT INTO Roles (roleName, permissions) VALUES (?, ?)', [roleName, permissions]);
    res.status(201).json({ message: 'Role added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName, permissions } = req.body;
    await db.query('UPDATE Roles SET roleName = ?, permissions = ? WHERE id = ?', [roleName, permissions, id]);
    res.json({ message: 'Role updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Roles WHERE id = ?', [id]);
    res.json({ message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
