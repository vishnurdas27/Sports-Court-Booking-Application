const { Booking, Court, User } = require("../models");
const { calculateTotal } = require("../utils/priceCalculator");
const { Op } = require("sequelize");


function convertISTtoUTC(dateString) {
  if (!dateString) return new Date();
  const cleanDateStr = dateString.replace("Z", "").split("+")[0];
  return new Date(`${cleanDateStr}+05:30`);
}


const checkAvailability = async (req, res) => {
  const { courtId, startTime, endTime } = req.body;

  try {
    const startUTC = convertISTtoUTC(startTime);
    const endUTC = convertISTtoUTC(endTime);

    const existingBooking = await Booking.findOne({
      where: {
        courtId,
        status: "confirmed",
        [Op.and]: [
          { startTime: { [Op.lt]: endUTC } },
          { endTime: { [Op.gt]: startUTC } }
        ]
      }
    });

    if (existingBooking) {
      return res.status(200).json({
        available: false,
        message: "Slot already booked."
      });
    }

    return res.status(200).json({
      available: true,
      message: "Slot available."
    });

  } catch (error) {
    console.error("Availability Check Error:", error);
    res.status(500).json({ message: "Server Check Failed." });
  }
};


const createBooking = async (req, res) => {
  try {
    const { userId, courtId, startTime, endTime, coachId, equipmentList } = req.body;

    const startUTC = convertISTtoUTC(startTime);
    const endUTC = convertISTtoUTC(endTime);


    const conflict = await Booking.findOne({
      where: {
        courtId,
        status: "confirmed",
        [Op.and]: [
          { startTime: { [Op.lt]: endUTC } },
          { endTime: { [Op.gt]: startUTC } }
        ]
      }
    });

    if (conflict) {
      return res.status(400).json({
        message: "Slot already taken! Please choose another.",
      });
    }

    const court = await Court.findByPk(courtId);
    if (!court) return res.status(404).json({ message: "Court Not Found" });


    const pricingResult = await calculateTotal(
      court,
      startTime, 
      endTime,
      coachId,
      equipmentList
    );

    const newBooking = await Booking.create({
      userId,
      courtId,
      startTime: startUTC,
      endTime: endUTC,
      totalPrice: pricingResult.total,
      status: "confirmed",
      coachId: coachId || null,
      priceBreakdown: pricingResult.breakdown
    });

  
    if (equipmentList && equipmentList.length > 0) {
      for (const item of equipmentList) {
        await newBooking.addEquipment(item.id, {
          through: { quantity: item.quantity }
        });
      }
    }

    return res.status(201).json({
      message: "Booking Confirmed!",
      booking: newBooking
    });

  } catch (error) {
    console.error("Booking Creation Error:", error);
    res.status(500).json({ message: "Booking Failed" });
  }
};


const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.query; 

    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    const startOfDay = new Date(`${date}T00:00:00+05:30`);
    const endOfDay = new Date(`${date}T23:59:59.999+05:30`);

    const bookings = await Booking.findAll({
      where: {
        startTime: {
          [Op.gte]: startOfDay,
          [Op.lte]: endOfDay
        },
        status: "confirmed"
      },
      attributes: ["id", "courtId", "startTime", "endTime"]
    });

    return res.status(200).json(bookings);

  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res.status(500).json({ message: "Failed to fetch Bookings" });
  }
};


const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] }, 
        { model: Court, attributes: ['name'] }          
      ],
      order: [['startTime', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};


const previewPrice = async (req, res) => {
  const { courtId, startTime, endTime, coachId, equipmentList } = req.body;

  try {
    const court = await Court.findByPk(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });


    const pricingResult = await calculateTotal(
      court,
      startTime,
      endTime,
      coachId,
      equipmentList
    );

    return res.status(200).json({
      totalPrice: pricingResult.total, 
      breakdown: pricingResult.breakdown,
      message: "Price preview successful"
    });

  } catch (error) {
    console.error("Price preview calculation error:", error);
    res.status(500).json({ message: "Failed to calculate price preview" });
  }
};


module.exports = {
  checkAvailability,
  createBooking,
  getBookingsByDate,
  getAllBookings, 
  previewPrice    
};