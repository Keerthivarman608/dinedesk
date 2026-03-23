// Centralized API module for DineDesk
const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('dinedesk_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(API + endpoint, {
    ...options,
    headers,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

// Auth
export const login = (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const register = (name, email, password, role) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) });
export const googleLogin = (credential) => request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) });

// User
export const updateProfile = (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Restaurants
export const getRestaurants = () => request('/restaurants');
export const createRestaurant = (data) => request('/restaurants', { method: 'POST', body: JSON.stringify(data) });
export const getOwnerRestaurants = (ownerId) => request(`/restaurants/owner/${ownerId}`);

// Bookings
export const createBooking = (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) });
export const getUserBookings = (userId) => request(`/bookings/user/${userId}`);
export const getRestaurantBookings = (restaurantId) => request(`/bookings/restaurant/${restaurantId}`);
export const updateBookingStatus = (id, status) => request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const updateBooking = (id, data) => request(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBooking = (id) => request(`/bookings/${id}`, { method: 'DELETE' });

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
