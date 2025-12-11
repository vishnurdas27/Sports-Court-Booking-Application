const { Booking, Court } = require("../models");
const { calculateTotal } = require("../utils/priceCalculator");
const { Op } = require("sequelize");

/*
|--------------------------------------------------------------------------
| HELPER: IST → UTC
|--------------------------------------------------------------------------
| Ensures that a time string like "10:00" is treated as "10:00 IST"
| and converted to the correct absolute UTC time for the database.
*/
function convertISTtoUTC(dateString) {
  // 1. Remove 'Z' or existing offsets
  const cleanDateStr = dateString.replace("Z", "").split("+")[0];

  // 2. Append +05:30 to force Date object to interpret it as IST
  // This creates the correct UTC timestamp (e.g. 10:00 IST -> 04:30 UTC)
  return new Date(`${cleanDateStr}+05:30`);
}

/*
|--------------------------------------------------------------------------
| 1. CHECK AVAILABILITY
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| 2. CREATE BOOKING
|--------------------------------------------------------------------------
*/
const createBooking = async (req, res) => {
  try {
    const { userId, courtId, startTime, endTime, coachId, equipmentList } = req.body;

    const startUTC = convertISTtoUTC(startTime);
    const endUTC = convertISTtoUTC(endTime);

    // Overlap check
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

    // Calculate Price using original strings (preserves local hour logic)
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

/*
|--------------------------------------------------------------------------
| 3. GET BOOKINGS BY DATE
|--------------------------------------------------------------------------
*/
const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.query; // Format: "YYYY-MM-DD"

    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    // Force interpretation as IST Start/End of day
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

/*
|--------------------------------------------------------------------------
| 4. GET PRICE PREVIEW
|--------------------------------------------------------------------------
*/
const getPricePreview = async (req, res) => {
  const { courtId, startTime, endTime, coachId, equipmentList } = req.body;

  try {
    const court = await Court.findByPk(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });

    // Calculate Price
    const pricingResult = await calculateTotal(
      court,
      startTime,
      endTime,
      coachId,
      equipmentList
    );

    return res.status(200).json({
      total: pricingResult.total,
      breakdown: pricingResult.breakdown,
      message: "Price preview successful"
    });

  } catch (error) {
    console.error("Price preview calculation error:", error);
    res.status(500).json({ message: "Failed to calculate price preview" });
  }
};

// ✅ EXPORT ALL FUNCTIONS HERE
module.exports = {
  checkAvailability,
  createBooking,
  getBookingsByDate,
  getPricePreview 
};