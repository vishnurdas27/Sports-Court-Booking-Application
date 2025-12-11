import axios from 'axios'

const API = axios.create({
    baseURL: 'http://localhost:5000/'
})

export const fetchCourts = () => API.get('/courts')

export const checkAvailability = (data) => API.post('/bookings/check', data)
export const createBooking = (data) => API.post('/bookings',data)
export const fetchBookingsByDate = (dateStr) => API.get(`/bookings?date=${dateStr}`)
export default API