/**
 * @file useUserStore.js
 * @description Manages global user profile, dietary preferences, and account UI state.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/client';

export const useUserStore = create(
  persist(
    (set, get) => ({
      // UI State
      isSettingsOpen: false,

      // Profile State
      profile: {
        name: 'Guest User',
        phone: '',
        membership: 'Gold', 
        isSubscriber: false,
        totalOrders: 0,
        subscriptionBalance: 0,
        subscriptionExpiry: null,
        currentPlan: null, // { months: number, price: number }
      },

      // Preferences
      preferences: {
        dietary: [], // ['Vegetarian', 'Vegan', 'No Beef', etc.]
        theme: 'light',
      },

      // Actions
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      
      updateProfile: (data) => set((state) => ({
        profile: { ...state.profile, ...data }
      })),

      toggleDietaryPreference: (tag) => set((state) => {
        const current = state.preferences.dietary;
        const index = current.indexOf(tag);
        const next = index > -1 
          ? current.filter(t => t !== tag)
          : [...current, tag];
        
        return { preferences: { ...state.preferences, dietary: next } };
      }),


      fetchProfile: async () => {
        try {
          const result = await apiClient.get('/api/users/profile');
          if (result.user) {
            set((state) => ({ 
              profile: { 
                ...state.profile,
                ...result.user,
                // Ensure dietary stays as an array even if backend returns null
                dietary: result.user.dietary || state.profile.dietary || []
              },
              preferences: {
                ...state.preferences,
                dietary: result.user.dietary || state.preferences.dietary || []
              }
            }));
          }
        } catch (err) {
          console.error('Failed to sync profile with server:', err);
        }
      },

      /**
       * activateSubscription - Sends selected tier ID to the backend.
       * All pricing, balance, and expiry are computed server-side.
       * After success, re-fetches the full profile to sync local state.
       */
      activateSubscription: async (tierId, transactionId) => {
        try {
          await apiClient.post('/api/users/subscribe', { tierId, transactionId });
          // Re-fetch profile to sync server-computed values
          await get().fetchProfile();
        } catch (err) {
          console.error('Failed to activate subscription:', err);
          throw err;
        }
      },

    }),
    {
      name: 'trust-fund-user',
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);
