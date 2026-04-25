import { create } from 'zustand';
import apiClient from '../api/client';
import socket from '../api/socketClient';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkSession: async () => {
    set({ isLoading: true });
    try {
      // Interceptor now unwraps response.data automatically
      const result = await apiClient.get('/auth/me');
      set({
        user: result.user,
        isAuthenticated: !!result.user, // Only true if user exists
        isLoading: false,
      });
      // Ensure socket is connected if we have a valid session
      if (result.user && !socket.connected) {
        socket.connect();
      }
    } catch (error) {
      // On error (like 401), ensure state reflects user is not logged in
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  logout: async (callApi = true, redirect = true) => {
    if (callApi) {
      try {
        await apiClient.get('/auth/logout');
      } catch (err) {
        console.error("Failed to notify backend of logout", err);
      }
    }
    // Finalize logout by disconnecting real-time tunnel
    socket.disconnect();
    
    set({ user: null, isAuthenticated: false });
    if (redirect) {
      window.location.href = '/';
    }
  },
}));

export default useAuthStore;
