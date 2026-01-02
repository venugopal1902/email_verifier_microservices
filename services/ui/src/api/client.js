import axios from 'axios';

// CHANGED: Default to empty string (relative path) so it works on any port (80, 8080, etc.)
const API_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const handleApiError = (err) => {
  console.error("API Error:", err);
  if (err.message === "Network Error") return "NETWORK_ERROR";
  return err.response?.data?.detail || "An unexpected error occurred.";
};