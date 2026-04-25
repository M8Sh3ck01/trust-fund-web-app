import { create } from 'zustand';
import apiClient from '../api/client';
import socket from '../api/socketClient';
import useAuthStore from './authStore';

export const useOrderStore = create((set, get) => ({
  activeOrders: [],
  pastOrders: [],
  isLoading: false,
  error: null,

  /**
   * fetchOrders - Hydrates the store from the backend API.
   */
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      // Use Promise.all to ensure the loader stays for at least 600ms (UX best practice)
      const [result] = await Promise.all([
        apiClient.get('/api/orders'),
        new Promise(resolve => setTimeout(resolve, 600))
      ]);
      
      const orders = result?.orders || [];
      const ACTIVE_STATUSES = ['Requested', 'Preparing', 'Ready'];
      
      set({
        activeOrders: orders.filter(o => o && ACTIVE_STATUSES.includes(o.status)),
        pastOrders: orders.filter(o => o && !ACTIVE_STATUSES.includes(o.status)),
        isLoading: false
      });
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      set({ 
        error: 'Failed to load your orders', 
        isLoading: false,
        activeOrders: [],
        pastOrders: []
      });
    }
  },

  setupSocketListeners: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // 1. Join personal room
    socket.emit('join_personal_room', user.id);

    // 2. Listen for status updates
    socket.off('order_updated').on('order_updated', (updatedOrder) => {
      const ACTIVE_STATUSES = ['Requested', 'Preparing', 'Ready'];
      const isActive = ACTIVE_STATUSES.includes(updatedOrder.status);

      set((state) => {
        // Remove from current list if status changed significantly, or update in place
        const newActive = isActive 
          ? state.activeOrders.map(o => o._id === updatedOrder._id ? updatedOrder : o)
          : state.activeOrders.filter(o => o._id !== updatedOrder._id);
        
        const newPast = !isActive
          ? [updatedOrder, ...state.pastOrders.filter(o => o._id !== updatedOrder._id)]
          : state.pastOrders.filter(o => o._id !== updatedOrder._id);

        // Ensure consistency if it was a new active order not yet in list
        if (isActive && !state.activeOrders.find(o => o._id === updatedOrder._id)) {
           newActive.unshift(updatedOrder);
        }

        return {
          activeOrders: newActive,
          pastOrders: newPast
        };
      });
    });
  },

  /**
   * addOrder - Persists a new cash/regular order to the backend.
   */
  addOrder: async (cartItems, total, transactionId) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.post('/api/orders', {
        items: cartItems,
        totalAmount: total,
        paymentMode: 'Cash',
        transactionId
      });
      
      const newOrder = result.order;
      set((state) => ({
        activeOrders: [newOrder, ...state.activeOrders],
        isLoading: false
      }));
      return newOrder;
    } catch (err) {
      console.error('Failed to create order:', err);
      set({ isLoading: false });
      throw err;
    }
  },

  /**
   * addRedemptionOrder - Handles subscriber credit redemptions.
   */
  addRedemptionOrder: async (meal, quantity) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.post('/api/orders', {
        items: [{ meal, quantity }],
        paymentMode: 'Credit'
      });
      
      const newOrder = result.order;
      set((state) => ({
        activeOrders: [newOrder, ...state.activeOrders],
        isLoading: false
      }));
      return newOrder;
    } catch (err) {
      console.error('Failed to redeem meal:', err);
      set({ isLoading: false });
      throw err;
    }
  },
}));

