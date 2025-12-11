import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  Loader, 
  Clock, 
  MapPin,
  User
} from "lucide-react";
import { format, addDays, subDays, isBefore } from "date-fns";
import { fetchCourts, fetchBookingsByDate } from "../services/api";
import BookingModal from "../components/BookingModal"; 

const BookingPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayBookings, setDayBookings] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // 1. Fetch Courts on Mount
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

  // 2. Fetch Bookings when Date Changes
  const loadBookings = async () => {
    try {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const { data } = await fetchBookingsByDate(dateStr);
      setDayBookings(data);
    } catch (error) {
      console.error("Failed to load bookings", error);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentDate]);

  // 3. Logic to Handle "Available" Click
  const handleSlotClick = (timeStr, court) => {
    const [slotHour] = timeStr.split(":").map(Number);
    
    // Create start time object based on selected date and slot
    const slotStart = new Date(currentDate);
    slotStart.setHours(slotHour, 0, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotHour + 1);

    setBookingDetails({
      court: court,
      startTime: slotStart,
      endTime: slotEnd,
      timeStr: timeStr
    });
    setIsModalOpen(true);
  };

  // 4. Determine Slot Status (Past/Booked/Available)
  const getSlotStatus = (timeStr, courtId) => {
    const [slotHour] = timeStr.split(":").map(Number);
    const now = new Date();
    
    // Create the date object for the specific slot time
    const slotDate = new Date(currentDate);
    slotDate.setHours(slotHour, 0, 0, 0);

    // Check if past
    if (isBefore(slotDate, now)) return "past";

    // Check if booked
    const isBooked = dayBookings.some((booking) => {
      if (booking.courtId !== courtId) return false;
      
      // --- ROBUST TIMEZONE FIX ---
      // We manually shift the UTC time from DB to IST to get the correct hour integer
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

  // --- RENDERING ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-600">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin w-8 h-8 mb-4 text-emerald-600" />
          <p className="text-sm font-medium">Loading Schedule...</p>
        </div>
      </div>
    );
  }

  const gridTemplate = `100px repeat(${courts.length}, minmax(220px, 1fr))`;
  const timeSlots = [];
  for (let hour = 6; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-1.5 rounded-md">
              <Trophy className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">BookMyCourt</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">BOOKING SCHEDULE</p>
            </div>
          </div>
          
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
        
        {/* Navigation Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm p-1">
            <button 
              onClick={handlePrevDay}
              className="p-2 bg-white hover:bg-gray-50 rounded-md text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 flex flex-col items-center min-w-[180px]">
              <span className="text-sm font-bold text-slate-900">
                {format(currentDate, "MMMM d, yyyy")}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {format(currentDate, "EEEE")}
              </span>
            </div>
            <button 
              onClick={handleNextDay}
              className="p-2 bg-white hover:bg-gray-50 rounded-md text-slate-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 rounded-md shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600 font-medium">Available</span>
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-md shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-slate-600 font-medium">Booked</span>
             </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
          <div className="overflow-auto flex-1 custom-scrollbar">
            <div 
              className="grid"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {/* Header Row: Time Label */}
              <div className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200 p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center sticky-left-col">
                <Clock className="w-4 h-4 mr-1.5" /> Time
              </div>
              
              {/* Header Row: Court Names */}
              {courts.map((court) => (
                <div 
                  key={court.id} 
                  className="sticky top-0 z-10 bg-white border-b border-l border-gray-200 p-4 min-w-[220px] shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">{court.name}</span>
                    <MapPin className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      court.type === 'indoor' 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                        : 'bg-orange-50 text-orange-700 border-orange-100'
                    } uppercase tracking-wide`}>
                      {court.type}
                    </span>
                  </div>
                </div>
              ))}

              {/* Grid Body */}
              {timeSlots.map((time) => (
                <React.Fragment key={time}>
                  {/* Time Column */}
                  <div className="sticky left-0 z-10 bg-white border-b border-r border-gray-200 p-3 text-xs font-medium text-slate-500 flex items-start justify-center pt-5 sticky-left-col">
                    {time}
                  </div>

                  {/* Slot Cells */}
                  {courts.map((court) => {
                    const status = getSlotStatus(time, court.id);

                    return (
                      <div 
                        key={`${court.id}-${time}`} 
                        className="p-2 border-b border-r border-gray-100 last:border-r-0 min-h-[80px]"
                      >
                        {status === "past" && (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md opacity-70">
                            <span className="text-xs text-gray-400 font-medium italic">Past Time</span>
                          </div>
                        )}
                        
                        {status === "booked" && (
                          <div className="w-full h-full flex items-center justify-center bg-red-50 border border-red-200 rounded-md">
                            <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                              Booked
                            </span>
                          </div>
                        )}
                        
                        {status === "available" && (
                          <button 
                            className="group w-full h-full bg-white border border-emerald-200 rounded-md hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-sm active:shadow-md"
                            onClick={() => handleSlotClick(time, court)}
                          >
                            <div className="text-xs font-medium text-emerald-600 transition-colors">
                              Available
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-1 group-hover:translate-y-0">
                              Book Now
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && bookingDetails && (
        <BookingModal 
          details={bookingDetails}
          onClose={() => setIsModalOpen(false)}
          onBookingSuccess={() => {
            setIsModalOpen(false);
            loadBookings(); // Refresh the grid to show the new red box!
          }}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .sticky-left-col {
          position: sticky;
          left: 0;
          z-index: 20; 
          box-shadow: 4px 0 10px -2px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
};

export default BookingPage;