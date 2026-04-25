import { create } from 'zustand';
import apiClient from '../api/client';
import socket from '../api/socketClient';

export const useStaffStore = create((set, get) => ({
  liveOrders: [],
  eventBookings: [],
  searchQuery: '',
  selectedTab: 'orders',
  isLoading: false,
  error: null,
  newOrderIds: new Set(),    // IDs of orders that just arrived via socket
  newBookingIds: new Set(),  // IDs of bookings that just arrived via socket

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTab: (tab) => set({ selectedTab: tab }),

  fetchGlobalData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [ordersRes, bookingsRes] = await Promise.all([
        apiClient.get('/api/orders/admin/all'),
        apiClient.get('/api/bookings/admin/all')
      ]);

      set({
        liveOrders: ordersRes.orders,
        eventBookings: bookingsRes.bookings,
        isLoading: false
      });
    } catch (err) {
      set({ error: 'Failed to fetch staff dashboard data', isLoading: false });
      console.error(err);
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const result = await apiClient.patch(`/api/orders/${id}/status`, { status });
      set((state) => ({
        liveOrders: state.liveOrders.map(o => o._id === id ? result.order : o)
      }));
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  },

  updateBookingStatus: async (id, status, notes = '', headcount = null) => {
    try {
      const payload = {};
      if (status) payload.status = status;
      if (notes) payload.notes = notes;
      if (headcount) payload.headcount = headcount;

      const result = await apiClient.patch(`/api/bookings/${id}/status`, payload);
      set((state) => ({
        eventBookings: state.eventBookings.map(b => b._id === id ? result.booking : b)
      }));
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  },

  setupSocketListeners: () => {
    // 1. Join staff room
    socket.emit('join_staff_room');

    // 2. Listen for order events
    socket.off('order_created').on('order_created', (newOrder) => {
      set((state) => ({
        liveOrders: [newOrder, ...state.liveOrders],
        newOrderIds: new Set([...state.newOrderIds, newOrder._id])
      }));
      // Auto-clear the highlight after 4 seconds
      setTimeout(() => {
        set((state) => {
          const updated = new Set(state.newOrderIds);
          updated.delete(newOrder._id);
          return { newOrderIds: updated };
        });
      }, 4000);
    });

    socket.off('order_updated').on('order_updated', (updatedOrder) => {
      set((state) => ({
        liveOrders: state.liveOrders.map(o => o._id === updatedOrder._id ? updatedOrder : o)
      }));
    });

    // 3. Listen for booking events
    socket.off('booking_created').on('booking_created', (newBooking) => {
      set((state) => ({
        eventBookings: [newBooking, ...state.eventBookings],
        newBookingIds: new Set([...state.newBookingIds, newBooking._id])
      }));
      setTimeout(() => {
        set((state) => {
          const updated = new Set(state.newBookingIds);
          updated.delete(newBooking._id);
          return { newBookingIds: updated };
        });
      }, 4000);
    });

    socket.off('booking_updated').on('booking_updated', (updatedBooking) => {
      set((state) => ({
        eventBookings: state.eventBookings.map(b => b._id === updatedBooking._id ? updatedBooking : b)
      }));
    });
  }
}));
