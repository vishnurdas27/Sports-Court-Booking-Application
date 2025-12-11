import React, { useState, useEffect } from 'react';
import { 
  X, Clock, MapPin,  Plus, Minus, User, 
  Volleyball, CheckCircle, Loader, AlertCircle, 
  IndianRupee
} from 'lucide-react';
import { format } from 'date-fns';

import { 
  calculatePricePreview, 
  createBooking, 
  fetchCoaches, 
  fetchEquipment 
} from '../services/api';

import { useAuth } from '../Context/AuthContext';

const BookingModal = ({ details, onClose, onBookingSuccess }) => {
  const { user } = useAuth();   
  const [coaches, setCoaches] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedCoachId, setSelectedCoachId] = useState(null);
  const [equipmentQuantities, setEquipmentQuantities] = useState({});
  const [pricePreview, setPricePreview] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

 
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [coachRes, equipRes] = await Promise.all([
          fetchCoaches(),
          fetchEquipment()
        ]);
        setCoaches(coachRes.data || []);
        setEquipment(equipRes.data || []);
      } catch (err) {
        console.error("Failed loading coaches/equipment:", err);
      }
    };
    loadOptions();
  }, []);

// PRICE PREVIEW //
  useEffect(() => {
    if (!details) return;

    const getPrice = async () => {
      setCalculating(true);

      const equipmentList = Object.entries(equipmentQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({ id: Number(id), quantity: qty }));

      const startLocal = format(details.startTime, "yyyy-MM-dd'T'HH:mm:ss");
      const endLocal = format(details.endTime, "yyyy-MM-dd'T'HH:mm:ss");

      try {
        const res = await calculatePricePreview({
          courtId: details.court.id,
          startTime: startLocal,
          endTime: endLocal,
          coachId: selectedCoachId,
          equipmentList
        });

        setPricePreview(res.data);
      } catch (err) {
        console.error("Price preview failed:", err);
      } finally {
        setCalculating(false);
      }
    };

    const t = setTimeout(getPrice, 250);
    return () => clearTimeout(t);

  }, [selectedCoachId, equipmentQuantities, details]);

//BOOKING SUBMIT //
  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in to book!");
      return;
    }

    setIsSubmitting(true);

    const equipmentList = Object.entries(equipmentQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ id: Number(id), quantity: qty }));

    const startLocal = format(details.startTime, "yyyy-MM-dd'T'HH:mm:ss");
    const endLocal = format(details.endTime, "yyyy-MM-dd'T'HH:mm:ss");

    try {
      await createBooking({
        userId: user.id,        
        courtId: details.court.id,
        startTime: startLocal,
        endTime: endLocal,
        coachId: selectedCoachId,
        equipmentList
      });

      onBookingSuccess();
      onClose();

    } catch (error) {
      alert(error.response?.data?.message || "Booking failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // HANDLE EQUIPMENT//
  const updateQty = (id, delta) => {
    setEquipmentQuantities(prev => {
      const current = prev[id] || 0;
      return { ...prev, [id]: Math.max(0, current + delta) };
    });
  };

  if (!details) return null;

  /* ------------------------------ UI ------------------------------ */
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Complete Booking</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">

          {/* COURT INFO */}
          <div className="bg-emerald-50 p-4 rounded-lg flex gap-4 border">
            <MapPin className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="font-bold text-lg">{details.court.name}</p>
              <p className="text-sm text-slate-600">
                {format(details.startTime, "MMM d, yyyy")} — {details.timeStr}
              </p>
            </div>
          </div>

          {/* COACH */}
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Select a Coach
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedCoachId(null)}
                className={`p-3 border rounded-lg text-sm font-medium ${
                  selectedCoachId === null ? "bg-gray-800 text-white" : "bg-white"
                }`}>
                No Coach
              </button>

              {coaches.map(coach => (
                <button 
                  key={coach.id}
                  onClick={() => setSelectedCoachId(coach.id)}
                  className={`p-3 border rounded-lg text-sm ${
                    selectedCoachId === coach.id ? "bg-indigo-600 text-white shadow-md" : "bg-white"
                  }`}>
                  {coach.name}
                  <div className="text-xs mt-1 opacity-80">₹{coach.hourleyRate}/hr</div>
                </button>
              ))}
            </div>
          </div>
              {/* EQUIPMENT*/}
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Volleyball className="w-4 h-4 text-orange-600" /> Rent Equipment
            </h4>

            {equipment.map(item => (
              <div key={item.id} className="flex justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-900">₹{item.pricePerUnit} / unit</p>
                </div>

                <div className="flex items-center gap-3 bg-white border rounded-full px-3 py-1">
                  <button 
                    className="text-white disabled:opacity-20"
                    onClick={() => updateQty(item.id, -1)}
                    disabled={!equipmentQuantities[item.id]}>
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="font-bold">{equipmentQuantities[item.id] || 0}</span>

                  <button 
                    onClick={() => updateQty(item.id, 1)}
                    className="text-white">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pricePreview?.breakdown?.modifiers?.length > 0 && (
            <div className="bg-yellow-50 border p-3 rounded text-xs">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              <strong>Active Pricing Rules:</strong>
              <ul className="list-disc ml-5 mt-1">
                {pricePreview.breakdown.modifiers.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* FOOTER */}
        {/* FOOTER */}
        <div className="p-5 border-t bg-gray-50 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Total</p>
            <div className="flex items-center text-2xl font-extrabold">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              {/* CHANGE .total TO .totalPrice */}
              {calculating ? "..." : (pricePreview?.totalPrice || 0)} 
            </div>
          </div>

          <button
            disabled={isSubmitting || calculating}
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg font-bold disabled:bg-gray-300">
            {isSubmitting ? <Loader className="animate-spin w-5 h-5" /> : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
