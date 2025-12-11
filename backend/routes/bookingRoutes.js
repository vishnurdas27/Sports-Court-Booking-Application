const express = require('express');
const router = express.Router();
const { 
  checkAvailability, 
  createBooking, 
  getBookingsByDate, 
  previewPrice,
  getAllBookings 
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');


router.get('/all', protect, admin, getAllBookings); 
router.post('/check', checkAvailability);
router.post('/price-preview', previewPrice);


router.post('/', protect, createBooking); 
router.get('/', getBookingsByDate); 

module.exports = router;