// frontend/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/', // Point to your backend
});

// Courts
export const fetchCourts = () => API.get('/courts');

// Bookings
export const checkAvailability = (data) => API.post('/bookings/check', data);
export const createBooking = (data) => API.post('/bookings', data);
export const fetchBookingsByDate = (dateStr) => API.get(`/bookings?date=${dateStr}`);
export const calculatePricePreview = (data) => API.post('/bookings/price-preview', data); // <--- ADD THIS

// Add the Coach and Equipment fetches for the modal (you still need to create these controllers!)
export const fetchCoaches = () => API.get('/coaches');
export const fetchEquipment = () => API.get('/equipment');

export default API;