import axios, { type InternalAxiosRequestConfig } from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const verificationRequired =
      error.response?.status === 403 &&
      error.response?.data?.message === 'Email verification required';
    const requestUrl = typeof error.config?.url === 'string' ? error.config.url : '';
    const isAuthRequest = requestUrl.includes('/api/auth/');

    if (
      verificationRequired &&
      !isAuthRequest &&
      window.location.pathname !== '/verify-email'
    ) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as { email?: string };
          if (user.email) {
            sessionStorage.setItem('pendingVerificationEmail', user.email);
          }
        } catch {
          // The existing authentication error handling remains responsible for invalid local state.
        }
      }
      window.location.assign('/verify-email');
    }

    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default API;
