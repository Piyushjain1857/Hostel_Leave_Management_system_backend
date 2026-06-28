const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

router.get('/', visitorController.getVisitors);
router.post('/', visitorController.addVisitor);
router.put('/:id', visitorController.updateVisitorStatus);
router.delete('/:id', visitorController.deleteVisitor);

module.exports = router;
