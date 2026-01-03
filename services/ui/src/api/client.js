import axios from 'axios';

// Get API URL from environment (Docker/Vite) or default to relative path
const API_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor: Handle 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      console.warn("Unauthorized! Clearing token and logging out.");
      localStorage.removeItem('access_token');
      
      // Dispatch a custom event so App.jsx can react immediately
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(error);
  }
);

export const handleApiError = (err) => {
  if (err.message === "Network Error") return "NETWORK_ERROR";
  return err.response?.data?.detail || err.response?.data?.error || "An unexpected error occurred.";
};