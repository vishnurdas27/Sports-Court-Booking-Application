import React, { useState, useEffect } from "react";
import { 
  X, Clock, MapPin, Plus, User, 
  Volleyball, CheckCircle, Loader, Minus 
} from "lucide-react";
import { format } from "date-fns"; // ✅ Ensure date-fns is installed

import { 
  calculatePricePreview, 
  createBooking, 
  fetchCoaches, 
  fetchEquipment 
} from "../services/api";

const BookingModal = ({ details, onClose, onBookingSuccess }) => {
  const [coaches, setCoaches] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedCoachId, setSelectedCoachId] = useState(null);
  const [equipmentQuantities, setEquipmentQuantities] = useState({});
  const [pricePreview, setPricePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⚠️ TEMP: Hardcoded User ID (Replace with real Auth later)
  const currentUserId = 1; 

  // 1. Fetch Coaches & Equipment on Mount
  useEffect(() => {
    const loadModalData = async () => {
      try {
        const [coachesRes, equipmentRes] = await Promise.all([
          fetchCoaches(),
          fetchEquipment()
        ]);
        setCoaches(coachesRes.data || []);
        setEquipment(equipmentRes.data || []);
      } catch (err) {
        console.error("Failed loading coaches/equipment:", err);
      }
    };
    loadModalData();
  }, []);

  // 2. Real-time Price Preview
  useEffect(() => {
    if (!details) return;

    const getPrice = async () => {
      const equipmentList = Object.entries(equipmentQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({ id: Number(id), quantity: qty }));

      // ✅ FIX: Format date as Local String (YYYY-MM-DDTHH:mm:ss)
      // This prevents the browser from converting "10:00" to "04:30" (UTC)
      const startLocal = format(details.startTime, "yyyy-MM-dd'T'HH:mm:ss");
      const endLocal = format(details.endTime, "yyyy-MM-dd'T'HH:mm:ss");

      try {
        const { data } = await calculatePricePreview({
          courtId: details.court.id,
          startTime: startLocal, 
          endTime: endLocal,
          coachId: selectedCoachId,
          equipmentList: equipmentList
        });
        setPricePreview(data);
      } catch (err) {
        console.error("Price preview failed:", err);
      }
    };

    getPrice();
  }, [selectedCoachId, equipmentQuantities, details]);

  // 3. Submit Booking
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const equipmentList = Object.entries(equipmentQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ id: Number(id), quantity: qty }));

    // ✅ FIX: Send Local Time String
    const startLocal = format(details.startTime, "yyyy-MM-dd'T'HH:mm:ss");
    const endLocal = format(details.endTime, "yyyy-MM-dd'T'HH:mm:ss");

    try {
      await createBooking({
        userId: currentUserId,
        courtId: details.court.id,
        startTime: startLocal,
        endTime: endLocal,
        coachId: selectedCoachId,
        equipmentList
      });
      
      onBookingSuccess(); 
      onClose(); 
    } catch (err) {
      alert("Booking Failed: " + (err.response?.data?.message || "Server error"));
      setIsSubmitting(false); 
    } 
  };

  const updateQuantity = (itemId, delta) => {
    setEquipmentQuantities((prev) => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + delta); 
      return { ...prev, [itemId]: newQty };
    });
  };

  if (!details) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Confirm Your Booking</h3>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition shadow-sm border">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Court Info */}
          <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-lg text-emerald-900">{details.court.name}</p>
              <div className="flex items-center gap-2 text-emerald-700 mt-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {format(details.startTime, "h:mm a")} - {format(details.endTime, "h:mm a")}
                </span>
              </div>
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                {format(details.startTime, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Coaches */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" /> 
              Select a Coach <span className="text-gray-400 text-sm font-normal">(Optional)</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {coaches.length > 0 ? (
                coaches.map((coach) => (
                  <button
                    key={coach.id}
                    onClick={() => setSelectedCoachId(selectedCoachId === coach.id ? null : coach.id)}
                    className={`p-3 rounded-lg border text-sm text-left transition-all ${
                      selectedCoachId === coach.id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200"
                        : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    <div className="font-bold">{coach.name}</div>
                    <div className={`text-xs mt-1 ${selectedCoachId === coach.id ? "text-indigo-100" : "text-gray-500"}`}>
                      +₹{coach.hourleyRate}/hr
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic col-span-2">No coaches available.</p>
              )}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Volleyball className="w-5 h-5 text-orange-600" /> 
              Rent Equipment <span className="text-gray-400 text-sm font-normal">(Optional)</span>
            </h4>
            <div className="space-y-3">
              {equipment.length > 0 ? (
                equipment.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border border-gray-100 p-3 rounded-lg bg-white shadow-sm hover:border-orange-200 transition">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">₹{item.pricePerUnit} / unit</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border">
                      <button className="w-8 h-8 flex items-center justify-center rounded-md bg-white border shadow-sm" onClick={() => updateQuantity(item.id, -1)} disabled={!equipmentQuantities[item.id]}>
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="font-bold w-4 text-center">{equipmentQuantities[item.id] || 0}</span>
                      <button className="w-8 h-8 flex items-center justify-center rounded-md bg-orange-500 text-white shadow-sm hover:bg-orange-600" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No equipment available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50 border-t flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Amount</p>
            <span className="text-2xl font-extrabold text-emerald-700">
              ₹{pricePreview ? pricePreview.total : "..."}
            </span>
          </div>
          <button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-bold shadow-lg disabled:opacity-70">
            {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : <>Confirm & Pay <CheckCircle className="w-5 h-5" /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;