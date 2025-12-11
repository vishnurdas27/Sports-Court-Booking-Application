import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/', 
});


export const fetchCourts = () => API.get('/courts');

export const checkAvailability = (data) => API.post('/bookings/check', data);
export const createBooking = (data) => API.post('/bookings', data); 
export const fetchBookingsByDate = (dateStr) => API.get(`/bookings?date=${dateStr}`);
export const calculatePricePreview = (data) => API.post('/bookings/price-preview', data);

export const fetchCoaches = () => API.get('/coaches');
export const fetchEquipment = () => API.get('/equipment');

export const createCourt = (data, token) => API.post('/courts', data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const deleteCourt = (id, token) => API.delete(`/courts/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
export const updateCourtStatus = (id, data, token) => API.put(`/admin/courts/${id}`, data, {
  headers: { Authorization: `Bearer ${token}` }
});


export const fetchAllBookings = (token) => API.get('/bookings/all', {
  headers: { Authorization: `Bearer ${token}` }
});


export const fetchRules = (token) => API.get('/admin/rules', {
  headers: { Authorization: `Bearer ${token}` }
});
export const createRule = (data, token) => API.post('/admin/rules', data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const deleteRule = (id, token) => API.delete(`/admin/rules/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});


export const createEquipment = (data, token) => API.post('/admin/equipment', data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const deleteEquipment = (id, token) => API.delete(`/admin/equipment/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});


export const createCoach = (data, token) => API.post('/admin/coaches', data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const deleteCoach = (id, token) => API.delete(`/admin/coaches/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});

export default API;