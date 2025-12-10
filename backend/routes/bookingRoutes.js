const express = require('express');
const router = express.Router();
const { checkAvailability, createBooking } = require('../controllers/bookingController');

router.post('/check', checkAvailability);
router.post('/', createBooking)

module.exports = router;