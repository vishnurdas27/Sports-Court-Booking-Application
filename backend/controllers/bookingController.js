const { Booking, Court, User } = require("../models"); // <--- Added User for Admin view
const { calculateTotal } = require("../utils/priceCalculator");
const { Op } = require("sequelize");

/*
|--------------------------------------------------------------------------
| HELPER: IST → UTC
|--------------------------------------------------------------------------
*/
function convertISTtoUTC(dateString) {
  if (!dateString) return new Date();
  // 1. Remove 'Z' or existing offsets to get raw date string
  const cleanDateStr = dateString.replace("Z", "").split("+")[0];
  // 2. Append +05:30 to force Date object to interpret it as IST
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

    // Calculate Price
    const pricingResult = await calculateTotal(
      court,
      startTime, // Pass original string for Day/Hour logic
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

    // Handle Many-to-Many Equipment Relationship
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
| 3. GET BOOKINGS BY DATE (For Booking Grid)
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
| 4. GET ALL BOOKINGS (For Admin Panel)
|--------------------------------------------------------------------------
*/
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] }, // Shows User Info
        { model: Court, attributes: ['name'] }          // Shows Court Name
      ],
      order: [['startTime', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

/*
|--------------------------------------------------------------------------
| 5. PRICE PREVIEW (For Modal)
|--------------------------------------------------------------------------
*/
const previewPrice = async (req, res) => {
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
      totalPrice: pricingResult.total, // Note: Frontend expects 'totalPrice'
      breakdown: pricingResult.breakdown,
      message: "Price preview successful"
    });

  } catch (error) {
    console.error("Price preview calculation error:", error);
    res.status(500).json({ message: "Failed to calculate price preview" });
  }
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
  checkAvailability,
  createBooking,
  getBookingsByDate,
  getAllBookings, // Required for Admin
  previewPrice    // Required for Modal
};