import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 minutes (increased for mobile/slow networks)
  withCredentials: true, // allow cookies (important for CSRF flows)
});

/**
 * Ensure we have a CSRF token cookie and set it as a default header for axios
 * Uses the double-submit cookie pattern: backend sets cookie and returns token
 */
export async function initCsrf() {
  try {
    const res = await axiosInstance.get('/api/csrf-token', { timeout: 5000 });
    const token = res?.data?.csrf;
    if (token) {
      axiosInstance.defaults.headers['X-XSRF-TOKEN'] = token;
      console.log('✅ CSRF token initialized successfully');
      
      // Debug: Check if cookie was actually set
      const cookies = document.cookie;
      const hasCsrfCookie = cookies.includes('XSRF-TOKEN');
      console.log('CSRF cookie present in document.cookie:', hasCsrfCookie);
      
      if (!hasCsrfCookie) {
        console.warn('⚠️ CSRF cookie not found in document.cookie - Safari may be blocking it');
        console.warn('Current cookies:', cookies);
        console.warn('User-Agent:', navigator.userAgent);
      }
    } else {
      console.warn('No CSRF token received from server');
    }
  } catch (e) {
    // Non-blocking - CSRF endpoint may not be reachable on first load
    // eslint-disable-next-line no-console
    console.warn('Unable to initialize CSRF token', e?.message || e);
  }
}

/**
 * Refresh CSRF token - useful before critical operations or if token becomes stale
 */
export async function refreshCsrf() {
  return initCsrf();
}

// Add response interceptor to handle CSRF errors
let isRefreshingCsrf = false;
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If we get a 403 CSRF error and haven't already retried, refresh token and retry
    if (error.response?.status === 403 && 
        error.response?.data?.detail?.includes('CSRF') &&
        !originalRequest._retry &&
        !isRefreshingCsrf) {
      
      originalRequest._retry = true;
      isRefreshingCsrf = true;
      
      try {
        console.log('⚠️ CSRF token invalid, refreshing...');
        console.log('Error details:', {
          cookie_present: error.response?.data?.cookie_present,
          header_present: error.response?.data?.header_present,
          user_agent: navigator.userAgent
        });
        
        await initCsrf();
        isRefreshingCsrf = false;
        
        console.log('🔄 Retrying original request with new CSRF token');
        // Retry the original request with new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshingCsrf = false;
        console.error('❌ Failed to refresh CSRF token:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { axiosInstance };
