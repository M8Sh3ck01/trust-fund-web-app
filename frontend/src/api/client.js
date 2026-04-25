import axios from 'axios';
import useAuthStore from '../store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  // Critical for passing the HttpOnly session cookie across origins (or with proxy)
  withCredentials: true, 
  timeout: 10000,
});

// Response interceptor for catching global errors (401, 403, 500)
apiClient.interceptors.response.use(
  (response) => {
    // Return only the payload portion to simplify callers (result.data.user -> result.user)
    return response.data.data;
  },
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred';

    if (status === 401) {
      // SCENARIO: Session expired or user not logged in
      console.warn('Unauthorized! Redirecting to login...');
      
      // Clear local auth state via the store (no API call to logout, no redirect yet)
      useAuthStore.getState().logout(false, false);

      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } 
    
    else if (status === 403) {
      // SCENARIO: Authenticated but lacking specific role permission (RBAC failure)
      console.error(`🚫 Access Denied (403): ${errorMessage}`);
      // Display a user-friendly notification or alert
      alert(`Permission Denied: ${errorMessage}`);
    }

    else if (status >= 500) {
      // SCENARIO: Backend crash or maintenance
      console.error(`💥 Server Error (5xx): ${errorMessage}`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
