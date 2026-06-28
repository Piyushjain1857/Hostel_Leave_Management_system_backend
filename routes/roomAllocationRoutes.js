const express = require('express');
const router = express.Router();
const roomAllocationController = require('../controllers/roomAllocationController');

router.get('/', roomAllocationController.getAllocations);
router.post('/', roomAllocationController.addAllocation);
router.put('/:id', roomAllocationController.updateAllocation);

module.exports = router;
