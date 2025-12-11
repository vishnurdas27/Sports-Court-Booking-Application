const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// 1. Check Availability
router.post('/check', bookingController.checkAvailability);

// 2. Create Booking
router.post('/', bookingController.createBooking);

// 3. Get Bookings by Date (GET request with query param)
router.get('/', bookingController.getBookingsByDate);

// 4. Price Preview (This was missing causing the crash)
router.post('/price-preview', bookingController.getPricePreview);

module.exports = router;