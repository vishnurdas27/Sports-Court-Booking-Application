const { Booking, Court } = require('../models');
const { calculateTotal } = require('../utils/priceCalculator');
const { Op } = require('sequelize');

const checkAvailability = async (req, res) => {
  const { courtId, startTime, endTime } = req.body;

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const existingBooking = await Booking.findOne({
      where: {
        courtId,
        status: 'confirmed',
        [Op.and]: [
          { startTime: { [Op.lt]: end } },
          { endTime: { [Op.gt]: start } }
        ]
      }
    });

    if (existingBooking) {
      return res.status(200).json({ available: false, message: 'Slot already booked.' });
    }

    return res.status(200).json({ available: true, message: 'Slot available.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Check Failed.' });
  }
};


const createBooking = async (req, res) => {
  const { userId, courtId, startTime, endTime, coachId, equipmentList } = req.body;

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check overlapping bookings
    const conflict = await Booking.findOne({
      where: {
        courtId,
        status: 'confirmed',
        [Op.and]: [
          { startTime: { [Op.lt]: end } },
          { endTime: { [Op.gt]: start } }
        ]
      }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Slot already taken! Please choose another.' });
    }

    const court = await Court.findByPk(courtId);
    if (!court) return res.status(404).json({ message: 'Court Not Found' });

    // Calculate pricing
    const pricingResult = await calculateTotal(
      court,
      startTime,
      endTime,
      coachId,
      equipmentList
    );

    const totalPrice = pricingResult.total;
    const priceBreakdown = pricingResult.breakdown;

    // Save booking
    const newBooking = await Booking.create({
      userId,
      courtId,
      startTime: start,
      endTime: end,
      totalPrice,
      status: 'confirmed',
      coachId: coachId || null,
      priceBreakdown: priceBreakdown
    });

    // Add equipment to junction table
    if (equipmentList && equipmentList.length > 0) {
      for (const item of equipmentList) {
        await newBooking.addEquipment(item.id, { through: { quantity: item.quantity } });
      }
    }

    res.status(201).json({
      message: 'Booking Confirmed!',
      booking: newBooking
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Booking Failed' });
  }
};

module.exports = { checkAvailability, createBooking };
