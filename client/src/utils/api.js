import axios from 'axios';

// Create axios instance pointing at backend
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vt_token');
      localStorage.removeItem('vt_user');
      // Redirect only if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
