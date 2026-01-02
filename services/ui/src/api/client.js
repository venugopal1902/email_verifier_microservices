const API_URL = 'http://localhost'; // Configure via import.meta.env.VITE_API_URL in prod

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const handleApiError = (err) => {
  console.error("API Error:", err);
  if (err.message === "Network Error") return "NETWORK_ERROR";
  return err.response?.data?.detail || "An unexpected error occurred.";
};