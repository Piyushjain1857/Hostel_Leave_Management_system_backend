const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent
} = require('../controllers/parentCrudController');

// Guard all parent CRUD endpoints with protect token validation
router.get('/', protect, getParents);
router.get('/:id', protect, getParentById);
router.post('/', protect, createParent);
router.put('/:id', protect, updateParent);
router.delete('/:id', protect, deleteParent);

module.exports = router;
