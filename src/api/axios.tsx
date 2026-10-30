import axios, { type InternalAxiosRequestConfig } from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const isAdminRequest = typeof config.url === 'string' && config.url.startsWith('/api/admin');
  const isAdminAuthRequest = isAdminRequest && config.url?.startsWith('/api/admin/auth');
  const token = localStorage.getItem(isAdminRequest && !isAdminAuthRequest ? 'adminToken' : 'token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = typeof error.config?.url === 'string' ? error.config.url : '';
    const isAdminRequest = requestUrl.startsWith('/api/admin');
    const isAdminSessionRequest = isAdminRequest && !requestUrl.startsWith('/api/admin/auth');
    const verificationRequired =
      error.response?.status === 403 &&
      error.response?.data?.message === 'Email verification required';
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

    if (error.response?.status === 401 && (isAdminSessionRequest ? localStorage.getItem('adminToken') : localStorage.getItem('token'))) {
      if (isAdminSessionRequest) {
        localStorage.removeItem('adminToken');
        if (window.location.pathname !== '/admin') window.location.assign('/admin');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default API;
