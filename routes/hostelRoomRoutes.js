const express = require('express');
const router = express.Router();
const { 
  getHostels, addHostel, updateHostel, deleteHostel,
  getRooms, addRoom, updateRoom, deleteRoom 
} = require('../controllers/hostelRoomController');

router.get('/hostels', getHostels);
router.post('/hostels', addHostel);
router.put('/hostels/:id', updateHostel);
router.delete('/hostels/:id', deleteHostel);

router.get('/rooms', getRooms);
router.post('/rooms', addRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

module.exports = router;
