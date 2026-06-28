const express = require('express');
const router = express.Router();
const emergencyContactController = require('../controllers/emergencyContactController');

router.get('/', emergencyContactController.getContacts);
router.post('/', emergencyContactController.addContact);
router.put('/:id', emergencyContactController.updateContact);
router.delete('/:id', emergencyContactController.deleteContact);

module.exports = router;
