const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getWardens,
  getWardenById,
  createWarden,
  updateWarden,
  deleteWarden
} = require('../controllers/wardenCrudController');

// Guard all warden CRUD endpoints with protect token validation
router.get('/', protect, getWardens);
router.get('/:id', protect, getWardenById);
router.post('/', protect, createWarden);
router.put('/:id', protect, updateWarden);
router.delete('/:id', protect, deleteWarden);

module.exports = router;
