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

// Specific routes first
router.get('/all', protect, admin, getAllBookings); // <--- PUT THIS NEAR THE TOP
router.post('/check', checkAvailability);
router.post('/price-preview', previewPrice);

// Root routes next
router.post('/', protect, createBooking); 
router.get('/', getBookingsByDate); 

module.exports = router;