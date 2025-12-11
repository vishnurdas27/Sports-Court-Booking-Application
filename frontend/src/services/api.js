import axios from 'axios';

// Create the Axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/', // Make sure this matches your backend port
});

// --- PUBLIC ROUTES ---

// Courts
export const fetchCourts = () => API.get('/courts');

// Bookings
export const checkAvailability = (data) => API.post('/bookings/check', data);
export const createBooking = (data) => API.post('/bookings', data); // This expects the token inside 'data' headers if needed, or handled separately
export const fetchBookingsByDate = (dateStr) => API.get(`/bookings?date=${dateStr}`);
export const calculatePricePreview = (data) => API.post('/bookings/price-preview', data);

// Options (for Booking Modal)
export const fetchCoaches = () => API.get('/coaches');
export const fetchEquipment = () => API.get('/equipment');


// --- ADMIN ROUTES (Protected) ---
// These functions require the User's Token to be passed in the headers

// 1. Manage Courts
export const createCourt = (data, token) => API.post('/courts', data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const deleteCourt = (id, token) => API.delete(`/courts/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
export const updateCourtStatus = (id, data, token) => API.put(`/admin/courts/${id}`, data, {
  headers: { Authorization: `Bearer ${token}` }
});

// 2. Manage Bookings
export const fetchAllBookings = (token) => API.get('/bookings/all', {
  headers: { Authorization: `Bearer ${token}` }
});

// 3. Manage Pricing Rules
export const fetchRules = (token) => API.get('/admin/rules', {
  headers: { Authorization: `Bearer ${token}` }
});
export const createRule = (data, token) => API.post('/admin/rules', data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const deleteRule = (id, token) => API.delete(`/admin/rules/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});

// 4. Manage Equipment Inventory
export const createEquipment = (data, token) => API.post('/admin/equipment', data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const deleteEquipment = (id, token) => API.delete(`/admin/equipment/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});

// 5. Manage Coaches
export const createCoach = (data, token) => API.post('/admin/coaches', data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const deleteCoach = (id, token) => API.delete(`/admin/coaches/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});

export default API;