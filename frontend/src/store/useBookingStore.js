import { create } from 'zustand';
import apiClient from '../api/client';
import socket from '../api/socketClient';
import useAuthStore from './authStore';

export const useBookingStore = create((set, get) => ({
  // Wizard State
  wizardStep: 1,
  isLoading: false,
  error: null,
  draft: {
    date: '',
    time: '',
    headcount: 1,
    eventName: '',
    contactNumber: '',
    dietaryPreference: 'No Preference',
    selectedMealIds: [],
    note: '',
  },

  // Backend Synced Bookings
  userBookings: [],

  // Actions
  setStep: (step) => set({ wizardStep: step }),
  
  updateDraft: (data) => set((state) => ({ 
    draft: { ...state.draft, ...data } 
  })),

  toggleMealSelection: (mealId) => set((state) => {
    const ids = [...state.draft.selectedMealIds];
    const index = ids.indexOf(mealId);
    if (index > -1) {
      ids.splice(index, 1);
    } else {
      ids.push(mealId);
    }
    return { draft: { ...state.draft, selectedMealIds: ids } };
  }),

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await apiClient.get('/api/bookings');
      set({ userBookings: result.bookings, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch bookings', isLoading: false });
    }
  },

  submitBooking: async () => {
    set({ isLoading: true, error: null });
    const { draft } = get();
    try {
      const result = await apiClient.post('/api/bookings', draft);
      
      set((state) => ({
        userBookings: [result.booking, ...state.userBookings],
        isLoading: false,
        wizardStep: 1, // Reset wizard on success
        draft: {
          date: '',
          time: '',
          headcount: 1,
          eventName: '',
          contactNumber: '',
          dietaryPreference: 'No Preference',
          selectedMealIds: [],
          note: '',
        }
      }));
      return result.booking;
    } catch (err) {
      set({ error: 'Could not submit booking. Please try again.', isLoading: false });
      throw err;
    }
  },

  updateBookingStatus: async (id, newStatus) => {
    try {
      const result = await apiClient.patch(`/api/bookings/${id}/status`, { status: newStatus });
      set((state) => ({
        userBookings: state.userBookings.map((b) => 
          (b._id === id || b.id === id) ? result.booking : b
        )
      }));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  },

  activateBooking: async (id, transactionId) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.post(`/api/bookings/${id}/activate`, { transactionId });
      set((state) => ({
        userBookings: state.userBookings.map((b) => 
          (b._id === id || b.id === id) ? result.booking : b
        ),
        isLoading: false
      }));
      return result.booking;
    } catch (err) {
      console.error('Failed to activate booking:', err);
      set({ isLoading: false });
      throw err;
    }
  },

  resetWizard: () => set({ 
    wizardStep: 1,
    draft: {
      date: '',
      time: '',
      headcount: 1,
      eventName: '',
      contactNumber: '',
      dietaryPreference: 'No Preference',
      selectedMealIds: [],
      note: '',
    }
  }),

  setupSocketListeners: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // 1. Join personal room
    socket.emit('join_personal_room', user.id);

    // 2. Listen for booking updates
    socket.off('booking_updated').on('booking_updated', (updatedBooking) => {
      set((state) => ({
        userBookings: state.userBookings.map(b => 
          (b._id === updatedBooking._id || b.id === updatedBooking._id) ? updatedBooking : b
        )
      }));
    });
  }
}));
