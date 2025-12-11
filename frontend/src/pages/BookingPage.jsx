import React, { useState, useEffect } from "react";
import { Trophy, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { format, addDays, subDays, isBefore } from "date-fns";
import { fetchCourts, fetchBookingsByDate } from "../services/api";

const BookingPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayBookings, setDayBookings] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await fetchCourts();
        setCourts(data);
      } catch (error) {
        console.error("Failed to fetch courts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const { data } = await fetchBookingsByDate(dateStr);
        setDayBookings(data);
      } catch (error) {
        console.error("Failed to load bookings", error);
      }
    };
    loadBookings();
  }, [currentDate]);


  const timeSlots = [];
  for (let hour = 6; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const getSlotStatus = (timeStr, courtId) => {
    const [slotHour] = timeStr.split(":").map(Number);

    const now = new Date();
    const slotDate = new Date(currentDate);
    slotDate.setHours(slotHour, 0, 0, 0);

    if (isBefore(slotDate, now)) return "past";

    const isBooked = dayBookings.some((booking) => {
      if (booking.courtId !== courtId) return false;

      const bookingDate = new Date(booking.startTime);

      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(bookingDate.getTime() + istOffset);

      const bookingHourIST = istDate.getUTCHours();

      return bookingHourIST === slotHour;
    });

    return isBooked ? "booked" : "available";
  };

  const handlePrevDay = () => setCurrentDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate((prev) => addDays(prev, 1));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        <Loader className="animate-spin w-8 h-8 mb-2" />
      </div>
    );
  }

  const gridTemplate = `80px repeat(${courts.length}, 1fr)`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <Trophy className="text-green-700 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">BookMyCourt</h1>
            <p className="text-sm text-gray-500">Premium Badminton Courts</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex items-center justify-between">
          <button onClick={handlePrevDay}>
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold">
              {format(currentDate, "EEEE, MMMM d, yyyy")}
            </h2>
          </div>

          <button onClick={handleNextDay}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Booking Grid */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div
            className="border-b bg-gray-50"
            style={{ display: "grid", gridTemplateColumns: gridTemplate }}
          >
            <div className="p-4 text-center font-semibold text-gray-500">
              Time
            </div>
            {courts.map((court) => (
              <div key={court.id} className="p-4 text-center border-l">
                <div className="font-bold">{court.name}</div>
                <div className="text-xs uppercase text-green-600">
                  {court.type}
                </div>
              </div>
            ))}
          </div>

          {timeSlots.map((time) => (
            <div
              key={time}
              className="border-b"
              style={{ display: "grid", gridTemplateColumns: gridTemplate }}
            >
              <div className="p-4 text-center text-gray-500">{time}</div>

              {courts.map((court) => {
                const status = getSlotStatus(time, court.id);

                return (
                  <div key={court.id + time} className="p-2 border-l">
                    {status === "past" && (
                      <div className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs">
                        Past
                      </div>
                    )}
                    {status === "booked" && (
                      <div className="w-full h-12 bg-red-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                        Booked
                      </div>
                    )}
                    {status === "available" && (
                      <div className="w-full h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-200 transition">
                        Available
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BookingPage;