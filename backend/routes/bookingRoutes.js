const express = require('express');
const router = express.Router();
const { checkAvailability, createBooking, getBookingsByDate } = require('../controllers/bookingController');

router.post('/check', checkAvailability);
router.post('/', createBooking)
router.get('/', getBookingsByDate)

module.exports = router;