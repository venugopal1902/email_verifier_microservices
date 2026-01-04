import axios from 'axios';

// Use empty string to allow Nginx to proxy requests (e.g. /api/auth/...)
const API_URL = '';

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

// Response Interceptor: Handle 401s (Token Expiry)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Clearing token.");
      localStorage.removeItem('access_token');
      // Dispatch event for App.jsx to handle logout
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(error);
  }
);

export const handleApiError = (err) => {
  if (err.message === "Network Error") return "NETWORK_ERROR";
  return err.response?.data?.detail || err.response?.data?.error || "An unexpected error occurred.";
};